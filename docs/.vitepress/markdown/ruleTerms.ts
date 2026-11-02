import type MarkdownIt from 'markdown-it'
import { effectGlossary } from '../theme/effectGlossary'

interface RuleLink {
  term: string
  href: string
}

/**
 * Curated rule links. Only the first mention on a page is linked, and never
 * on the target page itself, so the text does not turn into a wall of links.
 */
const ruleLinks: RuleLink[] = [
  { term: 'Словесная дуэль', href: '/combat/extra#словесная-дуэль' },
  { term: 'Словесной дуэли', href: '/combat/extra#словесная-дуэль' },
  { term: 'Перегрузка', href: '/magic/rules#перегрузка' },
  { term: 'Двимерит', href: '/magic/rules#двимерит' },
  { term: 'Ритуал', href: '/magic/rituals' },
  { term: 'Ритуалы', href: '/magic/rituals' },
  { term: 'Порча', href: '/magic/hexes' },
  { term: 'Порчу', href: '/magic/hexes' },
  { term: 'Порчи', href: '/magic/hexes' },
  { term: 'Знак', href: '/magic/signs' },
  { term: 'Знаки', href: '/magic/signs' },
  { term: 'Инвокация', href: '/magic/invocations/' },
  { term: 'Инвокации', href: '/magic/invocations/' },
  { term: 'Заклинание', href: '/magic/spells/' },
  { term: 'Заклинания', href: '/magic/spells/' },
  { term: 'Энергия', href: '/magic/rules#энергия' },
  { term: 'Удача', href: '/character/stats#основные-параметры' },
  { term: 'Репутация', href: '/character/reputation' },
  { term: 'Адреналин', href: '/combat/extra#адреналин' },
  { term: 'Критическое ранение', href: '/combat/injuries' },
  { term: 'Критические ранения', href: '/combat/injuries' },
  { term: 'Мутаген', href: '/witchers/mutations' },
  { term: 'Мутагены', href: '/witchers/mutations' },
  { term: 'Реликвия', href: '/crafting/runes#реликвии' },
  { term: 'Реликвии', href: '/crafting/runes#реликвии' },
  { term: 'Руна', href: '/crafting/runes#руны-оружие' },
  { term: 'Руны', href: '/crafting/runes#руны-оружие' },
  { term: 'Чертёж', href: '/crafting/schematics' },
  { term: 'Чертежи', href: '/crafting/schematics' },
  { term: 'Формула', href: '/alchemy/formulas' },
  { term: 'Формулы', href: '/alchemy/formulas' },
  { term: 'Субстанция', href: '/alchemy/substances' },
  { term: 'Субстанции', href: '/alchemy/substances' },
  { term: 'Прочность брони', href: '/combat/rules#броня' },
  { term: 'Сопротивление урону', href: '/combat/rules#сопротивление-урону' },
  { term: 'Укрытие', href: '/combat/rules#укрытие' },
  { term: 'Засада', href: '/combat/rules#засада' },
  { term: 'Инициатива', href: '/combat/rules#инициатива' },
  { term: 'Быстрое выхватывание', href: '/combat/rules#быстрое-выхватывание' },
  { term: 'Парное оружие', href: '/combat/rules#парное-оружие' },
  { term: 'Многослойная броня', href: '/combat/rules#многослойная-броня' },
  { term: 'Порог ранения', href: '/combat/rules#раны' },
  { term: 'Испытание против смерти', href: '/combat/effects#испытания-против-смерти' },
  { term: 'Стабилизация', href: '/combat/effects#стабилизация' },
  { term: 'Некротический урон', href: '/magic/necrotic-damage' },
  { term: 'Место силы', href: '/magic/places-of-power' },
  { term: 'Места силы', href: '/magic/places-of-power' },
  { term: 'Магический дар', href: '/magic/gifts' },
  { term: 'Магические дары', href: '/magic/gifts' },
  { term: 'Трофей', href: '/bestiary/trophies' },
  { term: 'Трофеи', href: '/bestiary/trophies' },
  { term: 'Гоэтия', href: '/magic/goetia' },
  { term: 'Некромантия', href: '/magic/necromancy' },
  { term: 'Тёмные искусства', href: '/gm/dark-arts' },
  { term: 'Лей-линия', href: '/world/ley-lines' },
  { term: 'Лей-линии', href: '/world/ley-lines' },
  { term: 'Пороги навыков', href: '/character/skills-thresholds' },
  { term: 'Пример боя', href: '/combat/example' },
  { term: 'Жизненный путь мага', href: '/character/lifepath-mage' },
  { term: 'Магический провал', href: '/magic/rules#последствия-магического-провала' },
  { term: 'Порог энергии', href: '/magic/rules#энергия' },
  { term: 'Очки Улучшения', href: '/character/development' },
  { term: 'Социальный статус', href: '/character/races#социальныи-статус' },
  { term: 'Социальное положение', href: '/character/races#социальныи-статус' },
  { term: 'Мутация', href: '/witchers/mutations' },
  { term: 'Мутации', href: '/witchers/mutations' },
  { term: 'Проклятие', href: '/gm/curses' },
  { term: 'Проклятия', href: '/gm/curses' }
]

const skipEffectPages = new Set(['glossary.md', 'combat/effects.md'])
const skipLinkPages = new Set(['index.md', 'about.md', 'glossary.md'])

