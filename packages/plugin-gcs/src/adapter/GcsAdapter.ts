import { Adapter, md5, uuid } from '@atomicbi/etl'
import { Storage } from '@google-cloud/storage'
import { basename } from 'path'

export interface GcsAdapterOptions {
  projectId: string
  bucket: string
}

export function GcsAdapter(options: GcsAdapterOptions): Adapter {
  const client = new Storage({ projectId: options.projectId })
  const bucket = client.bucket(options.bucket)
  return {
    name: 'gcs',
    async list() {
      const [files] = await bucket.getFiles({ matchGlob: '**/*', maxResults: 1000 })
      return files.map((file) => ({
        id: uuid(file.id!),
        hash: md5(file.id!),
        name: basename(file.name),
        size: +(file.metadata.size ?? 0),
        contentType: file.metadata.contentType ?? 'application/octet-stream',
        sourceType: 'gcs',
        sourceId: file.id!
      }))
    },
    async readStream(file) {
      return bucket.file(file.id!).createReadStream()
    },
    async writeStream(file) {
      return bucket.file(file.id!).createWriteStream({ contentType: file.contentType! })
    },
    async read(file) {
      const [response] = await bucket.file(file.id!).download()
      return response
    },
    async write(file, data) {
      return bucket.file(file.id!).save(data, { contentType: file.contentType! })
    }
  }
}
