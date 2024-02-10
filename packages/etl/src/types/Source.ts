import { Readable } from 'stream'
import { ArtifactInsert } from './Artifact'

export interface Source {
  name: string
  list(): Promise<ArtifactInsert[]>
  readStream(file: ArtifactInsert): Promise<Readable>
}
