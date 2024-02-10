import { Readable, Writable } from 'stream'
import { Artifact, ArtifactHandle, ArtifactInsert } from './Artifact'

export interface Adapter {
  name: string
  list(): Promise<(ArtifactHandle)[]>
  read(file: Artifact): Promise<Buffer>
  readStream(file: Artifact): Promise<Readable>
  write(file: ArtifactInsert, data: string | Buffer): Promise<void>
  writeStream(file: ArtifactInsert): Promise<Writable>
}
