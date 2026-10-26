import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBook } from '../../docs/.vitepress/data/books'

type Dict = Record<string, any>

const root = fileURLToPath(new URL('../..', import.meta.url))
const dataDir = join(root, 'docs', '.vitepress', 'data')
const distDir = join(root, 'docs', '.vitepress', 'dist')
const marker = '<!-- catalog-digest -->'

const read = (file: string): Dict =>
  JSON.parse(readFileSync(join(dataDir, `${file}.json`), 'utf8'))

const spells = read('spells').items as Dict[]
const signs = read('signs').items as Dict[]
const invocations = read('invocations').items as Dict[]
const rituals = read('rituals').items as Dict[]
const hexes = read('hexes').items as Dict[]
const gifts = read('magic-gifts').items as Dict[]
const weapons = read('weapons').items as Dict[]
const armor = read('armor').items as Dict[]
const armorUpgrades = read('armor-upgrades').items as Dict[]
const ammo = read('ammo').items as Dict[]
const weaponUpgrades = read('weapon-upgrades').items as Dict[]
const alchemicals = read('alchemicals').items as Dict[]
const tools = read('tools').items as Dict[]
const gear = read('gear').items as Dict[]
const components = read('components').items as Dict[]
const schematics = read('schematics').items as Dict[]
const substances = read('substances').items as Dict[]
const formulas = read('formulas').items as Dict[]
const relics = read('relics').items as Dict[]
const artifacts = read('artifacts').items as Dict[]
const bombs = read('bombs').items as Dict[]
const traps = read('traps').items as Dict[]
const transport = read('transport')
const skills = read('skills').items as Dict[]
const professions = read('professions').items as Dict[]
const trees = read('profession-trees').professions as Dict[]
const injuries = read('critical-injuries').items as Dict[]
const bestiary = read('bestiary')

const labels: Record<string, string> = {
  level: 'Уровень',
  element: 'Стихия',
  cost: 'Затраты',
  costVariable: 'Затраты меняются',
  costText: 'Затраты',
  healthCost: 'Затраты ПЗ',
  range: 'Дистанция',
  duration: 'Длительность',
  defense: 'Защита',
  effect: 'Эффект',
  note: 'Примечание',
  description: 'Описание',
  availability: 'Доступность',
  weight: 'Вес, кг',
  price: 'Цена, крон',
  priceNote: 'Примечание к цене',
  toxicity: 'Токсичность',
  extractionNotes: 'Заметки по извлечению',
  category: 'Категория',
  type: 'Тип',
  damageTypes: 'Тип урона',
  accuracy: 'Точность',
  damage: 'Урон',
  reliability: 'Надёжность',
  hands: 'Хват',
  effects: 'Эффекты',
  concealment: 'Скрытность',
  upgradeSlots: 'Слоты улучшений',
  elderfolk: 'Старший Народ',
  witcher: 'Ведьмачье',
  location: 'Зона',
  covers: 'Покрытие',
  weightClass: 'Класс брони',
  protection: 'Защита',
  encumbrance: 'Помеха',
  protectionBonus: 'Бонус защиты',
  resistances: 'Сопротивления',
  where: 'Где искать',
  quantity: 'Количество',
  gatheringDC: 'СЛ сбора',
  components: 'Компоненты',
  surcharge: 'Доплата за ускорение',
  substance: 'Субстанция',
  ingredients: 'Ингредиенты',
  alternateIngredients: 'Альтернативные ингредиенты',
  dc: 'СЛ',
  time: 'Время',
  prepTime: 'Время подготовки',
  checkDC: 'СЛ проверки',
  check: 'Проверка',
  danger: 'Опасность',
  removal: 'Снятие',
  tradition: 'Традиция',
  deity: 'Божество',
  base: 'Базовый',
  tier: 'Уровень дара',
  castDC: 'СЛ сотворения',
  sideEffect: 'Побочный эффект',
  kind: 'Вид',
  stats: 'Характеристики',
  weapon: 'Оружие',
  armor: 'Броня',
  athletics: 'Атлетика',
  controlModifier: 'Модификатор управления',
  speed: 'Скорость',
  hp: 'ПЗ',
  attribute: 'Параметр',
  complex: 'Сложный',
  summary: 'Кратко',
  quote: 'Цитата',
  quoteAuthor: 'Автор цитаты',
  definingSkill: 'Определяющий навык',
  energy: 'Энергия',
  magicAbilities: 'Магические способности',
  skills: 'Навыки',
  skillNote: 'Примечание к навыкам',
  equipment: 'Снаряжение',
  fixedEquipment: 'Особое снаряжение',
  branches: 'Ветви',
  extras: 'Дополнительно',
  notes: 'Примечания',
  severity: 'Тяжесть',
  roll: 'Бросок',
  stabilized: 'Стабилизация',
  healed: 'Заживление',
  radius: 'Радиус',
  classId: 'Класс',
  statPage: 'Страница характеристик',
  descriptionPage: 'Страница описания',
  difficulty: 'Сложность',
  reward: 'Награда',
  variants: 'Варианты',
  flavor: 'Описание',
  extraTables: 'Дополнительные таблицы',
  extractionNotes: 'Заметки по извлечению',
  choose: 'Выбрать',
  items: 'Предметы',
  title: 'Название',
  text: 'Текст',
  columns: 'Колонки',
  rows: 'Строки',
  label: 'Поле',
  value: 'Значение'
}

