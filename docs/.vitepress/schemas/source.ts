import { z } from 'zod'

export const bookIdSchema = z.enum([
  'witcher-core',
  'catalog-weapons-v2',
  'catalog-armor-v2',
  'catalog-alchemy-v2',
  'alzur-tome-of-magic',
  'magic-gifts-excerpt',
  'unofficial-bestiary',
  'professional-tools',
  'witcher-gear',
  'tome-of-chaos'
])

export const sourceBookSchema = bookIdSchema.optional()

export const sourceFields = {
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
}
