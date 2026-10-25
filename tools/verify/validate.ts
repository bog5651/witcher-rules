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
import { bestiaryFileSchema } from '../../docs/.vitepress/schemas/bestiary'
import { relicsFileSchema } from '../../docs/.vitepress/schemas/relic'
import { magicGiftsFileSchema } from '../../docs/.vitepress/schemas/magicGift'
import { artifactsFileSchema } from '../../docs/.vitepress/schemas/artifact'
import { bombsFileSchema, trapsFileSchema } from '../../docs/.vitepress/schemas/explosive'
import { ammoFileSchema, weaponUpgradesFileSchema } from '../../docs/.vitepress/schemas/ammo'
import { getBook } from '../../docs/.vitepress/data/books'

const root = fileURLToPath(new URL('../..', import.meta.url))
const dataDir = join(root, 'docs', '.vitepress', 'data')

type BaseItem = { id: string; name: string; sourcePage: number; sourceBook?: string }
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
    const book = getBook(item.sourceBook)
    if (item.sourcePage < book.pageStart || item.sourcePage > book.pageEnd) {
      errors.push(
        `sourcePage вне книги ${book.short}: ${item.name} (${item.sourcePage}, стр. ${book.pageStart}–${book.pageEnd})`
      )
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

validate('заклинания', 'spells.json', spellsFileSchema, { allowDuplicateNames: true })
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

function validateBestiary() {
  const raw = JSON.parse(readFileSync(join(dataDir, 'bestiary.json'), 'utf8'))
  const parsed = bestiaryFileSchema.safeParse(raw)

  if (!parsed.success) {
    failed = true
    console.error('bestiary.json не прошёл валидацию:')
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    return
  }

  const { classes, monsters, animals } = parsed.data
  const ids = new Set<string>()
  const names = new Set<string>()
  const errors: string[] = []
  const classIds = new Set(classes.map((item) => item.id))

  if (classIds.size !== classes.length) {
    errors.push('повторяющиеся id классов')
  }

  for (const entry of [...monsters, ...animals]) {
    if (ids.has(entry.id)) errors.push(`повторяющийся id: ${entry.id}`)
    if (names.has(entry.name)) errors.push(`повторяющееся название: ${entry.name}`)
    if (new Set(entry.variants.map((variant) => variant.name)).size !== entry.variants.length) {
      errors.push(`повторяющиеся варианты: ${entry.name}`)
    }
    const book = getBook(entry.sourceBook)
    if (entry.statPage < book.pageStart || entry.statPage > book.pageEnd) {
      errors.push(
        `statPage вне книги ${book.short}: ${entry.name} (${entry.statPage}, стр. ${book.pageStart}–${book.pageEnd})`
      )
    }
    if (
      entry.descriptionPage &&
      (entry.descriptionPage < book.pageStart || entry.descriptionPage > book.pageEnd)
    ) {
      errors.push(
        `descriptionPage вне книги ${book.short}: ${entry.name} (${entry.descriptionPage})`
      )
    }
    if (!entry.sourceBook || entry.sourceBook === 'witcher-core') {
      if (entry.statPage < 267 || entry.statPage > 313) {
        errors.push(`statPage вне бестиария: ${entry.name} (${entry.statPage})`)
      }
      if (entry.descriptionPage && (entry.descriptionPage < 267 || entry.descriptionPage > 313)) {
        errors.push(`descriptionPage вне бестиария: ${entry.name} (${entry.descriptionPage})`)
      }
    }
    if (entry.descriptionPage && entry.descriptionPage < entry.statPage) {
      errors.push(`descriptionPage раньше statPage: ${entry.name}`)
    }
    if (animals.some((animal) => animal.id === entry.id) && entry.classId !== 'beasts') {
      errors.push(`животное не класса beasts: ${entry.name}`)
    }
    ids.add(entry.id)
    names.add(entry.name)
  }

  if (errors.length) {
    failed = true
    console.error('Ошибки в bestiary.json:')
    for (const error of errors) console.error(`  - ${error}`)
    return
  }

  console.log(
    `OK: бестиарий — ${classes.length} классов, ${monsters.length} чудовищ, ${animals.length} животных`
  )
}

validateBestiary()

function validateRelics() {
  const raw = JSON.parse(readFileSync(join(dataDir, 'relics.json'), 'utf8'))
  const parsed = relicsFileSchema.safeParse(raw)

  if (!parsed.success) {
    failed = true
    console.error('relics.json не прошёл валидацию:')
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    return
  }

  const ids = new Set<string>()
  const names = new Set<string>()
  const errors: string[] = []

  for (const relic of parsed.data.items) {
    if (ids.has(relic.id)) errors.push(`повторяющийся id: ${relic.id}`)
    if (names.has(relic.name)) errors.push(`повторяющееся название: ${relic.name}`)
    const book = getBook(relic.sourceBook)
    if (relic.sourcePage < book.pageStart || relic.sourcePage > book.pageEnd) {
      errors.push(
        `sourcePage вне книги ${book.short}: ${relic.name} (${relic.sourcePage}, стр. ${book.pageStart}–${book.pageEnd})`
      )
    }
    if ((!relic.sourceBook || relic.sourceBook === 'witcher-core') && (relic.sourcePage < 257 || relic.sourcePage > 265)) {
      errors.push(`sourcePage вне раздела реликвий: ${relic.name} (${relic.sourcePage})`)
    }
    ids.add(relic.id)
    names.add(relic.name)
  }

  if (errors.length) {
    failed = true
    console.error('Ошибки в relics.json:')
    for (const error of errors) console.error(`  - ${error}`)
    return
  }

  console.log(`OK: реликвии — ${parsed.data.items.length}`)
}

validateRelics()

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
    const book = getBook(item.sourceBook)
    if (item.sourcePage < book.pageStart || item.sourcePage > book.pageEnd) {
      errors.push(
        `sourcePage вне книги ${book.short}: ${item.name} (${item.sourcePage}, стр. ${book.pageStart}–${book.pageEnd})`
      )
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

function validateMagicGifts() {
  const raw = JSON.parse(readFileSync(join(dataDir, 'magic-gifts.json'), 'utf8'))
  const parsed = magicGiftsFileSchema.safeParse(raw)

  if (!parsed.success) {
    failed = true
    console.error('magic-gifts.json не прошёл валидацию:')
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    return
  }

  const ids = new Set<string>()
  const names = new Set<string>()
  const errors: string[] = []

  for (const item of parsed.data.items) {
    if (ids.has(item.id)) errors.push(`повторяющийся id: ${item.id}`)
    if (names.has(item.name)) errors.push(`повторяющееся название: ${item.name}`)
    const book = getBook(item.sourceBook)
    if (item.sourcePage < book.pageStart || item.sourcePage > book.pageEnd) {
      errors.push(`sourcePage вне книги ${book.short}: ${item.name} (${item.sourcePage})`)
    }
    ids.add(item.id)
    names.add(item.name)
  }

  if (errors.length) {
    failed = true
    console.error('Ошибки в magic-gifts.json:')
    for (const error of errors) console.error(`  - ${error}`)
    return
  }

  console.log(`OK: магические дары — ${parsed.data.items.length}`)
}

validateMagicGifts()

function validateArtifacts() {
  const raw = JSON.parse(readFileSync(join(dataDir, 'artifacts.json'), 'utf8'))
  const parsed = artifactsFileSchema.safeParse(raw)

  if (!parsed.success) {
    failed = true
    console.error('artifacts.json не прошёл валидацию:')
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`)
    }
    return
  }

  const ids = new Set<string>()
  const names = new Set<string>()
  const errors: string[] = []

  for (const item of parsed.data.items) {
    if (ids.has(item.id)) errors.push(`повторяющийся id: ${item.id}`)
    if (names.has(item.name)) errors.push(`повторяющееся название: ${item.name}`)
    const book = getBook(item.sourceBook)
    if (item.sourcePage < book.pageStart || item.sourcePage > book.pageEnd) {
      errors.push(`sourcePage вне книги ${book.short}: ${item.name} (${item.sourcePage})`)
    }
    ids.add(item.id)
    names.add(item.name)
  }

  if (errors.length) {
    failed = true
    console.error('Ошибки в artifacts.json:')
    for (const error of errors) console.error(`  - ${error}`)
    return
  }

  console.log(`OK: артефакты — ${parsed.data.items.length}`)
}

validateArtifacts()

validate('бомбы', 'bombs.json', bombsFileSchema)
validate('ловушки', 'traps.json', trapsFileSchema)
validate('боеприпасы', 'ammo.json', ammoFileSchema)
validate('улучшения арбалета', 'weapon-upgrades.json', weaponUpgradesFileSchema)

if (failed) process.exit(1)
