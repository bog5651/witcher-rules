<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import signsData from '../../data/signs.json'
import invocationsData from '../../data/invocations.json'
import ritualsData from '../../data/rituals.json'
import hexesData from '../../data/hexes.json'
import { bookList, getBook } from '../../data/books'
import MagicTile from './MagicTile.vue'
import { useMagicDrawer } from '../composables/useMagicDrawer'

type Level = 'novice' | 'adept' | 'master'
type Element = 'mixed' | 'earth' | 'air' | 'fire' | 'water' | 'necromancy'
type Tradition = 'druid' | 'archdruid' | 'preacher' | 'archpriest'
type Danger = 'low' | 'medium' | 'high'

interface MagicItem {
  id: string
  name: string
  level?: Level
  element?: Element
  tradition?: Tradition
  base?: boolean
  cost: number
  costVariable: boolean
  costText?: string
  healthCost?: string
  language?: 'ru' | 'en'
  effect: string
  range?: string
  duration?: string
  defense?: string
  prepTime?: string
  checkDC?: string
  ingredients?: string
  alternateIngredients?: string
  danger?: Danger
  removal?: string
  components?: string
  deity?: string
  sourcePage: number
  sourceBook?: string
}

type Dataset = 'signs' | 'invocations' | 'rituals' | 'hexes'

const props = defineProps<{
  dataset: Dataset
  tradition?: Tradition
  lockTradition?: boolean
}>()

const datasets: Record<Dataset, MagicItem[]> = {
  signs: signsData.items as MagicItem[],
  invocations: invocationsData.items as MagicItem[],
  rituals: ritualsData.items as MagicItem[],
  hexes: hexesData.items as MagicItem[]
}

const { openMagic } = useMagicDrawer()

const items = computed(() => datasets[props.dataset])

const kindLabels: Record<Dataset, string> = {
  signs: 'Знак',
  invocations: 'Инвокация',
  rituals: 'Ритуал',
  hexes: 'Порча'
}

const levelLabels: Record<Level, string> = {
  novice: 'Новичок',
  adept: 'Подмастерье',
  master: 'Мастер'
}

const levelShortLabels: Record<Level, string> = {
  novice: 'Нов.',
  adept: 'Подм.',
  master: 'Маст.'
}

const elementLabels: Record<Element, string> = {
  mixed: 'Смешанные',
  earth: 'Земля',
  air: 'Воздух',
  fire: 'Огонь',
  water: 'Вода',
  necromancy: 'Некромантия'
}

const traditionLabels: Record<Tradition, string> = {
  druid: 'Друид',
  archdruid: 'Архидруид',
  preacher: 'Проповедник',
  archpriest: 'Верховный жрец'
}

const traditionShortLabels: Record<Tradition, string> = {
  druid: 'Друид',
  archdruid: 'Архидруид',
  preacher: 'Пропов.',
  archpriest: 'Архижрец'
}

const dangerLabels: Record<Danger, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая'
}

const dangerShortLabels: Record<Danger, string> = {
  low: 'Низ.',
  medium: 'Сред.',
  high: 'Выс.'
}

const levelOrder: Record<Level, number> = { novice: 0, adept: 1, master: 2 }

const hasLevel = computed(() => items.value.some((item) => item.level))
const hasElement = computed(() => items.value.some((item) => item.element))
const hasTradition = computed(() => items.value.some((item) => item.tradition))
const hasBase = computed(() => items.value.some((item) => typeof item.base === 'boolean'))

const initialTradition = props.tradition ?? 'all'

const query = ref('')
const level = ref<'all' | Level>('all')
const element = ref<'all' | Element>('all')
const book = ref<'all' | string>('all')
const tradition = ref<'all' | Tradition>(initialTradition)
const kind = ref<'all' | 'base' | 'additional'>('all')
const sort = ref<'name' | 'level' | 'cost'>(hasLevel.value ? 'level' : 'name')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const matchesBase = (item: MagicItem) => {
  if (!hasBase.value || kind.value === 'all') return true
  if (kind.value === 'base') return item.base === true
  return item.base === false
}

const baseCount = computed(() => {
  return items.value.filter((item) => {
    if (level.value !== 'all' && item.level !== level.value) return false
    if (element.value !== 'all' && item.element !== element.value) return false
    if (book.value !== 'all' && getBook(item.sourceBook).id !== book.value) return false
    if (tradition.value !== 'all' && item.tradition !== tradition.value) return false
    if (!matchesBase(item)) return false
    return true
  }).length
})

const booksInData = computed(() =>
  bookList.filter((item) =>
    items.value.some(
      (entry) =>
        getBook(entry.sourceBook).id === item.id &&
        (tradition.value === 'all' || entry.tradition === tradition.value)
    )
  )
)

watch(booksInData, (list) => {
  if (book.value !== 'all' && !list.some((item) => item.id === book.value)) {
    book.value = 'all'
  }
})

