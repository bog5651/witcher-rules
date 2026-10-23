import { z } from 'zod'
import { availabilitySchema } from './weapon'

export const alchemicalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  availability: availabilitySchema,
  effect: z.string().min(1),
  description: z.string().optional(),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive()
})

export const alchemicalsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(alchemicalSchema)
})

export type Alchemical = z.infer<typeof alchemicalSchema>
