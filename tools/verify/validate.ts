import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spellsFileSchema } from '../../docs/.vitepress/schemas/spell'

const root = fileURLToPath(new URL('../..', import.meta.url))
const spellsPath = join(root, 'docs', '.vitepress', 'data', 'spells.json')

const raw = JSON.parse(readFileSync(spellsPath, 'utf8'))
const parsed = spellsFileSchema.safeParse(raw)

if (!parsed.success) {
  console.error('spells.json не прошёл валидацию:')
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`)
  }
  process.exit(1)
}

const spells = parsed.data.items
const ids = new Set<string>()
const names = new Set<string>()
const errors: string[] = []

for (const spell of spells) {
  if (ids.has(spell.id)) errors.push(`повторяющийся id: ${spell.id}`)
  if (names.has(spell.name)) errors.push(`повторяющееся название: ${spell.name}`)
  if (spell.sourcePage < 1 || spell.sourcePage > 337) {
    errors.push(`sourcePage вне книги: ${spell.name} (${spell.sourcePage})`)
  }
  ids.add(spell.id)
  names.add(spell.name)
}

if (errors.length) {
  console.error('Ошибки в каталоге заклинаний:')
  for (const error of errors) console.error(`  - ${error}`)
  process.exit(1)
}

const byLevel = spells.reduce<Record<string, number>>((acc, spell) => {
  acc[spell.level] = (acc[spell.level] ?? 0) + 1
  return acc
}, {})

console.log(`OK: ${spells.length} заклинаний`)
console.log(`  новичок: ${byLevel.novice ?? 0}`)
console.log(`  подмастерье: ${byLevel.adept ?? 0}`)
console.log(`  мастер: ${byLevel.master ?? 0}`)