const enums: Record<string, Record<string, string>> = {
  level: { novice: 'Новичок', adept: 'Подмастерье', master: 'Мастер', grandmaster: 'Гроссмейстер' },
  element: {
    mixed: 'Смешанные',
    earth: 'Земля',
    air: 'Воздух',
    fire: 'Огонь',
    water: 'Вода',
    necromancy: 'Некромантия'
  },
  availability: {
    everywhere: 'Повсеместная',
    common: 'Обычная',
    rare: 'Редкая',
    unique: 'Уникальная'
  },
  location: { head: 'Голова', torso: 'Корпус', body: 'Корпус', legs: 'Ноги', arms: 'Руки', shield: 'Щит' },
  weightClass: { light: 'Лёгкая', medium: 'Средняя', heavy: 'Тяжёлая' },
  tradition: {
    druid: 'Друид',
    preacher: 'Проповедник',
    archpriest: 'Верховный жрец',
    archdruid: 'Архидруид'
  },
  tier: { minor: 'Малый', major: 'Большой' },
  danger: { low: 'Низкая', medium: 'Средняя', high: 'Высокая' },
  severity: { light: 'Лёгкое', medium: 'Среднее', heavy: 'Тяжёлое', deadly: 'Смертельное' },
  origin: { common: 'Обычное', elder: 'Старший Народ' },
  concealment: {
    tiny: 'Маленькое',
    small: 'Небольшое',
    large: 'Крупное',
    none: 'Не спрятать'
  },
  substance: {
    vitriol: 'Витриол',
    rebis: 'Ребис',
    aether: 'Эфир',
    quebrith: 'Квебрит',
    hydragenum: 'Гидраген',
    vermilion: 'Вермильон',
    sol: 'Солнце',
    caelum: 'Целестин',
    fulgur: 'Фульгор'
  },
  attribute: { int: 'Инт', ref: 'Реа', dex: 'Лвк', body: 'Тел', emp: 'Эмп', craft: 'Рем', will: 'Воля' },
  kind: { weapon: 'Оружие', armor: 'Броня', focus: 'Фокус', relic: 'Реликвия' },
  category: {
    composition: 'Состав',
    'weak-elixir': 'Слабый эликсир',
    'witcher-elixir': 'Ведьмачий эликсир',
    oil: 'Масло',
    decoction: 'Отвар',
    component: 'Компонент',
    weapon: 'Оружие',
    armor: 'Броня',
    upgrade: 'Улучшение',
    enchantment: 'Зачарование',
    explosive: 'Взрывчатка',
    standard: 'Стандартное',
    containers: 'Ёмкости',
    food: 'Еда',
    clothing: 'Одежда',
    services: 'Услуги',
    lodging: 'Проживание',
    crafting: 'Ремесло',
    animal: 'Животное',
    alchemical: 'Алхимия',
    metal: 'Металл',
    sword: 'Меч',
    dagger: 'Кинжал',
    axe: 'Топор',
    hammer: 'Молот',
    spear: 'Копьё',
    staff: 'Посох',
    bow: 'Лук',
    crossbow: 'Арбалет',
    'light-armor': 'Лёгкая броня',
    'medium-armor': 'Средняя броня',
    'heavy-armor': 'Тяжёлая броня'
  }
}

const attributeNames: Record<string, string> = {
  int: 'ИНТ',
  rea: 'РЕА',
  dex: 'ЛВК',
  body: 'ТЕЛ',
  speed: 'СКОР',
  emp: 'ЭМП',
  craft: 'РЕМ',
  will: 'ВОЛЯ',
  luck: 'УДАЧ'
}

