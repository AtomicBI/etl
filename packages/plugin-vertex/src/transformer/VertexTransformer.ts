import { TransformerFn, streamToString } from '@atomicbi/etl'
import { VertexClient } from '../client/VertexClient'

export interface VertexTransformerOptions {
  projectId: string
}

export function VertexTransformer({ projectId }: VertexTransformerOptions): TransformerFn {
  const client = new VertexClient({ projectId })
  return async (context) => {
    const readStream = await context.readStream()
    const text = await streamToString(readStream, 'utf-8')
    const embeddings = await client.getEmbeddings(text)
    const result = JSON.stringify(embeddings)
    console.info('result', result)
  }
}
