import { z } from 'zod'

export const gearCategorySchema = z.enum([
  'standard',
  'containers',
  'food',
  'clothing',
  'services',
  'lodging'
])

export const gearSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: gearCategorySchema,
  weight: z.number().nonnegative().nullable(),
  price: z.number().int().nonnegative().nullable(),
  priceNote: z.string().min(1).optional(),
  description: z.string().optional(),
  sourcePage: z.number().int().positive()
})

export const gearFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(gearSchema)
})

export type Gear = z.infer<typeof gearSchema>
