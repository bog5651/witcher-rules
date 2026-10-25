import { z } from 'zod'
import { availabilitySchema } from './weapon'
import { sourceBookSchema } from './source'

export const bombSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  radius: z.string().min(1),
  damage: z.string().min(1),
  effect: z.string().min(1),
  description: z.string().min(1).optional(),
  availability: availabilitySchema,
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const trapSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  radius: z.string().min(1),
  damage: z.string().min(1),
  effect: z.string().min(1),
  availability: availabilitySchema,
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const bombsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(bombSchema)
})

export const trapsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(trapSchema)
})

export type Bomb = z.infer<typeof bombSchema>
export type Trap = z.infer<typeof trapSchema>