const isLetter = (char: string | undefined) => !!char && /[А-Яа-яЁёA-Za-z]/.test(char)

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const normalize = (value: string) => value.toLocaleLowerCase('ru')

interface TermMatch {
  value: string
  id?: string
  entry?: (typeof effectGlossary)[number]
  href?: string
}

const effectMatches: TermMatch[] = effectGlossary
  .filter((entry) => entry.id !== 'armor-resistance' && entry.id !== 'damage-resistance')
  .flatMap((entry) =>
    [entry.term, ...(entry.aliases ?? [])].map((value) => ({
      value,
      id: entry.id,
      entry
    }))
  )
  .sort((a, b) => b.value.length - a.value.length)

const linkMatches: TermMatch[] = ruleLinks
  .map((item) => ({ value: item.term, href: item.href }))
  .sort((a, b) => b.value.length - a.value.length)

function findNext(text: string, matches: TermMatch[], seen: Set<string>) {
  const lower = normalize(text)
  let best: { index: number; match: TermMatch } | null = null

  for (const match of matches) {
    const key = match.id ?? match.href ?? match.value
    if (seen.has(key)) continue
    const needle = normalize(match.value)
    let index = lower.indexOf(needle)
    while (index !== -1) {
      const before = text[index - 1]
      const after = text[index + match.value.length]
      if (!isLetter(before) && !isLetter(after)) {
        if (
          !best ||
          index < best.index ||
          (index === best.index && match.value.length > best.match.value.length)
        ) {
          best = { index, match }
        }
        break
      }
      index = lower.indexOf(needle, index + 1)
    }
  }

  return best
}

function applyMatches(
  children: any[],
  state: any,
  matches: TermMatch[],
  build: (text: string, match: TermMatch) => any[],
  seen: Set<string>
) {
  const result: any[] = []
  let changed = false
  let linkDepth = 0

  for (const child of children) {
    if (child.type === 'link_open') {
      linkDepth += 1
      result.push(child)
      continue
    }
    if (child.type === 'link_close') {
      linkDepth = Math.max(0, linkDepth - 1)
      result.push(child)
      continue
    }
    if (child.type !== 'text' || !child.content || linkDepth > 0) {
      result.push(child)
      continue
    }

    let rest = child.content
    while (rest) {
      const found = findNext(rest, matches, seen)
      if (!found) {
        const plain = new state.Token('text', '', 0)
        plain.content = rest
        plain.level = child.level
        result.push(plain)
        break
      }

      const key = found.match.id ?? found.match.href ?? found.match.value
      const before = rest.slice(0, found.index)
      if (before) {
        const plain = new state.Token('text', '', 0)
        plain.content = before
        plain.level = child.level
        result.push(plain)
      }

      const value = rest.slice(found.index, found.index + found.match.value.length)
      result.push(...build(value, found.match))
      seen.add(key)
      changed = true
      rest = rest.slice(found.index + found.match.value.length)
    }
  }

  return { children: result, changed }
}

const effectToken = (state: any, text: string, match: TermMatch) => {
  const token = new state.Token('html_inline', '', 0)
  token.content = `<span class="wr-term-auto" data-wr-effect="${escapeHtml(
    match.id ?? ''
  )}" tabindex="0">${escapeHtml(text)}</span>`
  return token
}

const linkTokens = (state: any, text: string, match: TermMatch) => {
  const open = new state.Token('link_open', 'a', 1)
  open.attrSet('href', match.href ?? '#')
  open.attrSet('class', 'wr-rule-link')
  const label = new state.Token('text', '', 0)
  label.content = text
  const close = new state.Token('link_close', 'a', -1)
  return [open, label, close]
}

export function ruleTermsPlugin(md: MarkdownIt) {
  md.core.ruler.push('rule_terms', (state) => {
    if (state.tokens.length === 1 && state.tokens[0]?.type === 'inline') return

    const source = String(state.env?.relativePath ?? '').replace(/\\/g, '/')
    const showEffects = !skipEffectPages.has(source)
    const showLinks = !skipLinkPages.has(source)
    if (!showEffects && !showLinks) return

    const effectSeen = new Set<string>()
    const linkSeen = new Set<string>()
    let skipSection = false

    for (let index = 0; index < state.tokens.length; index++) {
      const token = state.tokens[index]
      if (token.type === 'heading_open') {
        const inline = state.tokens[index + 1]
        skipSection =
          inline?.type === 'inline' && /^См\. также/i.test(String(inline.content).trim())
        continue
      }
      if (token.type !== 'inline' || !token.children) continue
      if (skipSection) continue
      const previous = state.tokens[index - 1]
      if (previous?.type === 'heading_open') continue
      if (previous?.type?.startsWith('container_')) continue

      let children = token.children
      let changed = false

      if (showEffects) {
        const applied = applyMatches(
          children,
          state,
          effectMatches,
          (text, match) => [effectToken(state, text, match)],
          effectSeen
        )
        children = applied.children
        changed = changed || applied.changed
      }

      if (showLinks) {
        const applicable = linkMatches.filter((match) => {
          if (!match.href) return false
          const target = match.href.split('#')[0]
          return !source.startsWith(target.replace(/^\//, ''))
        })

        const applied = applyMatches(
          children,
          state,
          applicable,
          (text, match) => linkTokens(state, text, match),
          linkSeen
        )
        children = applied.children
        changed = changed || applied.changed
      }

      if (changed) token.children = children
    }
  })
}
