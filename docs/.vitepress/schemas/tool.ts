import { z } from 'zod'
import { availabilitySchema, concealmentSchema } from './weapon'
import { sourceBookSchema } from './source'

export const toolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  effect: z.string().min(1),
  description: z.string().optional(),
  availability: availabilitySchema,
  concealment: concealmentSchema,
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const toolsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(toolSchema)
})

export type Tool = z.infer<typeof toolSchema>
