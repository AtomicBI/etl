import { Client } from '@elastic/elasticsearch'
import type { IndicesCreateResponse, InfoResponse, WriteResponseBase } from '@elastic/elasticsearch/lib/api/types'

export interface ElasticClientOptions {
  node: string
  username: string
  password: string
}

export class ElasticClient {
  public client: Client

  constructor({ node, username, password }: ElasticClientOptions) {
    this.client = new Client({ node, auth: { username, password } })
  }

  getInfo(): Promise<InfoResponse> {
    return this.client.info()
  }

  indexExists(index: string): Promise<boolean> {
    return this.client.indices.exists({ index })
  }

  createDenseVercorIndex(index: string, dims: number): Promise<IndicesCreateResponse> {
    return this.client.indices.create({ index, mappings: { properties: { embedding: { type: 'dense_vector', dims } } } })
  }

  index<T>(index: string, id: string, document: T): Promise<WriteResponseBase> {
    return this.client.index<T>({ index, id, document })
  }
}
