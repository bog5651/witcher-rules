import { z } from 'zod'
import { availabilitySchema } from './weapon'
import { sourceBookSchema } from './source'

export const ammoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  availability: availabilitySchema,
  reliability: z.number().int().nonnegative(),
  effect: z.string().min(1),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  elderfolk: z.boolean(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const weaponUpgradeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  availability: availabilitySchema,
  effect: z.string().min(1),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const ammoFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(ammoSchema)
})

export const weaponUpgradesFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(weaponUpgradeSchema)
})

export type Ammo = z.infer<typeof ammoSchema>
export type WeaponUpgrade = z.infer<typeof weaponUpgradeSchema>
