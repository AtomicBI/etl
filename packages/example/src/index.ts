import { Pipeline } from '@atomicbi/etl'
import { DriveSource } from '@atomicbi/etl-plugin-drive'
import { GcsAdapter } from '@atomicbi/etl-plugin-gcs'
import { TikaTransformer } from '@atomicbi/etl-plugin-tika'
import { google } from 'googleapis'
import { homedir } from 'os'
import { join } from 'path'

async function main() {
  const pipeline = new Pipeline({
    name: 'example',
    adapter: GcsAdapter({ projectId: 'atomicbi', bucket: 'atomicai' })
  })

  await pipeline.import(DriveSource({
    root: '1lph9ybj4fpVUY_uZMHqCJ3hKEaGPCQfN',
    auth: new google.auth.GoogleAuth({
      keyFile: join(homedir(), 'gcloud-service-account.json'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly']
    })
  }))

  await pipeline
    .transformer('tika', TikaTransformer)
    .run()
}

main()
