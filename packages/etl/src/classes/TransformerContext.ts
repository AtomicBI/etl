import { Pipeline } from '../classes/Pipeline'
import { Artifact, ArtifactInsert, ArtifactSource } from '../types/Artifact'
import { ContentType } from '../types/ContentType'
import { uuid } from '../util/crypto'

export class TransformerContext {
  public dirty = false
  public artifact: ArtifactInsert

  constructor(public type: string, public file: ArtifactSource, private pipeline: Pipeline) {
    const artifact = this.getArtifact(type)
    if (artifact) {
      this.artifact = artifact
    } else {
      this.artifact = {
        id: uuid(`${file.id}:${type}`),
        type,
        name: file.name,
        hash: file.hash,
        size: file.size,
        contentType: ContentType.OTHER,
        sourceType: file.sourceType,
        sourceId: file.id
      }
      this.file.artifacts.push(this.artifact as Artifact)
    }
  }

  // Get Artifact
  getArtifact(type: string): Artifact | undefined {
    return this.file.artifacts.find((artifact) => artifact.type === type)
  }

  // Read File
  readStream(type?: string) { return this.pipeline.adapter.readStream(this.handle(type)) }
  readBuffer(type?: string) { return this.pipeline.adapter.read(this.handle(type)) }
  readString(type?: string) { return this.readBuffer(type).then((buffer) => buffer.toString('utf-8')) }
  readJson<T = unknown>(type?: string): Promise<T> { return this.readString(type).then((data) => JSON.parse(data)) }

  // Write to Target
  writeStream(contentType = ContentType.OTHER) {
    this.dirty = true
    this.artifact.contentType = contentType
    return this.pipeline.adapter.writeStream(this.artifact)
  }

  write(data: Buffer | string, contentType = ContentType.OTHER) {
    this.dirty = true
    this.artifact.contentType = contentType
    return this.pipeline.adapter.write(this.artifact, data)
  }

  private handle(type?: string): Artifact {
    if (type) {
      const artifact = this.getArtifact(type)
      if (!artifact) { throw new Error('File not founde') }
      return artifact
    } else {
      return this.file
    }
  }
}
