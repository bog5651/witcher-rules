import { z } from 'zod'
import { sourceBookSchema } from './source'

export const artifactKindSchema = z.enum(['relic', 'weapon', 'armor', 'focus'])

export const artifactStatSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1)
})

export const artifactSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: artifactKindSchema,
  category: z.string().min(1),
  effect: z.string().min(1),
  description: z.array(z.string().min(1)).min(1),
  stats: z.array(artifactStatSchema),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const artifactsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(artifactSchema)
})

export type Artifact = z.infer<typeof artifactSchema>
export type ArtifactKind = z.infer<typeof artifactKindSchema>
