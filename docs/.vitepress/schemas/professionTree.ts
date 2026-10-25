import { z } from 'zod'
import { sourceBookSchema } from './source'

export const professionTreeAbilitySchema = z.object({
  rank: z.string().min(1),
  name: z.string().min(1),
  attribute: z.string().nullable(),
  description: z.string().min(1)
})

export const professionTreeBranchSchema = z.object({
  name: z.string().min(1),
  abilities: z.array(professionTreeAbilitySchema).length(3)
})

export const professionTreeExtraSchema = z.object({
  title: z.string().min(1),
  columns: z.array(z.string().min(1)).min(2),
  rows: z.array(z.array(z.string().min(1))).min(1)
})

export const professionTreeNoteSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1)
})

export const professionTreeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sourcePage: z.number().int().positive(),
  sourceBook: sourceBookSchema,
  definingSkill: z.object({
    name: z.string().min(1),
    attribute: z.string().nullable(),
    description: z.string().min(1)
  }),
  branches: z.array(professionTreeBranchSchema).length(3),
  extras: z.array(professionTreeExtraSchema),
  notes: z.array(professionTreeNoteSchema)
})

export const professionTreesFileSchema = z.object({
  schemaVersion: z.literal(1),
  professions: z.array(professionTreeSchema).min(9)
})

export type ProfessionTree = z.infer<typeof professionTreeSchema>
