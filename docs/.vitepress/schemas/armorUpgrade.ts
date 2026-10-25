import { z } from 'zod'
import { availabilitySchema } from './weapon'
import { sourceBookSchema } from './source'

export const armorUpgradeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  effect: z.string(),
  description: z.string().optional(),
  protectionBonus: z.number().int().nonnegative(),
  resistances: z.array(z.enum(['Д', 'Р', 'К'])),
  availability: availabilitySchema,
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const armorUpgradesFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(armorUpgradeSchema)
})

export type ArmorUpgrade = z.infer<typeof armorUpgradeSchema>
