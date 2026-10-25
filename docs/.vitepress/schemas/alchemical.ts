import { z } from 'zod'
import { availabilitySchema } from './weapon'
import { sourceBookSchema } from './source'

export const alchemicalCategorySchema = z.enum([
  'composition',
  'weak-elixir',
  'witcher-elixir',
  'oil',
  'decoction'
])

export const alchemicalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: alchemicalCategorySchema.optional(),
  availability: availabilitySchema,
  effect: z.string().min(1),
  duration: z.string().min(1).optional(),
  toxicity: z.string().min(1).optional(),
  description: z.string().optional(),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  priceNote: z.string().min(1).optional(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const alchemicalsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(alchemicalSchema)
})

export type Alchemical = z.infer<typeof alchemicalSchema>
export type AlchemicalCategory = z.infer<typeof alchemicalCategorySchema>
