import { helpers, protos, v1 } from '@google-cloud/aiplatform'

export type IPredictResponse = protos.google.cloud.aiplatform.v1.IPredictResponse

export type IValue = protos.google.protobuf.IValue

export interface Embeddings {
  statistics: {
    token_cound: number
    truncated: boolean
  }
  values: number[]
}

export interface VertexOptions {
  projectId: string
  location: 'us-central1'
  publisher: 'google'
  model: 'textembedding-gecko@001'
  apiEndpoint: string
}

export const VERTEX_OPTIONS_DEFAULTS: Pick<VertexOptions, 'location' | 'publisher' | 'model' | 'apiEndpoint'> = {
  location: 'us-central1',
  publisher: 'google',
  model: 'textembedding-gecko@001',
  apiEndpoint: 'us-central1-aiplatform.googleapis.com'
}

export class VertexClient {
  private options: VertexOptions
  private client: v1.PredictionServiceClient

  constructor(options: Partial<VertexOptions> & Pick<VertexOptions, 'projectId'>) {
    this.options = { ...VERTEX_OPTIONS_DEFAULTS, ...options }
    this.client = new v1.PredictionServiceClient({ apiEndpoint: this.options.apiEndpoint })
  }

  async getEmbeddings(content: string): Promise<Embeddings> {
    const { projectId, location, publisher, model } = this.options
    const [response] = await this.client.predict({
      endpoint: `projects/${projectId}/locations/${location}/publishers/${publisher}/models/${model}`,
      instances: [helpers.toValue({ content }) as protobuf.common.IValue],
      parameters: helpers.toValue({ temperature: 0, maxOutputTokens: 256, topP: 0, topK: 1 })
    })
    if (!response.predictions || response.predictions.length === 0) { throw new Error('Unable to retrieve predictions') }
    const prediction: IValue = response.predictions[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = helpers.fromValue(prediction as any) as { embeddings: Embeddings }
    return result.embeddings
  }
}