const derivedNames: Record<string, string> = {
  stun: 'УСТ',
  run: 'БЕГ',
  jump: 'ПРЖ',
  stamina: 'ВЫН',
  carry: 'ВЕС',
  rest: 'ОТД',
  hp: 'ПЗ',
  energy: 'ЭНЕРГ'
}

const sizeNames: Record<string, string> = {
  height: 'рост',
  weight: 'вес',
  habitat: 'среда обитания',
  intellect: 'интеллект',
  population: 'численность'
}

const overallLabels: Record<string, string> = {
  simple: 'Простые',
  medium: 'Средние',
  complex: 'Сложные'
}

const tierLabels: Record<string, string> = {
  ordinary: 'Обычные',
  unremarkable: 'Незаурядные',
  hard: 'Трудные'
}

const isObject = (value: unknown): value is Dict =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isEmpty = (value: unknown): boolean =>
  value === null ||
  value === undefined ||
  value === '' ||
  (Array.isArray(value) && value.length === 0)

const valueLabel = (key: string, value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'boolean') return value ? 'да' : 'нет'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return enums[key]?.[value] ?? value
  if (Array.isArray(value)) return value.map((item) => valueLabel(key, item)).join(', ')
  return Object.entries(value)
    .map(([nestedKey, nestedValue]) => `${labels[nestedKey] ?? nestedKey}: ${valueLabel(nestedKey, nestedValue)}`)
    .join('; ')
}

const sourceLabel = (item: Dict, page = item.sourcePage): string => {
  const book = getBook(typeof item.sourceBook === 'string' ? item.sourceBook : undefined)
  return page ? `${book.title}, стр. ${page}` : book.title
}

const shortSource = (item: Dict, page = item.sourcePage): string => {
  const book = getBook(typeof item.sourceBook === 'string' ? item.sourceBook : undefined)
  return page ? `${book.short} ${page}` : book.short
}

const escapeCell = (value: string): string => value.replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim()

const renderTable = (items: Dict[], columns: Array<[string, (item: Dict) => string]>): string => {
  const head = `| ${columns.map(([title]) => title).join(' | ')} |`
  const divider = `| ${columns.map(() => '---').join(' | ')} |`
  const rows = items.map((item) => {
    const cells = columns.map(([, get]) => {
      const value = get(item)
      const text = value === 'null' || value === 'undefined' ? '' : value
      return escapeCell(text || '—')
    })
    return `| ${cells.join(' | ')} |`
  })
  return [head, divider, ...rows].join('\n')
}

const sourceLegend = (items: Dict[]): string => {
  const used = new Map<string, string>()
  for (const item of items) {
    const book = getBook(typeof item.sourceBook === 'string' ? item.sourceBook : undefined)
    used.set(book.short, book.title)
  }
  if (!used.size) return ''
  return `Источники: ${[...used].map(([short, title]) => `${short} — ${title}`).join('; ')}.`
}

const paragraph = (text: string): string => text.trim()

const renderPairs = (value: Dict, names: Record<string, string>): string =>
  Object.entries(value)
    .filter(([, nested]) => !isEmpty(nested))
    .map(([key, nested]) => `${names[key] ?? labels[key] ?? key} ${valueLabel(key, nested)}`)
    .join(', ')

const renderAbilities = (items: Dict[]): string =>
  items.map((item) => `  - **${item.name}** — ${item.description}`).join('\n')

const renderSkills = (items: Dict[]): string =>
  `- **Навыки:** ${items.map((item) => `${item.name} ${item.value}`).join(', ')}`

const renderWeapons = (items: Dict[]): string =>
  `- **Оружие:**\n${items
    .map(
      (item) =>
        `  - **${item.name}** — урон ${item.damage}; эффект: ${item.effect}; СА ${item.attackCost}`
    )
    .join('\n')}`

const renderLoot = (items: Dict[]): string =>
  `- **Добыча:** ${items
    .map((item) => (item.formula ? `${item.name} (${item.formula})` : item.name))
    .join(', ')}`

const renderVulnerabilities = (items: Dict[]): string =>
  `- **Уязвимости:**\n${items
    .map((item) => `  - **${item.name}**${item.description ? ` — ${item.description}` : ''}`)
    .join('\n')}`

