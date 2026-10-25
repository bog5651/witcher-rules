import { z } from 'zod'
import { sourceBookSchema } from './source'

export const schematicCategorySchema = z.enum([
  'component',
  'weapon',
  'armor',
  'upgrade',
  'enchantment',
  'explosive'
])
export const schematicLevelSchema = z.enum(['novice', 'adept', 'master', 'grandmaster'])
export const schematicOriginSchema = z.enum(['common', 'elder'])

export const schematicComponentSchema = z.object({
  name: z.string().min(1),
  count: z.number().int().positive()
})

export const schematicSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: schematicCategorySchema,
  level: schematicLevelSchema,
  origin: schematicOriginSchema,
  dc: z.number().int().positive(),
  time: z.string().min(1),
  components: z.array(schematicComponentSchema).min(1),
  surcharge: z.number().int().nonnegative(),
  price: z.number().int().nonnegative(),
  priceNote: z.string().min(1).optional(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const schematicsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(schematicSchema)
})

export type Schematic = z.infer<typeof schematicSchema>
