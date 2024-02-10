import { Readable } from 'stream'
import { ArtifactInsert } from '../types/Artifact'
import { ContentType } from '../types/ContentType'
import { Source } from '../types/Source'
import { StubCtx } from '../types/StubCtx'
import { md5, uuid } from '../util/crypto'

export interface StubSourceOptions {
  numFiles: number
  generateFile: (file: ArtifactInsert, index: number) => ArtifactInsert
  generateData: (file: ArtifactInsert, index: number) => Buffer
  ctx: StubCtx
}

const DEFAULTS: StubSourceOptions = {
  numFiles: 10,
  generateFile: (file) => { file.contentType = ContentType.JSON; return file },
  generateData: ({ id, name }) => Buffer.from(JSON.stringify({ id, name })),
  ctx: { artifacts: {}, buffers: {} }
}

export function StubSource(options: Partial<StubSourceOptions> = {}): Source {
  const { numFiles, generateFile, generateData, ctx }: StubSourceOptions = { ...DEFAULTS, ...options }
  return {
    name: 'stub',
    async list() {
      for (let index = 0; index < numFiles; index += 1) {
        const id = uuid(String(index))
        const file = generateFile({
          id,
          type: 'source',
          name: `File ${index + 1}`,
          contentType: ContentType.OTHER,
          sourceType: 'stub',
          size: 0,
          hash: ''
        }, index)
        const buffer = generateData(file, index)
        ctx.buffers[id] = generateData(file, index)
        ctx.artifacts[id] = { ...file, hash: md5(buffer), size: buffer.byteLength }
      }
      return Object.values(ctx.artifacts)
    },
    async readStream(file) {
      const buffer = ctx.buffers[file.id]
      return Readable.from(buffer)
    }
  }
}