const renderIngredients = (items: string | Dict[]): string => {
  if (typeof items === 'string') return `- **Ингредиенты:** ${items}`
  return `- **Ингредиенты:** ${items
    .map((item) => {
      if (typeof item === 'string') return item
      if (item.substance) return `${item.count} × ${enums.substance[item.substance] ?? item.substance}`
      return `${item.count} × ${item.name}`
    })
    .join(', ')}`
}

const renderStats = (items: Dict[]): string =>
  `- **Характеристики:** ${items.map((item) => `${item.label}: ${item.value}`).join('; ')}`

const renderNotes = (items: Dict[]): string =>
  items.map((item) => `- **${item.title}** — ${item.text}`).join('\n')

const renderExtraTables = (items: Dict[]): string =>
  items
    .map((table) => {
      const head = `| ${table.columns.join(' | ')} |`
      const divider = `| ${table.columns.map(() => '---').join(' | ')} |`
      const rows = table.rows.map(
        (row: string[]) => `| ${row.map((cell) => escapeCell(String(cell))).join(' | ')} |`
      )
      return `**${table.title}**\n\n${[head, divider, ...rows].join('\n')}`
    })
    .join('\n\n')

const renderFlavor = (flavor: Dict): string => {
  const lines = ['#### Описание', '']
  if (flavor.quote) lines.push(`> ${flavor.quote}`, `> — ${flavor.author}`, '')
  if (flavor.check) lines.push(`- **Проверка:** ${flavor.check}`)
  if (flavor.knowledgeCheck) lines.push(`- **Знания:** ${flavor.knowledgeCheck}`)
  if (flavor.text?.length) lines.push('', ...flavor.text.map((text: string) => paragraph(text)))
  return lines.join('\n')
}

const renderVariant = (variant: Dict): string => {
  const lines = [`#### Вариант: ${variant.name}`, '']
  lines.push(`- **Броня:** ${variant.armor}`)
  lines.push(`- **Характеристики:** ${renderPairs(variant.attributes, attributeNames)}`)
  lines.push(`- **Производные:** ${renderPairs(variant.derived, derivedNames)}`)
  lines.push(`- **Размер:** ${renderPairs(variant.size, sizeNames)}`)
  lines.push(renderSkills(variant.skills))
  if (variant.abilities?.length) {
    lines.push(`- **Способности:**`, renderAbilities(variant.abilities))
  }
  lines.push(renderWeapons(variant.weapons))
  lines.push(renderLoot(variant.loot))
  lines.push(renderVulnerabilities(variant.vulnerabilities))
  return lines.join('\n')
}

const renderBestiaryEntry = (entry: Dict): string => {
  const lines = [`### ${entry.name}`, '']
  const difficulty = entry.difficulty
    ? `${overallLabels[entry.difficulty.overall] ?? entry.difficulty.overall} · ${tierLabels[entry.difficulty.tier] ?? entry.difficulty.tier}`
    : ''
  const classLabel =
    bestiary.classes.find((item: Dict) => item.id === entry.classId)?.name ?? entry.classId
  lines.push(`- **Класс:** ${classLabel}`)
  if (difficulty) lines.push(`- **Сложность:** ${difficulty}`)
  if (entry.reward !== null && entry.reward !== undefined) {
    lines.push(`- **Награда:** ${entry.reward} крон`)
  }
  const pages = entry.descriptionPage
    ? `${entry.statPage}–${entry.descriptionPage}`
    : `${entry.statPage}`
  lines.push(`- **Страницы:** ${pages}`)
  lines.push(`- **Источник:** ${sourceLabel(entry, entry.statPage)}`)
  lines.push('')
  for (const variant of entry.variants) lines.push(renderVariant(variant), '')
  if (entry.flavor) lines.push(renderFlavor(entry.flavor), '')
  if (entry.notes?.length) lines.push('#### Примечания', '', renderNotes(entry.notes), '')
  if (entry.extraTables?.length) {
    lines.push('#### Дополнительные таблицы', '', renderExtraTables(entry.extraTables), '')
  }
  if (entry.extractionNotes?.length) {
    lines.push('#### Заметки по извлечению', '', ...entry.extractionNotes.map((text: string) => `- ${text}`), '')
  }
  return lines.join('\n')
}

