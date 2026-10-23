import { z } from 'zod'

export const criticalInjurySeveritySchema = z.enum(['light', 'medium', 'heavy', 'deadly'])

export const criticalInjurySchema = z.object({
  id: z.string().min(1),
  severity: criticalInjurySeveritySchema,
  roll: z.string().min(1),
  name: z.string().min(1),
  effect: z.string().min(1),
  stabilized: z.string().min(1),
  healed: z.string().min(1),
  sourcePage: z.number().int().positive()
})

export const criticalInjuriesFileSchema = z.object({
  schemaVersion: z.literal(1),
  items: z.array(criticalInjurySchema)
})

export type CriticalInjury = z.infer<typeof criticalInjurySchema>
