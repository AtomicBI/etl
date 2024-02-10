import fetch from 'node-fetch'
import { Readable, Writable } from 'stream'

export function pipeAsync(readStream: Readable, writeStream: Writable) {
  return new Promise<void>((resolve, reject) => {
    readStream
      .on('end', () => { resolve() })
      .on('error', (error) => { reject(error) })
      .pipe(writeStream)
  })
}

export async function streamFromUrl(url: string): Promise<Readable> {
  const response = await fetch(url)
  return new Readable().wrap(response.body)
}

export function stringToStream(data: string): Readable {
  const readStream = new Readable()
  readStream.push(data)
  readStream.push(null)
  return readStream
}

export function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

export function streamToString(stream: Readable, encoding: BufferEncoding = 'utf-8') {
  return streamToBuffer(stream).then((buffer) => buffer.toString(encoding))
}
