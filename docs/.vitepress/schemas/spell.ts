import { z } from 'zod'

export const spellLevelSchema = z.enum(['novice', 'adept', 'master'])
export const spellElementSchema = z.enum(['mixed', 'earth', 'air', 'fire', 'water'])

export const spellSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  level: spellLevelSchema,
  element: spellElementSchema,
  cost: z.number().int().nonnegative(),
  costVariable: z.boolean(),
  effect: z.string().min(1),
  range: z.string().min(1),
  duration: z.string().min(1),
  defense: z.string().min(1),
  sourcePage: z.number().int().positive()
})

export const spellsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(spellSchema)
})

export type Spell = z.infer<typeof spellSchema>
export type SpellLevel = z.infer<typeof spellLevelSchema>
export type SpellElement = z.infer<typeof spellElementSchema>
