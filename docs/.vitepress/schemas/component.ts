import { z } from 'zod'
import { availabilitySchema } from './weapon'
import { sourceBookSchema } from './source'

export const componentCategorySchema = z.enum(['crafting', 'animal', 'alchemical', 'metal'])

export const componentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: componentCategorySchema,
  availability: availabilitySchema,
  where: z.string().min(1),
  quantity: z.string().min(1),
  gatheringDC: z.number().int().nonnegative().nullable(),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const componentsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(componentSchema)
})

export type ComponentItem = z.infer<typeof componentSchema>
