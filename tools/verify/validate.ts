import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { z } from 'zod'
import { spellsFileSchema } from '../../docs/.vitepress/schemas/spell'
import {
  hexesFileSchema,
  invocationsFileSchema,
  ritualsFileSchema,
  signsFileSchema
} from '../../docs/.vitepress/schemas/magic'
import { weaponsFileSchema } from '../../docs/.vitepress/schemas/weapon'
import { armorFileSchema } from '../../docs/.vitepress/schemas/armor'
import { alchemicalsFileSchema } from '../../docs/.vitepress/schemas/alchemical'
import { armorUpgradesFileSchema } from '../../docs/.vitepress/schemas/armorUpgrade'
import { transportFileSchema } from '../../docs/.vitepress/schemas/transport'
import { toolsFileSchema } from '../../docs/.vitepress/schemas/tool'
import { gearFileSchema } from '../../docs/.vitepress/schemas/gear'
import { componentsFileSchema } from '../../docs/.vitepress/schemas/component'
import { substancesFileSchema } from '../../docs/.vitepress/schemas/substance'
import { formulasFileSchema } from '../../docs/.vitepress/schemas/formula'
import { schematicsFileSchema } from '../../docs/.vitepress/schemas/schematic'
import { criticalInjuriesFileSchema } from '../../docs/.vitepress/schemas/criticalInjury'
import { skillsFileSchema } from '../../docs/.vitepress/schemas/skill'
import { professionTreesFileSchema } from '../../docs/.vitepress/schemas/professionTree'
import { professionsFileSchema } from '../../docs/.vitepress/schemas/profession'

const root = fileURLToPath(new URL('../..', import.meta.url))
const dataDir = join(root, 'docs', '.vitepress', 'data')

type BaseItem = { id: string; name: string; sourcePage: number }
type FileShape = { items?: BaseItem[]; professions?: BaseItem[] }

let failed = false

function validate(
  name: string,
  file: string,
  schema: z.ZodTypeAny,
  options: { allowDuplicateNames?: boolean } = {}
) {
  const raw = JSON.parse(readFileSync(join(dataDir, file), 'utf8'))
  const parsed = schema.safeParse(raw)

  if (!parsed.success) {
    failed = true
    console.error(`${file} не прошёл валидацию:`)
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    return
  }

  const data = parsed.data as FileShape
  const items = data.items ?? data.professions ?? []
  const ids = new Set<string>()
  const names = new Set<string>()
  const errors: string[] = []

  for (const item of items) {
    if (ids.has(item.id)) errors.push(`повторяющийся id: ${item.id}`)
    if (!options.allowDuplicateNames && names.has(item.name)) {
      errors.push(`повторяющееся название: ${item.name}`)
    }
    if (item.sourcePage < 1 || item.sourcePage > 337) {
      errors.push(`sourcePage вне книги: ${item.name} (${item.sourcePage})`)
    }
    ids.add(item.id)
    names.add(item.name)
  }

  if (errors.length) {
    failed = true
    console.error(`Ошибки в ${file}:`)
    for (const error of errors) console.error(`  - ${error}`)
    return
  }

  console.log(`OK: ${name} — ${items.length}`)
}

validate('заклинания', 'spells.json', spellsFileSchema)
validate('знаки', 'signs.json', signsFileSchema)
validate('инвокации', 'invocations.json', invocationsFileSchema)
validate('ритуалы', 'rituals.json', ritualsFileSchema)
validate('порча', 'hexes.json', hexesFileSchema)
validate('оружие', 'weapons.json', weaponsFileSchema)
validate('броня', 'armor.json', armorFileSchema)
validate('алхимические составы', 'alchemicals.json', alchemicalsFileSchema)
validate('усиления брони', 'armor-upgrades.json', armorUpgradesFileSchema)
validate('инструменты', 'tools.json', toolsFileSchema)
validate('прочее снаряжение', 'gear.json', gearFileSchema)
validate('компоненты', 'components.json', componentsFileSchema)
validate('субстанции', 'substances.json', substancesFileSchema)
validate('формулы', 'formulas.json', formulasFileSchema)
validate('чертежи', 'schematics.json', schematicsFileSchema, { allowDuplicateNames: true })
validate('критические ранения', 'critical-injuries.json', criticalInjuriesFileSchema)
validate('навыки', 'skills.json', skillsFileSchema)
validate('профессии', 'professions.json', professionsFileSchema)
validate('древа профессий', 'profession-trees.json', professionTreesFileSchema)

function validateProfessionLinks() {
  const professions = JSON.parse(
    readFileSync(join(dataDir, 'professions.json'), 'utf8')
  ).items as BaseItem[]
  const trees = JSON.parse(
    readFileSync(join(dataDir, 'profession-trees.json'), 'utf8')
  ).professions as BaseItem[]

  const professionIds = new Set(professions.map((item) => item.id))
  const treeIds = new Set(trees.map((item) => item.id))
  const missingTrees = professions.filter((item) => !treeIds.has(item.id))
  const extraTrees = trees.filter((item) => !professionIds.has(item.id))

  if (missingTrees.length || extraTrees.length) {
    failed = true
    if (missingTrees.length) {
      console.error(
        `У профессий нет древ: ${missingTrees.map((item) => item.name).join(', ')}`
      )
    }
    if (extraTrees.length) {
      console.error(
        `У древ нет профессий: ${extraTrees.map((item) => item.name).join(', ')}`
      )
    }
    return
  }

  console.log(`OK: связи профессий и древ — ${professions.length}`)
}

validateProfessionLinks()

function validateTransport() {
  const raw = JSON.parse(readFileSync(join(dataDir, 'transport.json'), 'utf8'))
  const parsed = transportFileSchema.safeParse(raw)

  if (!parsed.success) {
    failed = true
    console.error('transport.json не прошёл валидацию:')
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    return
  }

  const items = [...parsed.data.vehicles, ...parsed.data.tack]
  const ids = new Set<string>()
  const names = new Set<string>()
  const errors: string[] = []

  for (const item of items) {
    if (ids.has(item.id)) errors.push(`повторяющийся id: ${item.id}`)
    if (names.has(item.name)) errors.push(`повторяющееся название: ${item.name}`)
    if (item.sourcePage < 1 || item.sourcePage > 337) {
      errors.push(`sourcePage вне книги: ${item.name} (${item.sourcePage})`)
    }
    ids.add(item.id)
    names.add(item.name)
  }

  if (errors.length) {
    failed = true
    console.error('Ошибки в transport.json:')
    for (const error of errors) console.error(`  - ${error}`)
    return
  }

  console.log(`OK: транспорт — ${parsed.data.vehicles.length}, упряжь — ${parsed.data.tack.length}`)
}

validateTransport()

if (failed) process.exit(1)
