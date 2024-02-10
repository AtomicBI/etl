import { ContentType, Pipeline, StubAdapter, StubSource } from '../index'

async function main() {
  const pipeline = new Pipeline({ name: 'example', adapter: StubAdapter() })
  await pipeline.delete().eq('sourceType', 'stub')
  await pipeline.import(StubSource())
  await pipeline
    .transform('btoa', async (context) => {
      const data = await context.readString()
      await context.write(btoa(data), ContentType.PLAIN)
    })
    .transform('atob', async (context) => {
      const data = await context.readString('btoa')
      await context.write(atob(data), ContentType.JSON)
    })
    .run()
}

main()
