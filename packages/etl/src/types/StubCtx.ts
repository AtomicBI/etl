import { ArtifactInsert } from './Artifact'

export interface StubCtx {
  artifacts: Record<string, ArtifactInsert>
  buffers: Record<string, Buffer>
}
