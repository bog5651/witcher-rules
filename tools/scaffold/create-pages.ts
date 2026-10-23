import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sidebar } from '../../docs/.vitepress/navigation'

type SidebarItem = {
  text: string
  link?: string
  items?: SidebarItem[]
}

const root = fileURLToPath(new URL('../..', import.meta.url))
const docs = join(root, 'docs')

const sectionTitles: Record<string, string> = {
  character: 'Создание персонажа',
  professions: 'Профессии',
  magic: 'Магия',
  shop: 'Магазин',
  alchemy: 'Алхимия',
  crafting: 'Ремесло',
  combat: 'Бой',
  bestiary: 'Бестиарий',
  witchers: 'Ведьмаки',
  gm: 'Ведущему',
  world: 'Мир'
}

const sectionDescriptions: Record<string, string> = {
  character: 'Пошаговое создание персонажа: раса, жизненный путь, профессия, параметры, навыки и снаряжение.',
  professions: 'Девять профессий книги, их определяющие навыки, начальное снаряжение и древа способностей.',
  magic: 'Заклинания, знаки, инвокации, ритуалы и порча — с фильтрами по уровню и стихии.',
  shop: 'Оружие, броня, алхимические составы, вещи, компоненты и транспорт.',
  alchemy: 'Формулы, субстанции и правила приготовления алхимических составов.',
  crafting: 'Ремесленные чертежи, компоненты и проверки Изготовления.',
  combat: 'Раунды, атаки, защита, критические ранения, эффекты и лечение.',
  bestiary: 'Чудовища Континента: характеристики, уязвимости, атаки и добыча.',
  witchers: 'Жизненный путь ведьмака, снаряжение, мутагены, руны и реликвии.',
  gm: 'Проклятия, награды, ведение кампании и персонажи ведущего.',
  world: 'Королевства, религии и союзы мира «Ведьмака».'
}

const written: string[] = []
const skipped: string[] = []

function walk(items: SidebarItem[]) {
  for (const item of items) {
    if (item.link) create(item)
    if (item.items) walk(item.items)
  }
}

function create(item: SidebarItem) {
  const link = item.link!
  const clean = link.split('#')[0].replace(/^\//, '')
  const section = clean.split('/')[0]
  const isIndex = clean.endsWith('/') || clean === ''
  const relative = isIndex ? `${clean}index.md` : `${clean}.md`
  const file = join(docs, relative)

  if (existsSync(file)) {
    skipped.push(relative)
    return
  }

  mkdirSync(dirname(file), { recursive: true })

  const title = isIndex ? sectionTitles[section] ?? item.text : item.text
  const description = sectionDescriptions[section] ?? 'Справочник правил НРИ «Ведьмак».'
  const body = isIndex
    ? `# ${title}\n\n${description}\n\n::: info Раздел в разработке\nКаркас страницы и навигация готовы. Текст правил будет добавлен на следующем этапе.\n:::\n`
    : `# ${title}\n\n::: info Раздел в разработке\nСтраница готовится. Текст правил будет добавлен на следующем этапе.\n:::\n`

  writeFileSync(
    file,
    `---\ntitle: ${JSON.stringify(title)}\ndescription: ${JSON.stringify(description)}\n---\n\n${body}`,
    'utf8'
  )
  written.push(relative)
}

for (const items of Object.values(sidebar)) {
  if (Array.isArray(items)) walk(items as SidebarItem[])
}

console.log(`Создано: ${written.length}`)
for (const file of written) console.log(`  + ${file}`)
console.log(`Пропущено (уже есть): ${skipped.length}`)
