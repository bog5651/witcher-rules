import { z } from 'zod'
import { availabilitySchema, concealmentSchema } from './weapon'

export const toolSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  effect: z.string().min(1),
  availability: availabilitySchema,
  concealment: concealmentSchema,
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive()
})

export const toolsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(toolSchema)
})

export type Tool = z.infer<typeof toolSchema>
