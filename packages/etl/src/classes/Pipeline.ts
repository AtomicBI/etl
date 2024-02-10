import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { Adapter } from '../types/Adapter'
import { Artifact, ArtifactInsert, ArtifactSource } from '../types/Artifact'
import { Source } from '../types/Source'
import { Database } from '../types/Supabase'
import { pipeAsync } from '../util/stream'
import { ConfigStore } from './ConfigStore'
import { TransformerContext } from './TransformerContext'

export interface TransformerPlugin {
  create: (store: ConfigStore) => TransformerFn
  keys: string[]
}

export type TransformerFn = (context: TransformerContext) => Promise<void>
export type Transformer = { type: string; run: TransformerFn }

export interface PipelineOptions {
  name: string
  adapter: Adapter
  store?: ConfigStore
}

export class Pipeline {
  public name: string
  public adapter: Adapter
  public transformers: Transformer[] = []
  public sources: ArtifactSource[] = []
  public store: ConfigStore
  public database: SupabaseClient<Database>

  constructor({ name, adapter, store }: PipelineOptions) {
    this.name = name
    this.adapter = adapter
    this.store = store ?? ConfigStore.env()
    this.database = createClient<Database>(this.store.string('SUPABASE_URL'), this.store.string('SUPABASE_KEY'))
  }

  transformer(type: string, { keys, create }: TransformerPlugin): this {
    const missingKeys = keys.filter((key) => !this.store.has(key))
    if (missingKeys.length > 0) { throw new Error(`Missing config keys: ${missingKeys.join(', ')}`) }
    const run = create(this.store)
    this.transformers.push({ type, run })
    return this
  }

  transform(type: string, run: TransformerFn): this {
    this.transformers.push({ type, run })
    return this
  }

  async import(source: Source): Promise<ArtifactInsert[]> {
    // Synchronize Files
    const artifacts = await source.list()
    const { data: sourceArtifacts } = await this.database.from('artifacts').select('*').eq('type', 'source')
    if (!sourceArtifacts) { throw new Error('Unable to load source artifacts') }
    const result = await Promise.all(artifacts.filter((artifact) => {
      const sourceArtifact = sourceArtifacts.find(({ id }) => id === artifact.id)
      return !sourceArtifact || sourceArtifact.hash !== artifact.hash
    }).map(async (artifact) => {
      console.info(`~> importing ${artifact.id}`)
      const [readSteam, writeStream] = await Promise.all([
        source.readStream(artifact),
        this.adapter.writeStream(artifact)
      ])
      await pipeAsync(readSteam, writeStream)
      await this.database.from('artifacts').upsert(artifact)
      return artifact
    }))
    return result
  }

  async run() {
    console.info(`running pipeline '${this.name}'`)
    const response = await this.database.from('artifacts').select('*, artifacts(*)')
      .eq('type', 'source')
      .throwOnError()
    if (!response.data) { throw response.error ?? new Error('Unable to load source artifacts') }
    this.sources = response.data.map<ArtifactSource>(({ artifacts, ...source }) => {
      return { ...source, artifacts: artifacts ?? [] } as ArtifactSource
    })
    for (const transformer of this.transformers) {
      await this.runTransformer(transformer, this)
    }
  }

  delete() {
    return this.database.from('artifacts').delete()
  }

  private async runTransformer({ type, run }: Transformer, pipeline: Pipeline): Promise<void> {
    // Filter Files
    pipeline.sources[0]
    const files = pipeline.sources.filter((source) => {
      const artifact = source.artifacts.find((entry) => entry.type === type)
      return !artifact || artifact.hash !== source.hash
    })

    // Transform Files
    console.info(`[${type}] transforming ${files.length} of ${pipeline.sources.length} files`)
    await Promise.all(files.map(async (file) => {
      const ctx = new TransformerContext(type, file, pipeline)
      await run(ctx)
      if (ctx.dirty) {
        const artifact = { ...ctx.artifact, hash: file.hash } as Artifact
        await pipeline.database.from('artifacts').upsert(artifact)
        const index = file.artifacts.findIndex(({ id }) => artifact.id === id)
        if (index !== -1) {
          file.artifacts[index] = artifact
        } else {
          file.artifacts.push(artifact)
        }
      }
    }))
  }
}
