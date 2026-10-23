import { z } from 'zod'

const professionEquipmentSchema = z.object({
  choose: z.number().int().positive(),
  items: z.array(z.string().min(1)).min(1)
})

const professionFixedEquipmentSchema = z.object({
  title: z.string().min(1),
  items: z.array(z.string().min(1)).min(1)
})

const professionSkillNoteSchema = z.object({
  title: z.string().min(1),
  text: z.string().min(1),
  items: z.array(z.string().min(1)).min(1)
})

const professionDefiningSkillSchema = z.object({
  name: z.string().min(1),
  attribute: z.string().min(1),
  description: z.string().min(1)
})

export const professionSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    sourcePage: z.number().int().positive(),
    quote: z.string().min(1),
    quoteAuthor: z.string().min(1),
    definingSkill: professionDefiningSkillSchema,
    energy: z.number().int().nonnegative(),
    magicAbilities: z.array(z.string().min(1)),
    skills: z.array(z.string().min(1)).min(1).max(10),
    skillNote: professionSkillNoteSchema.nullable(),
    equipment: professionEquipmentSchema,
    fixedEquipment: professionFixedEquipmentSchema.nullable()
  })
  .superRefine((profession, ctx) => {
    if (profession.equipment.choose > profession.equipment.items.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'нельзя выбрать больше предметов, чем есть в списке',
        path: ['equipment', 'choose']
      })
    }
  })

export const professionsFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(professionSchema).length(9)
})

export type Profession = z.infer<typeof professionSchema>