const renderMagicEntry = (item: Dict, kind: string): string => {
  const lines = [`### ${item.name}`, '']
  const meta: string[] = []
  if (item.level) meta.push(`Уровень: ${valueLabel('level', item.level)}`)
  if (item.element) meta.push(`Стихия: ${valueLabel('element', item.element)}`)
  if (item.tradition) meta.push(`Традиция: ${valueLabel('tradition', item.tradition)}`)
  if (item.deity) meta.push(`Божество: ${item.deity}`)
  if (item.tier) meta.push(`Уровень дара: ${valueLabel('tier', item.tier)}`)
  if (item.base) meta.push('Базовый знак')
  if (item.costText) meta.push(`Затраты: ${item.costText}`)
  else if (item.costVariable) meta.push('Затраты: переменные')
  else meta.push(`Затраты: ${item.cost} Вын`)
  if (item.healthCost) meta.push(`Затраты ПЗ: ${item.healthCost}`)
  if (meta.length) lines.push(`- ${meta.join(' · ')}`)
  const details: string[] = []
  if (item.range) details.push(`Дистанция: ${item.range}`)
  if (item.duration) details.push(`Длительность: ${item.duration}`)
  if (item.defense) details.push(`Защита: ${item.defense}`)
  if (item.prepTime) details.push(`Подготовка: ${item.prepTime}`)
  if (item.checkDC) details.push(`СЛ проверки: ${item.checkDC}`)
  if (item.castDC) details.push(`СЛ сотворения: ${item.castDC}`)
  if (details.length) lines.push(`- ${details.join(' · ')}`)
  if (item.ingredients) lines.push(renderIngredients(item.ingredients))
  if (item.alternateIngredients) {
    lines.push(`- **Альтернативные ингредиенты:** ${item.alternateIngredients}`)
  }
  lines.push('')
  if (item.effect) lines.push(`**Эффект.** ${paragraph(item.effect)}`, '')
  if (item.sideEffect) lines.push(`**Побочный эффект.** ${paragraph(item.sideEffect)}`, '')
  if (item.removal) lines.push(`**Снятие.** ${paragraph(item.removal)}`, '')
  if (item.note) lines.push(`**Примечание.** ${paragraph(item.note)}`, '')
  if (item.danger) lines.push(`- **Опасность:** ${valueLabel('danger', item.danger)}`)
  lines.push(`- **Источник:** ${sourceLabel(item)}`)
  return lines.join('\n')
}

const renderDetailEntry = (item: Dict): string => {
  const lines = [`### ${item.name}`, '']
  const skip = new Set(['id', 'name', 'sourcePage', 'sourceBook', 'quoteAuthor'])
  for (const [key, value] of Object.entries(item)) {
    if (skip.has(key) || isEmpty(value)) continue
    if (['description', 'effect', 'note', 'summary', 'sideEffect', 'removal', 'check', 'stabilized', 'healed'].includes(key)) {
      if (Array.isArray(value)) {
        lines.push('', ...value.map((text) => paragraph(String(text))), '')
      } else {
        lines.push('', `**${labels[key] ?? key}.** ${paragraph(String(value))}`, '')
      }
      continue
    }
    if (key === 'quote') {
      lines.push(`> ${value}`, '')
      if (item.quoteAuthor) lines.push(`> — ${item.quoteAuthor}`, '')
      continue
    }
    if (key === 'definitionSkill' || key === 'definingSkill') {
      const skill = value as Dict
      lines.push(
        `- **${labels[key] ?? key}:** **${skill.name}**${skill.attribute ? ` (${skill.attribute})` : ''} — ${skill.description}`,
        ''
      )
      continue
    }
    if (key === 'stats') {
      lines.push(renderStats(value as Dict[]), '')
      continue
    }
    if (key === 'branches') {
      for (const branch of value as Dict[]) {
        lines.push(`#### Ветвь: ${branch.name}`, '')
        for (const ability of branch.abilities ?? []) {
          const rank = ability.rank ? `${ability.rank} ` : ''
          const attribute = ability.attribute ? ` (${ability.attribute})` : ''
          lines.push(`- **${rank}${ability.name}**${attribute} — ${ability.description}`)
        }
        lines.push('')
      }
      continue
    }
    if (key === 'extras') {
      lines.push(renderExtraTables(value as Dict[]), '')
      continue
    }
    if (key === 'notes') {
      lines.push(renderNotes(value as Dict[]), '')
      continue
    }
    if (key === 'weapon' || key === 'armor') {
      const nested = value as Dict
      lines.push(`- **${labels[key]}:** ${Object.entries(nested)
        .filter(([, nestedValue]) => !isEmpty(nestedValue))
        .map(([nestedKey, nestedValue]) => `${labels[nestedKey] ?? nestedKey}: ${valueLabel(nestedKey, nestedValue)}`)
        .join('; ')}`, '')
      continue
    }
    if (key === 'equipment' || key === 'fixedEquipment') {
      const nested = value as Dict
      const title = nested.title ? `**${nested.title}:** ` : ''
      const choose = nested.choose ? `выбрать ${nested.choose}; ` : ''
      lines.push(`- **${labels[key] ?? key}:** ${title}${choose}${(nested.items ?? []).join(', ')}`, '')
      continue
    }
    if (Array.isArray(value)) {
      if (value.every((entry) => typeof entry === 'string')) {
        lines.push(`- **${labels[key] ?? key}:** ${value.join(', ')}`)
        continue
      }
      if (key === 'ingredients') {
        lines.push(renderIngredients(value), '')
        continue
      }
      if (key === 'components') {
        lines.push(renderIngredients(value), '')
        continue
      }
      if (key === 'stats') {
        lines.push(renderStats(value), '')
        continue
      }
      lines.push(`- **${labels[key] ?? key}:**`)
      for (const entry of value) {
        if (isObject(entry)) {
          lines.push(`  - ${Object.entries(entry)
            .filter(([, nested]) => !isEmpty(nested))
            .map(([nestedKey, nested]) => `${labels[nestedKey] ?? nestedKey}: ${valueLabel(nestedKey, nested)}`)
            .join('; ')}`)
        } else {
          lines.push(`  - ${entry}`)
        }
      }
      lines.push('')
      continue
    }
    if (isObject(value)) {
      lines.push(`- **${labels[key] ?? key}:** ${Object.entries(value)
        .filter(([, nested]) => !isEmpty(nested))
        .map(([nestedKey, nested]) => `${labels[nestedKey] ?? nestedKey}: ${valueLabel(nestedKey, nested)}`)
        .join('; ')}`)
      continue
    }
    lines.push(`- **${labels[key] ?? key}:** ${valueLabel(key, value)}`)
  }
  lines.push(`- **Источник:** ${sourceLabel(item)}`)
  return lines.join('\n')
}

