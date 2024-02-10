import dotenv from 'dotenv'
import { readFileSync } from 'fs'

export class ConfigStore {
  static env() {
    const store: Record<string, string> = {}
    dotenv.config({ processEnv: store })
    return new ConfigStore(store)
  }

  static json(path: string) {
    return new ConfigStore(JSON.parse(readFileSync(path, 'utf-8')))
  }

  constructor(public store: Record<string, string> = {}) { }

  has(key: string) {
    return key in this.store
  }

  string(key: string) { return this.store[key] }
  int(key: string) { return parseInt(this.string(key), 10) }
  float(key: string) { return parseFloat(this.string(key)) }

  stringArray(key: string) { return this.string(key).split(',') }
  intArray(key: string) { return this.string(key).split(',').map((value) => parseInt(value, 10)) }
  floatArray(key: string) { return this.string(key).split(',').map((value) => parseFloat(value)) }
}