const visible = computed(() => {
  const q = normalized(query.value.trim())

  return items.value
    .filter((item) => {
      if (level.value !== 'all' && item.level !== level.value) return false
      if (element.value !== 'all' && item.element !== element.value) return false
      if (book.value !== 'all' && getBook(item.sourceBook).id !== book.value) return false
      if (tradition.value !== 'all' && item.tradition !== tradition.value) return false
      if (!matchesBase(item)) return false
      if (!q) return true
      const haystack = normalized(
        [
          item.name,
          item.effect,
          item.range,
          item.duration,
          item.defense,
          item.components,
          item.ingredients,
          item.alternateIngredients,
          item.removal,
          item.deity
        ]
          .filter(Boolean)
          .join(' ')
      )
      return haystack.includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'name') return a.name.localeCompare(b.name, 'ru')
      if (sort.value === 'cost') return a.cost - b.cost || a.name.localeCompare(b.name, 'ru')
      const al = a.level ? levelOrder[a.level] : 3
      const bl = b.level ? levelOrder[b.level] : 3
      return al - bl || a.name.localeCompare(b.name, 'ru')
    })
})

const reset = () => {
  query.value = ''
  level.value = 'all'
  element.value = 'all'
  book.value = 'all'
  tradition.value = initialTradition
  kind.value = 'all'
  sort.value = hasLevel.value ? 'level' : 'name'
}

const costLabel = (item: MagicItem) => {
  if (item.costText) return item.costText
  if (item.costVariable) return 'Вын: меняется'
  return `${item.cost} Вын`
}

const tileTone = (item: MagicItem) => {
  if (props.dataset === 'signs') return item.element ?? 'mixed'
  if (props.dataset === 'invocations') return item.tradition ?? 'druid'
  if (props.dataset === 'rituals') return 'ritual'
  return 'hex'
}

const tileMeta = (item: MagicItem) => {
  if (props.dataset === 'signs' && item.element) return elementLabels[item.element]
  if (props.dataset === 'invocations' && item.tradition) return traditionShortLabels[item.tradition]
  if (props.dataset === 'rituals') return 'Ритуал'
  return 'Порча'
}

const tileTag = (item: MagicItem) => {
  if (props.dataset === 'signs') return item.base ? 'Баз.' : 'Доп.'
  if (props.dataset === 'hexes' && item.danger) return dangerShortLabels[item.danger]
  if (item.level) return levelShortLabels[item.level]
  return ''
}

const openMagicItem = (item: MagicItem) => {
  const stats: { label: string; value: string }[] = []
  const kindLabel = kindLabels[props.dataset]
  const subtitleParts: string[] = [kindLabel]

  if (props.dataset === 'rituals') {
    if (item.level) stats.push({ label: 'Уровень', value: levelLabels[item.level] })
    stats.push({ label: 'Затраты', value: costLabel(item) })
    if (item.prepTime) stats.push({ label: 'Время подготовки', value: item.prepTime })
    if (item.checkDC) stats.push({ label: 'СЛ проверки', value: item.checkDC })
    if (item.duration) stats.push({ label: 'Длительность', value: item.duration })
    if (item.ingredients) stats.push({ label: 'Ингредиенты', value: item.ingredients })
    if (item.alternateIngredients) {
      stats.push({ label: 'На замену', value: item.alternateIngredients })
    }
    if (item.level) subtitleParts.push(levelLabels[item.level])
  } else if (props.dataset === 'hexes') {
    if (item.danger) {
      stats.push({ label: 'Опасность', value: dangerLabels[item.danger] })
      subtitleParts.push(`${dangerLabels[item.danger]} опасность`)
    }
    stats.push({ label: 'Затраты', value: costLabel(item) })
    if (item.removal) stats.push({ label: 'Условия снятия', value: item.removal })
  } else {
    if (item.element) stats.push({ label: 'Стихия', value: elementLabels[item.element] })
    if (item.tradition) stats.push({ label: 'Традиция', value: traditionLabels[item.tradition] })
    if (item.level) stats.push({ label: 'Уровень', value: levelLabels[item.level] })
    if (item.deity) stats.push({ label: 'Божество', value: item.deity })
    if (props.dataset === 'signs') {
      stats.push({ label: 'Вид', value: item.base ? 'Базовый' : 'Дополнительный' })
    }

    stats.push({ label: 'Затраты', value: costLabel(item) })
    if (item.healthCost) stats.push({ label: 'Затраты ПЗ', value: item.healthCost })
    if (item.language === 'en') stats.push({ label: 'Язык', value: 'Английский (оригинал)' })
    if (item.range) stats.push({ label: 'Дистанция', value: item.range })
    if (item.duration) stats.push({ label: 'Длительность', value: item.duration })
    if (item.defense) stats.push({ label: 'Защита', value: item.defense })

    if (props.dataset === 'signs') {
      if (typeof item.base === 'boolean') {
        subtitleParts.push(item.base ? 'Базовый' : 'Дополнительный')
      }
      if (item.element) subtitleParts.push(elementLabels[item.element])
    } else {
      if (item.tradition) subtitleParts.push(traditionLabels[item.tradition])
      if (item.level) subtitleParts.push(levelLabels[item.level])
      else if (item.deity) subtitleParts.push(item.deity)
    }
  }

  openMagic({
    title: item.name,
    subtitle: subtitleParts.filter(Boolean).join(' · '),
    stats,
    effect: item.effect,
    sourcePage: item.sourcePage,
    sourceBook: item.sourceBook
  })
}
</script>

