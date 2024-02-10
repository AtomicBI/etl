import { createHash } from 'crypto'
import { v5 } from 'uuid'

export function md5(data: string | Buffer) {
  return createHash('md5').update(data).digest('hex')
}

export function uuid(data: string): string {
  return v5(data, 'da4f6db5-e328-4227-ba0b-00e15a942877')
}
