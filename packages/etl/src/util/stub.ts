import { writeFileSync } from 'fs'
import { emptyDirSync, ensureDirSync } from 'fs-extra'
import { join } from 'path'
import { ContentType, Extension } from '../types/ContentType'
import { StubCtx } from '../types/StubCtx'

export function writeStubFiles(rootDir: string, { artifacts, buffers }: StubCtx) {
  emptyDirSync(rootDir)
  for (const { id, sourceId, contentType, type } of Object.values(artifacts)) {
    const dirname = join(rootDir, type)
    ensureDirSync(dirname)
    const extension = Extension[contentType as ContentType]
    const filename = join(dirname, `${sourceId ?? id}.${extension}`)
    writeFileSync(filename, buffers[id])
  }
}
