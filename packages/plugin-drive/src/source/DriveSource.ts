import { ArtifactInsert, ContentType, Source, md5, uuid } from '@atomicbi/etl'
import { GlobalOptions, drive } from '@googleapis/drive'

export interface DriveSourceOptions {
  root: string
  auth: GlobalOptions['auth']
}

export function DriveSource({ root, auth }: DriveSourceOptions): Source {
  const client = drive({ version: 'v3', auth })
  const mimeTypes = [ContentType.DOCX, ContentType.PDF, ContentType.PLAIN, ContentType.FOLDER]

  async function recursiveListFiles(parent: string) {
    const result: ArtifactInsert[] = []
    const response = await client.files.list({
      q: `('${parent}' in parents) and (${mimeTypes.map((mimeType) => `mimeType = '${mimeType}'`).join(' or ')})`,
      spaces: 'drive',
      fields: 'files(id, kind, mimeType, size, name, md5Checksum)',
      pageSize: 1000
    })
    const files = (response.data.files ?? [])
    for (const file of files) {
      if (file.mimeType === ContentType.FOLDER) {
        const children = await recursiveListFiles(file.id!)
        result.push(...children)
      } else {
        result.push({
          id: uuid(file.id!),
          type: 'source',
          hash: md5(file.md5Checksum!),
          size: +(file.size ?? '0'),
          contentType: file.mimeType ?? 'application/octet-stream',
          sourceType: 'drive',
          name: file.name!,
          externalId: file.id
        })
      }
    }
    return result
  }
  return {
    name: 'drive',
    async list() {
      return recursiveListFiles(root)
    },
    async readStream(file) {
      const { data } = await client.files.get({ fileId: file.externalId!, alt: 'media' }, { responseType: 'stream' })
      return data
    }
  }
}
