import { TransformerFn } from '@atomicbi/etl'
import { ElasticClient } from '../client/ElasticClient'

export interface ElasticTransformerOptions {
  node: string
  username: string
  password: string
}

export function ElasticTransformer({ node, username, password }: ElasticTransformerOptions): TransformerFn {
  const client = new ElasticClient({ node, username, password })
  return async (context) => {
    const data = await context.readString('utf-8')
    console.info(data)
    debugger
  }
}
