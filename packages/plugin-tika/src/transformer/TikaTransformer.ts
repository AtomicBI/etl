import { ContentType, TransformerPlugin } from '@atomicbi/etl'
import { TikaClient } from 'tika-js'

export const TikaTransformer: TransformerPlugin = {
  keys: ['TIKA_HOST'],
  create(store) {
    const client = new TikaClient({ host: store.string('TIKA_HOST') })
    return async (context) => {
      const readStream = await context.readStream()
      const data = await client.getContent(readStream, ContentType.PLAIN, context.file.name!)
      await context.write(data, ContentType.PLAIN)
    }
  }
}
