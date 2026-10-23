import { z } from 'zod'

export const skillAttributeSchema = z.enum([
  'int',
  'ref',
  'dex',
  'body',
  'emp',
  'craft',
  'will'
])

export const skillSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  attribute: skillAttributeSchema,
  complex: z.boolean(),
  summary: z.string().min(1),
  sourcePage: z.number().int().positive()
})

export const skillsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(skillSchema)
})

export type Skill = z.infer<typeof skillSchema>
