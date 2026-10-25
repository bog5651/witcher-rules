import { z } from 'zod'
import { sourceBookSchema } from './source'
import { substanceIdSchema } from './substance'

export const formulaLevelSchema = z.enum(['novice', 'adept', 'master'])

export const formulaIngredientSchema = z.object({
  substance: substanceIdSchema,
  count: z.number().int().positive()
})

export const formulaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  level: formulaLevelSchema,
  dc: z.number().int().positive(),
  time: z.string().min(1),
  price: z.number().int().nonnegative(),
  ingredients: z.array(formulaIngredientSchema).min(1),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema,
  effect: z.string().min(1).optional(),
  description: z.string().min(1).optional()
})

export const formulasFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(formulaSchema)
})

export type Formula = z.infer<typeof formulaSchema>