const renderTablePage = (
  title: string,
  items: Dict[],
  columns: Array<[string, (item: Dict) => string]>
): string => {
  const legend = sourceLegend(items)
  return [
    `## ${title}`,
    '',
    legend,
    '',
    renderTable(items, [...columns, ['Источник', (item) => shortSource(item)]]),
    ''
  ]
    .filter((line) => line !== undefined)
    .join('\n')
}

const renderMagicPage = (title: string, items: Dict[], kind: string): string =>
  [
    `## ${title}`,
    '',
    ...items.flatMap((item) => [renderMagicEntry(item, kind), '']),
    ''
  ].join('\n')

const renderDetailPage = (title: string, items: Dict[]): string =>
  [
    `## ${title}`,
    '',
    ...items.flatMap((item) => [renderDetailEntry(item), '']),
    ''
  ].join('\n')

const renderBestiaryPage = (title: string, items: Dict[]): string => {
  const legend = sourceLegend(
    items.map((item) => ({ ...item, sourcePage: item.statPage }))
  )
  return [
    `## ${title}`,
    '',
    legend,
    '',
    ...items.flatMap((entry) => [renderBestiaryEntry(entry), '']),
    ''
  ].join('\n')
}

const pages: Record<string, () => string> = {
  '/magic/spells': () => renderMagicPage('Каталог', spells, 'spell'),
  '/magic/spells/novice': () =>
    renderMagicPage('Каталог', spells.filter((item) => item.level === 'novice'), 'spell'),
  '/magic/spells/adept': () =>
    renderMagicPage('Каталог', spells.filter((item) => item.level === 'adept'), 'spell'),
  '/magic/spells/master': () =>
    renderMagicPage('Каталог', spells.filter((item) => item.level === 'master'), 'spell'),
  '/magic/signs': () => renderMagicPage('Каталог', signs, 'sign'),
  '/magic/rituals': () => renderMagicPage('Каталог', rituals, 'ritual'),
  '/magic/hexes': () => renderMagicPage('Каталог', hexes, 'hex'),
  '/magic/invocations': () => renderMagicPage('Каталог', invocations, 'invocation'),
  '/magic/invocations/druid': () =>
    renderMagicPage('Каталог', invocations.filter((item) => item.tradition === 'druid'), 'invocation'),
  '/magic/invocations/preacher': () =>
    renderMagicPage('Каталог', invocations.filter((item) => item.tradition === 'preacher'), 'invocation'),
  '/magic/invocations/archpriest': () =>
    renderMagicPage('Каталог', invocations.filter((item) => item.tradition === 'archpriest'), 'invocation'),
  '/magic/invocations/archdruid': () =>
    renderMagicPage('Каталог', invocations.filter((item) => item.tradition === 'archdruid'), 'invocation'),
  '/magic/gifts': () => renderMagicPage('Каталог', gifts, 'gift'),
  '/shop/weapons': () =>
    [
      renderTablePage('Оружие', weapons, [
        ['Название', (item) => item.name],
        ['Категория', (item) => item.category],
        ['Тип', (item) => item.type],
        ['Урон', (item) => item.damage],
        ['Точность', (item) => String(item.accuracy)],
        ['Надёжность', (item) => String(item.reliability)],
        ['Хват', (item) => String(item.hands)],
        ['Дистанция', (item) => item.range],
        ['Эффекты', (item) => item.effects.join(', ')],
        ['Скрытность', (item) => valueLabel('concealment', item.concealment)],
        ['Усиления', (item) => String(item.upgradeSlots)],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)],
        ['Доступность', (item) => valueLabel('availability', item.availability)]
      ]),
      renderTablePage('Боеприпасы', ammo, [
        ['Название', (item) => item.name],
        ['Тип', (item) => item.type],
        ['Надёжность', (item) => String(item.reliability)],
        ['Эффект', (item) => item.effect],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)],
        ['Доступность', (item) => valueLabel('availability', item.availability)]
      ]),
      renderTablePage('Улучшения арбалета', weaponUpgrades, [
        ['Название', (item) => item.name],
        ['Эффект', (item) => item.effect],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)],
        ['Доступность', (item) => valueLabel('availability', item.availability)]
      ])
    ].join('\n'),
  '/shop/armor': () =>
    [
      renderTablePage('Броня', armor, [
        ['Название', (item) => item.name],
        ['Зона', (item) => (item.covers ?? []).map((zone: string) => valueLabel('location', zone)).join(', ')],
        ['Класс', (item) => valueLabel('weightClass', item.weightClass)],
        ['Защита', (item) => String(item.protection)],
        ['Надёжность', (item) => (item.reliability === null ? '—' : String(item.reliability))],
        ['Слоты улучшений', (item) => String(item.upgradeSlots)],
        ['Помеха', (item) => String(item.encumbrance)],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)],
        ['Доступность', (item) => valueLabel('availability', item.availability)]
      ]),
      renderTablePage('Усиления брони', armorUpgrades, [
        ['Название', (item) => item.name],
        ['Бонус защиты', (item) => String(item.protectionBonus)],
        ['Сопротивления', (item) => item.resistances.join(', ')],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)],
        ['Доступность', (item) => valueLabel('availability', item.availability)]
      ])
    ].join('\n'),
  '/shop/alchemy': () => renderDetailPage('Каталог', alchemicals),
  '/shop/items': () =>
    [
      renderDetailPage('Инструменты', tools),
      renderTablePage('Прочее снаряжение', gear, [
        ['Название', (item) => item.name],
        ['Категория', (item) => valueLabel('category', item.category)],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)]
      ])
    ].join('\n'),
  '/shop/components': () =>
    renderTablePage('Компоненты', components, [
      ['Название', (item) => item.name],
      ['Категория', (item) => valueLabel('category', item.category)],
      ['Где искать', (item) => item.where],
      ['Количество', (item) => item.quantity],
      ['СЛ сбора', (item) => String(item.gatheringDC)],
      ['Вес', (item) => String(item.weight)],
      ['Цена', (item) => String(item.price)],
      ['Доступность', (item) => valueLabel('availability', item.availability)]
    ]),
  '/shop/artifacts': () => renderDetailPage('Каталог', artifacts),
  '/shop/transport': () =>
    [
      renderTablePage('Транспорт', transport.vehicles, [
        ['Название', (item) => item.name],
        ['Атлетика', (item) => item.athletics],
        ['Управление', (item) => item.controlModifier],
        ['Скорость', (item) => item.speed],
        ['ПЗ', (item) => String(item.hp)],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)]
      ]),
      renderTablePage('Упряжь', transport.tack, [
        ['Название', (item) => item.name],
        ['Эффект', (item) => item.effect ?? ''],
        ['Вес', (item) => String(item.weight)],
        ['Цена', (item) => String(item.price)]
      ])
    ].join('\n'),
  '/shop/explosives': () =>
    [
      renderDetailPage('Бомбы', bombs),
      renderDetailPage('Ловушки', traps)
    ].join('\n'),
  '/alchemy/substances': () =>
    renderTablePage('Субстанции', substances, [
      ['Название', (item) => item.name],
      ['Субстанция', (item) => valueLabel('substance', item.substance)],
      ['Где искать', (item) => item.where],
      ['Количество', (item) => item.quantity],
      ['СЛ сбора', (item) => String(item.gatheringDC)],
      ['Вес', (item) => String(item.weight)],
      ['Цена', (item) => String(item.price)],
      ['Доступность', (item) => valueLabel('availability', item.availability)]
    ]),
  '/alchemy/formulas': () => renderDetailPage('Каталог', formulas),
  '/crafting/schematics': () =>
    renderTablePage('Чертежи', schematics, [
      ['Название', (item) => item.name],
      ['Категория', (item) => valueLabel('category', item.category)],
      ['Уровень', (item) => valueLabel('level', item.level)],
      ['Происхождение', (item) => valueLabel('origin', item.origin)],
      ['СЛ', (item) => String(item.dc)],
      ['Время', (item) => item.time],
      ['Компоненты', (item) => item.components.map((entry: Dict) => `${entry.count} × ${entry.name}`).join(', ')],
      ['Доплата', (item) => String(item.surcharge)],
      ['Цена', (item) => String(item.price)]
    ]),
  '/crafting/runes': () => renderDetailPage('Каталог', relics),
  '/bestiary/monsters': () => renderBestiaryPage('Каталог', bestiary.monsters),
  '/bestiary/animals': () => renderBestiaryPage('Каталог', bestiary.animals),
  '/bestiary/classes': () =>
    renderDetailPage(
      'Каталог',
      bestiary.classes.map((item: Dict) => ({ ...item, sourcePage: undefined }))
    ),
  '/character/professions': () => renderDetailPage('Каталог', professions),
  '/character/trees': () => renderDetailPage('Каталог', trees),
  '/character/skills': () =>
    renderTablePage('Навыки', skills, [
      ['Название', (item) => item.name],
      ['Параметр', (item) => valueLabel('attribute', item.attribute)],
      ['Сложный', (item) => (item.complex ? 'да' : 'нет')],
      ['Кратко', (item) => item.summary]
    ]),
  '/combat/injuries': () => renderDetailPage('Каталог', injuries)
}

