import { PassThrough, Readable } from 'stream'
import { Adapter } from '../types/Adapter'
import { StubCtx } from '../types/StubCtx'

export function StubAdapter({ artifacts, buffers }: StubCtx = { artifacts: {}, buffers: {} }): Adapter {
  return {
    name: 'stub',
    async list() {
      return Object.values(artifacts)
    },
    async read({ id }) {
      if (!id) { throw new Error('File not found') }
      const buffer = buffers[id]
      if (!buffer) { throw new Error('File not found') }
      return buffer
    },
    async readStream({ id }) {
      if (!id) { throw new Error('File not found') }
      const buffer = buffers[id]
      if (!buffer) { throw new Error('File not found') }
      return Readable.from(buffer)
    },
    async write(file, data) {
      if (!file.id) { throw new Error('File not found') }
      const buffer = typeof data === 'string' ? Buffer.from(data) : data
      buffers[file.id] = buffer
      artifacts[file.id] = file
    },
    async writeStream(file) {
      if (!file.id) { throw new Error('File not found') }
      const parts: Buffer[] = []
      const writeStream = new PassThrough()
      writeStream.on('data', (data) => { parts.push(data) })
      writeStream.on('end', () => {
        buffers[file.id!] = Buffer.concat(parts)
        artifacts[file.id!] = file
      })
      return writeStream
    }
  }
}
