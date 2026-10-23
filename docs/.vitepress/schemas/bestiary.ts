import { z } from 'zod'

export const bestiaryClassIds = [
  'humanoids',
  'cursed',
  'corpse-eaters',
  'hybrids',
  'spirits',
  'insectoids',
  'beasts',
  'elementals',
  'relicts',
  'ogres',
  'dragonids',
  'vampires'
] as const

const attributesSchema = z
  .object({
    int: z.number().int(),
    rea: z.number().int(),
    dex: z.number().int(),
    body: z.number().int(),
    speed: z.number().int(),
    emp: z.number().int(),
    craft: z.number().int(),
    will: z.number().int(),
    luck: z.number().int()
  })
  .strict()

const derivedSchema = z
  .object({
    stun: z.number().int(),
    run: z.number().int(),
    jump: z.number().int(),
    stamina: z.number().int().nullable(),
    carry: z.number().int(),
    rest: z.number().int(),
    hp: z.number().int(),
    energy: z.number().int()
  })
  .strict()

const sizeSchema = z
  .object({
    height: z.string().nullable(),
    weight: z.string().nullable(),
    habitat: z.string().nullable(),
    intellect: z.string().nullable(),
    population: z.string().nullable()
  })
  .strict()

const skillSchema = z
  .object({
    name: z.string().min(1),
    value: z.number().int()
  })
  .strict()

const abilitySchema = z
  .object({
    name: z.string().min(1),
    description: z.string().min(1)
  })
  .strict()

const weaponSchema = z
  .object({
    name: z.string().min(1),
    damage: z.string().min(1),
    effect: z.string().min(1),
    attackCost: z.number().int().nonnegative()
  })
  .strict()

const lootSchema = z
  .object({
    name: z.string().min(1),
    formula: z.string().nullable()
  })
  .strict()

const vulnerabilitySchema = z
  .object({
    name: z.string().min(1),
    description: z.string()
  })
  .strict()

const variantSchema = z
  .object({
    name: z.string().min(1),
    armor: z.number().int().nonnegative(),
    attributes: attributesSchema,
    derived: derivedSchema,
    size: sizeSchema,
    skills: z.array(skillSchema).min(1),
    abilities: z.array(abilitySchema),
    weapons: z.array(weaponSchema).min(1),
    loot: z.array(lootSchema).min(1),
    vulnerabilities: z.array(vulnerabilitySchema).min(1)
  })
  .strict()

const flavorSchema = z
  .object({
    check: z.string().min(1),
    quote: z.string().min(1),
    author: z.string().min(1),
    knowledgeCheck: z.string().min(1),
    text: z.array(z.string().min(1)).min(1)
  })
  .strict()

const noteSchema = z
  .object({
    title: z.string().min(1),
    text: z.string().min(1)
  })
  .strict()

const extraTableSchema = z
  .object({
    title: z.string().min(1),
    columns: z.array(z.string().min(1)).min(2),
    rows: z.array(z.array(z.string().min(1))).min(1)
  })
  .strict()
  .superRefine((table, ctx) => {
    table.rows.forEach((row, index) => {
      if (row.length !== table.columns.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `строка ${index + 1} не совпадает по длине с колонками`,
          path: ['rows', index]
        })
      }
    })
  })

export const bestiaryEntrySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    classId: z.enum(bestiaryClassIds),
    statPage: z.number().int().positive(),
    descriptionPage: z.number().int().positive().nullable(),
    difficulty: z
      .object({
        overall: z.enum(['simple', 'medium', 'complex']),
        tier: z.enum(['ordinary', 'unremarkable', 'hard'])
      })
      .strict()
      .nullable(),
    reward: z.number().int().nonnegative().nullable(),
    variants: z.array(variantSchema).min(1),
    flavor: flavorSchema.nullable(),
    notes: z.array(noteSchema),
    extraTables: z.array(extraTableSchema),
    extractionNotes: z.array(z.string()).optional()
  })
  .strict()

export const bestiaryClassSchema = z
  .object({
    id: z.enum(bestiaryClassIds),
    name: z.string().min(1),
    description: z.string().min(1)
  })
  .strict()

export const bestiaryFileSchema = z
  .object({
    schemaVersion: z.literal(1),
    classes: z.array(bestiaryClassSchema).length(12),
    monsters: z.array(bestiaryEntrySchema).length(20),
    animals: z.array(bestiaryEntrySchema).length(8)
  })
  .strict()
  .superRefine((data, ctx) => {
    data.monsters.forEach((entry, index) => {
      if (!entry.descriptionPage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'у чудовища должна быть страница описания',
          path: ['monsters', index, 'descriptionPage']
        })
      }
      if (!entry.difficulty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'у чудовища должна быть сложность',
          path: ['monsters', index, 'difficulty']
        })
      }
      if (entry.reward === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'у чудовища должна быть награда',
          path: ['monsters', index, 'reward']
        })
      }
      if (!entry.flavor) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'у чудовища должно быть описание',
          path: ['monsters', index, 'flavor']
        })
      }
    })

    data.animals.forEach((entry, index) => {
      if (entry.classId !== 'beasts') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'животное должно относиться к классу beasts',
          path: ['animals', index, 'classId']
        })
      }
    })
  })

export type BestiaryEntry = z.infer<typeof bestiaryEntrySchema>
export type BestiaryClass = z.infer<typeof bestiaryClassSchema>
export type BestiaryVariant = z.infer<typeof variantSchema>
