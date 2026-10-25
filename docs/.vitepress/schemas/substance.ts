import { z } from 'zod'
import { availabilitySchema } from './weapon'
import { sourceBookSchema } from './source'

export const substanceIdSchema = z.enum([
  'vitriol',
  'rebis',
  'aether',
  'quebrith',
  'hydragenum',
  'vermilion',
  'sol',
  'caelum',
  'fulgur'
])

export const substanceIngredientSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  substance: substanceIdSchema,
  availability: availabilitySchema,
  where: z.string().min(1),
  quantity: z.string().min(1),
  gatheringDC: z.number().int().nonnegative().nullable(),
  weight: z.number().nonnegative().nullable(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const substancesFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(substanceIngredientSchema)
})

export type SubstanceIngredient = z.infer<typeof substanceIngredientSchema>
