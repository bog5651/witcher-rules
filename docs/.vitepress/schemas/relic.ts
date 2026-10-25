import { z } from 'zod'
import { sourceBookSchema } from './source'

export const relicCategoryIds = [
  'sword',
  'dagger',
  'axe',
  'hammer',
  'spear',
  'staff',
  'bow',
  'crossbow',
  'light-armor',
  'medium-armor',
  'heavy-armor'
] as const

const relicWeaponSchema = z
  .object({
    type: z.string().min(1),
    kind: z.string().min(1),
    accuracy: z.string().min(1),
    damage: z.string().min(1),
    reliability: z.number().int().nonnegative(),
    hands: z.number().int().positive(),
    range: z.string().min(1),
    effects: z.array(z.string().min(1)).min(1),
    concealment: z.string().min(1),
    upgradeSlots: z.number().int().nonnegative(),
    weight: z.number().nonnegative()
  })
  .strict()

const relicArmorSchema = z
  .object({
    kind: z.string().min(1),
    stoppingPower: z.number().int().nonnegative(),
    upgradeSlots: z.number().int().nonnegative(),
    effects: z.array(z.string().min(1)).min(1),
    covers: z.string().min(1),
    defense: z.number().int(),
    weight: z.number().nonnegative()
  })
  .strict()

export const relicSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    kind: z.enum(['weapon', 'armor']),
    category: z.enum(relicCategoryIds),
    sourcePage: z.number().int().positive(),
    sourceBook: sourceBookSchema,
    check: z.string().min(1),
    weapon: relicWeaponSchema.nullable(),
    armor: relicArmorSchema.nullable(),
    description: z.array(z.string().min(1)).min(1),
    extractionNotes: z.array(z.string()).optional()
  })
  .strict()
  .superRefine((relic, ctx) => {
    if (relic.kind === 'weapon' && !relic.weapon) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'у оружия должен быть блок weapon',
        path: ['weapon']
      })
    }
    if (relic.kind === 'armor' && !relic.armor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'у брони должен быть блок armor',
        path: ['armor']
      })
    }
    if (relic.kind === 'weapon' && relic.armor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'у оружия не должно быть блока armor',
        path: ['armor']
      })
    }
    if (relic.kind === 'armor' && relic.weapon) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'у брони не должно быть блока weapon',
        path: ['weapon']
      })
    }
  })

export const relicsFileSchema = z
  .object({
    schemaVersion: z.literal(1),
    items: z.array(relicSchema).length(17)
  })
  .strict()

export type Relic = z.infer<typeof relicSchema>