const normalizeRoute = (value: string): string => {
  let route = value.replace(/^https?:\/\/[^/]+/, '').replace(/\.md$/, '')
  if (route.endsWith('/index')) route = route.slice(0, -'/index'.length)
  if (route !== '/' && route.endsWith('/')) route = route.slice(0, -1)
  if (route && !route.startsWith('/')) route = `/${route}`
  return route || '/'
}

const withDigest = (body: string, digest: string): string => {
  const index = body.indexOf(marker)
  const base = (index === -1 ? body : body.slice(0, index)).trimEnd()
  const clean = digest.trim().replace(/\n{3,}/g, '\n\n')
  return `${base}\n\n${marker}\n\n${clean}\n`
}

const enrichFullBundle = () => {
  const file = join(distDir, 'llms-full.txt')
  const text = readFileSync(file, 'utf8')
  const parts = text.split(/\n\n---\n\n(?=---\nurl: )/)
  let enriched = 0
  const next = parts.map((part) => {
    const match = part.match(/^---\nurl: ([^\n]+)\n/)
    if (!match) return part
    const route = normalizeRoute(match[1])
    const build = pages[route]
    if (!build) return part
    enriched += 1
    return withDigest(part, build())
  })
  writeFileSync(file, next.join('\n\n---\n\n'), 'utf8')
  console.log(`LLM: дополнен llms-full.txt (${enriched} страниц)`)
}

const walkMarkdown = (dir: string): string[] => {
  const result: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      if (entry === 'pagefind' || entry === 'assets') continue
      result.push(...walkMarkdown(full))
    } else if (entry.endsWith('.md')) {
      result.push(full)
    }
  }
  return result
}

const enrichPages = () => {
  let enriched = 0
  for (const file of walkMarkdown(distDir)) {
    const route = normalizeRoute(relative(distDir, file).replace(/\\/g, '/'))
    const build = pages[route]
    if (!build) continue
    const body = readFileSync(file, 'utf8')
    writeFileSync(file, withDigest(body, build()), 'utf8')
    enriched += 1
  }
  console.log(`LLM: дополнено страниц (${enriched})`)
}

enrichFullBundle()
enrichPages()
