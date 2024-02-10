import { Database } from './Supabase'

export type Artifact = Database['public']['Tables']['artifacts']['Row']
export type ArtifactInsert = Database['public']['Tables']['artifacts']['Insert']
export type ArtifactUpdate = Database['public']['Tables']['artifacts']['Update']
export interface ArtifactSource extends Artifact { artifacts: Artifact[] }
export type ArtifactHandle = Pick<Artifact, 'id' | 'contentType'>
