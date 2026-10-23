import { z } from 'zod'
import { availabilitySchema } from './weapon'

export const vehicleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  athletics: z.string().min(1),
  controlModifier: z.string().min(1),
  speed: z.string().min(1),
  hp: z.number().int().nonnegative(),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive()
})

export const tackCategorySchema = z.enum(['saddles', 'blinkers', 'saddlebags', 'horse-armor'])

export const tackSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: tackCategorySchema,
  availability: availabilitySchema,
  effect: z.string(),
  weight: z.number().nonnegative(),
  price: z.number().int().nonnegative(),
  sourcePage: z.number().int().positive()
})

export const transportFileSchema = z.object({
  schemaVersion: z.literal(1),
  vehicles: z.array(vehicleSchema),
  tack: z.array(tackSchema)
})

export type Vehicle = z.infer<typeof vehicleSchema>
export type Tack = z.infer<typeof tackSchema>
