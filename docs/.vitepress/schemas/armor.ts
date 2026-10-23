import { z } from 'zod'
import { availabilitySchema } from './weapon'

export const armorLocationSchema = z.enum(['head', 'torso', 'legs', 'shield', 'body'])
export const armorWeightClassSchema = z.enum(['light', 'medium', 'heavy'])

export const armorSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: armorLocationSchema,
  coverage: z.string().min(1).optional(),
  weightClass: armorWeightClassSchema,
  protection: z.number().int().nonnegative().nullable(),
  reliability: z.number().int().nonnegative().nullable(),
  availability: availabilitySchema,
  upgradeSlots: z.number().int().nonnegative(),
  effect: z.string(),
  encumbrance: z.number().int().nonnegative(),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  elderfolk: z.boolean(),
  sourcePage: z.number().int().positive()
})

export const armorFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(armorSchema)
})

export type Armor = z.infer<typeof armorSchema>
