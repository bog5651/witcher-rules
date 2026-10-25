import { z } from 'zod'
import { sourceBookSchema } from './source'

export const magicGiftTierSchema = z.enum(['minor', 'major'])

export const magicGiftSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tier: magicGiftTierSchema,
  cost: z.number().int().positive(),
  castDC: z.number().int().positive().nullable(),
  effect: z.string().min(1),
  sideEffect: z.string().min(1),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema
})

export const magicGiftsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(magicGiftSchema)
})

export type MagicGift = z.infer<typeof magicGiftSchema>
export type MagicGiftTier = z.infer<typeof magicGiftTierSchema>
