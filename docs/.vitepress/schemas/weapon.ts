import { z } from 'zod'
import { sourceBookSchema } from './source'

export const availabilitySchema = z.enum(['everywhere', 'common', 'rare', 'unique'])
export const concealmentSchema = z.enum(['tiny', 'small', 'large', 'none'])

export const weaponSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  type: z.string().min(1),
  damageTypes: z.array(z.string().min(1)).min(1),
  accuracy: z.number().int(),
  availability: availabilitySchema,
  damage: z.string().min(1),
  reliability: z.number().int().nonnegative(),
  hands: z.number().int().positive(),
  range: z.string().min(1),
  effects: z.array(z.string()),
  description: z.string().optional(),
  concealment: concealmentSchema,
  upgradeSlots: z.number().int().nonnegative(),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative().nullable(),
  elderfolk: z.boolean(),
  witcher: z.boolean(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const weaponsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(weaponSchema)
})

export type Weapon = z.infer<typeof weaponSchema>
