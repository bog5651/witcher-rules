import { z } from 'zod'

export const levelSchema = z.enum(['novice', 'adept', 'master'])
export const elementSchema = z.enum(['mixed', 'earth', 'air', 'fire', 'water'])
export const traditionSchema = z.enum(['druid', 'preacher', 'archpriest'])
export const dangerSchema = z.enum(['low', 'medium', 'high'])

const base = {
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number().int().nonnegative(),
  costVariable: z.boolean(),
  effect: z.string().min(1),
  sourcePage: z.number().int().positive()
}

export const signSchema = z.object({
  ...base,
  element: elementSchema,
  base: z.boolean(),
  range: z.string().min(1),
  duration: z.string().min(1),
  defense: z.string().min(1)
})

export const invocationSchema = z.object({
  ...base,
  tradition: traditionSchema,
  level: levelSchema.nullable(),
  deity: z.string().nullable(),
  range: z.string().min(1),
  duration: z.string().min(1),
  defense: z.string().min(1)
})

export const ritualSchema = z.object({
  ...base,
  level: levelSchema,
  prepTime: z.string().min(1),
  checkDC: z.string().min(1),
  duration: z.string().min(1),
  ingredients: z.string().min(1),
  alternateIngredients: z.string()
})

export const hexSchema = z.object({
  ...base,
  danger: dangerSchema,
  removal: z.string().min(1)
})

export const signsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(signSchema)
})

export const invocationsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(invocationSchema)
})

export const ritualsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(ritualSchema)
})

export const hexesFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(hexSchema)
})