<template>
  <div class="magic-catalog">
    <div v-if="items.length" class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label :for="`magic-query-${dataset}`">Поиск</label>
        <input
          :id="`magic-query-${dataset}`"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или эффект…"
          autocomplete="off"
        />
      </div>

      <div v-if="hasLevel" class="wr-field">
        <label :for="`magic-level-${dataset}`">Уровень</label>
        <select :id="`magic-level-${dataset}`" v-model="level" class="wr-select">
          <option value="all">Все</option>
          <option value="novice">Новичок</option>
          <option value="adept">Подмастерье</option>
          <option value="master">Мастер</option>
        </select>
      </div>

      <div v-if="hasElement" class="wr-field">
        <label :for="`magic-element-${dataset}`">Стихия</label>
        <select :id="`magic-element-${dataset}`" v-model="element" class="wr-select">
          <option value="all">Все</option>
          <option value="mixed">Смешанные</option>
          <option value="earth">Земля</option>
          <option value="air">Воздух</option>
          <option value="fire">Огонь</option>
          <option value="water">Вода</option>
          <option value="necromancy">Некромантия</option>
        </select>
      </div>

      <div v-if="booksInData.length > 1" class="wr-field">
        <label :for="`magic-book-${dataset}`">Книга</label>
        <select :id="`magic-book-${dataset}`" v-model="book" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in booksInData" :key="item.id" :value="item.id">
            {{ item.short }} — {{ item.note }}
          </option>
        </select>
      </div>

      <div v-if="hasTradition && !lockTradition" class="wr-field">
        <label :for="`magic-tradition-${dataset}`">Традиция</label>
        <select :id="`magic-tradition-${dataset}`" v-model="tradition" class="wr-select">
          <option value="all">Все</option>
          <option value="druid">Друид</option>
          <option value="archdruid">Архидруид</option>
          <option value="preacher">Проповедник</option>
          <option value="archpriest">Верховный жрец</option>
        </select>
      </div>

      <div v-if="hasBase" class="wr-field">
        <label :for="`magic-kind-${dataset}`">Вид</label>
        <select :id="`magic-kind-${dataset}`" v-model="kind" class="wr-select">
          <option value="all">Все</option>
          <option value="base">Базовые</option>
          <option value="additional">Дополнительные</option>
        </select>
      </div>

      <div class="wr-field">
        <label :for="`magic-sort-${dataset}`">Сортировка</label>
        <select :id="`magic-sort-${dataset}`" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="level">По уровню</option>
          <option value="cost">По затратам</option>
        </select>
      </div>

      <button class="magic-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ baseCount }}</span>
    </div>

    <p v-if="visible.length" class="magic-grid-hint">
      Нажмите на карточку, чтобы открыть подробности.
    </p>

    <div v-if="visible.length" class="magic-tile-grid">
      <MagicTile
        v-for="item in visible"
        :id="`magic-${dataset}-${item.id}`"
        :key="item.id"
        :title="item.name"
        :kind-label="kindLabels[dataset]"
        :tone="tileTone(item)"
        :meta-label="tileMeta(item)"
        :tag-label="tileTag(item)"
        :cost-label="costLabel(item)"
        :source-book="item.sourceBook"
        :source-page="item.sourcePage"
        :language="item.language"
        @open="openMagicItem(item)"
      />
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="visible.length" class="magic-search-index" aria-hidden="true">
      <p v-for="item in visible" :key="`search-${item.id}`">
        <RulesText
          :text="
            [item.name, item.effect, item.range, item.duration, item.defense, item.ingredients, item.alternateIngredients, item.removal, item.deity]
              .filter(Boolean)
              .join(' ')
          "
        />
      </p>
    </div>
  </div>
</template>

<style scoped>
.magic-tile-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

.magic-grid-hint {
  margin: 0.8rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.4;
  color: var(--site-faint);
}

.magic-search-index {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

.magic-reset {
  align-self: flex-end;
  padding: 0.45rem 0.7rem;
  font-family: var(--site-sans);
  font-size: 13px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.magic-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .magic-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

@media (max-width: 1100px) {
  .magic-tile-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .magic-tile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .magic-tile-grid {
    grid-template-columns: 1fr;
  }

  .magic-reset {
    width: 100%;
  }
}
</style>
