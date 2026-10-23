<script setup lang="ts">
import { computed, ref } from 'vue'
import signsData from '../../data/signs.json'
import invocationsData from '../../data/invocations.json'
import ritualsData from '../../data/rituals.json'
import hexesData from '../../data/hexes.json'
import MagicTile from './MagicTile.vue'
import { useMagicDrawer } from '../composables/useMagicDrawer'

type Level = 'novice' | 'adept' | 'master'
type Element = 'mixed' | 'earth' | 'air' | 'fire' | 'water'
type Tradition = 'druid' | 'preacher' | 'archpriest'
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
const isTileDataset = computed(() => props.dataset === 'signs' || props.dataset === 'invocations')

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
  water: 'Вода'
}

const traditionLabels: Record<Tradition, string> = {
  druid: 'Друид',
  preacher: 'Проповедник',
  archpriest: 'Верховный жрец'
}

const traditionShortLabels: Record<Tradition, string> = {
  druid: 'Друид',
  preacher: 'Пропов.',
  archpriest: 'Архижрец'
}

const dangerLabels: Record<Danger, string> = {
  low: 'Низкая',
  medium: 'Средняя',
  high: 'Высокая'
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
    if (tradition.value !== 'all' && item.tradition !== tradition.value) return false
    if (!matchesBase(item)) return false
    return true
  }).length
})

const visible = computed(() => {
  const q = normalized(query.value.trim())

  return items.value
    .filter((item) => {
      if (level.value !== 'all' && item.level !== level.value) return false
      if (element.value !== 'all' && item.element !== element.value) return false
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
  tradition.value = initialTradition
  kind.value = 'all'
  sort.value = hasLevel.value ? 'level' : 'name'
}

const costLabel = (item: MagicItem) => {
  if (item.costVariable) return 'Вын: меняется'
  return `${item.cost} Вын`
}

const tileTone = (item: MagicItem) => {
  if (props.dataset === 'signs') return item.element ?? 'mixed'
  return item.tradition ?? 'druid'
}

const tileMeta = (item: MagicItem) => {
  if (props.dataset === 'signs' && item.element) return elementLabels[item.element]
  if (props.dataset === 'invocations' && item.tradition) return traditionShortLabels[item.tradition]
  return ''
}

const tileTag = (item: MagicItem) => {
  if (props.dataset === 'signs') return item.base ? 'Баз.' : 'Доп.'
  if (item.level) return levelShortLabels[item.level]
  return ''
}

const openMagicItem = (item: MagicItem) => {
  const stats = []

  if (item.element) stats.push({ label: 'Стихия', value: elementLabels[item.element] })
  if (item.tradition) stats.push({ label: 'Традиция', value: traditionLabels[item.tradition] })
  if (item.level) stats.push({ label: 'Уровень', value: levelLabels[item.level] })
  if (item.deity) stats.push({ label: 'Божество', value: item.deity })
  if (props.dataset === 'signs') {
    stats.push({ label: 'Вид', value: item.base ? 'Базовый' : 'Дополнительный' })
  }

  stats.push({ label: 'Затраты', value: costLabel(item) })
  if (item.range) stats.push({ label: 'Дистанция', value: item.range })
  if (item.duration) stats.push({ label: 'Длительность', value: item.duration })
  if (item.defense) stats.push({ label: 'Защита', value: item.defense })
  if (item.prepTime) stats.push({ label: 'Время подготовки', value: item.prepTime })
  if (item.checkDC) stats.push({ label: 'СЛ проверки', value: item.checkDC })
  if (item.components) stats.push({ label: 'Компоненты', value: item.components })
  if (item.ingredients) stats.push({ label: 'Ингредиенты', value: item.ingredients })
  if (item.danger) stats.push({ label: 'Опасность', value: dangerLabels[item.danger] })
  if (item.removal) stats.push({ label: 'Условия снятия', value: item.removal })

  const subtitleParts = [
    props.dataset === 'signs' ? 'Знак' : 'Инвокация',
    props.dataset === 'signs' && typeof item.base === 'boolean'
      ? item.base
        ? 'Базовый'
        : 'Дополнительный'
      : '',
    item.tradition ? traditionLabels[item.tradition] : item.element ? elementLabels[item.element] : '',
    item.level ? levelLabels[item.level] : item.deity || ''
  ].filter(Boolean)

  openMagic({
    title: item.name,
    subtitle: subtitleParts.join(' · '),
    stats,
    effect: item.effect,
    sourcePage: item.sourcePage
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
        </select>
      </div>

      <div v-if="hasTradition && !lockTradition" class="wr-field">
        <label :for="`magic-tradition-${dataset}`">Традиция</label>
        <select :id="`magic-tradition-${dataset}`" v-model="tradition" class="wr-select">
          <option value="all">Все</option>
          <option value="druid">Друид</option>
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

    <p v-if="isTileDataset && visible.length" class="magic-grid-hint">
      Нажмите на карточку, чтобы открыть подробности.
    </p>

    <div v-if="isTileDataset && visible.length" class="magic-tile-grid">
      <MagicTile
        v-for="item in visible"
        :id="`magic-${dataset}-${item.id}`"
        :key="item.id"
        :title="item.name"
        :kind-label="dataset === 'signs' ? 'Знак' : 'Инвокация'"
        :tone="tileTone(item)"
        :meta-label="tileMeta(item)"
        :tag-label="tileTag(item)"
        :cost-label="costLabel(item)"
        @open="openMagicItem(item)"
      />
    </div>

    <div v-else-if="visible.length" class="wr-cards">
      <article
        v-for="item in visible"
        :id="`magic-${dataset}-${item.id}`"
        :key="item.id"
        class="wr-card magic-card"
      >
        <div class="wr-card__top">
          <h3 class="wr-card__title">
            <a :href="`#magic-${dataset}-${item.id}`">{{ item.name }}</a>
          </h3>
          <span class="magic-cost">{{ costLabel(item) }}</span>
        </div>

        <div class="wr-badges">
          <span v-if="item.level" class="wr-badge" :class="`wr-badge--${item.level}`">
            {{ levelLabels[item.level] }}
          </span>
          <span v-if="item.element" class="wr-badge" :class="`wr-badge--${item.element}`">
            {{ elementLabels[item.element] }}
          </span>
          <span v-if="item.tradition" class="wr-badge wr-badge--tradition">
            {{ traditionLabels[item.tradition] }}
          </span>
          <span v-if="item.deity" class="wr-badge wr-badge--deity">{{ item.deity }}</span>
          <span v-if="item.base === true" class="wr-badge wr-badge--base">Базовый</span>
          <span v-if="item.base === false" class="wr-badge wr-badge--additional">Дополнительный</span>
        </div>

        <div class="wr-stat-grid">
          <div v-if="item.range" class="wr-stat">
            <span class="wr-stat__label">Дистанция</span>
            <span class="wr-stat__value">{{ item.range }}</span>
          </div>
          <div v-if="item.prepTime" class="wr-stat">
            <span class="wr-stat__label">Время подготовки</span>
            <span class="wr-stat__value">{{ item.prepTime }}</span>
          </div>
          <div v-if="item.checkDC" class="wr-stat">
            <span class="wr-stat__label">СЛ проверки</span>
            <span class="wr-stat__value">{{ item.checkDC }}</span>
          </div>
          <div v-if="item.duration" class="wr-stat">
            <span class="wr-stat__label">Длительность</span>
            <span class="wr-stat__value">{{ item.duration }}</span>
          </div>
          <div v-if="item.defense" class="wr-stat">
            <span class="wr-stat__label">Защита</span>
            <span class="wr-stat__value">{{ item.defense }}</span>
          </div>
          <div v-if="item.components" class="wr-stat">
            <span class="wr-stat__label">Компоненты</span>
            <span class="wr-stat__value">{{ item.components }}</span>
          </div>
          <div v-if="item.danger" class="wr-stat">
            <span class="wr-stat__label">Опасность</span>
            <span class="wr-stat__value">{{ dangerLabels[item.danger] }}</span>
          </div>
          <div v-if="item.costVariable" class="wr-stat">
            <span class="wr-stat__label">Затраты</span>
            <span class="wr-stat__value">меняются</span>
          </div>
        </div>

        <div class="wr-effect">
          <p>{{ item.effect }}</p>
        </div>

        <div v-if="item.ingredients" class="magic-ingredients">
          <span class="magic-ingredients__label">Ингредиенты</span>
          <p>{{ item.ingredients }}</p>
          <p v-if="item.alternateIngredients" class="magic-ingredients__alt">
            <strong>На замену:</strong> {{ item.alternateIngredients }}
          </p>
        </div>

        <div v-if="item.removal" class="magic-removal">
          <span class="magic-removal__label">Условия снятия</span>
          <p>{{ item.removal }}</p>
        </div>

        <div class="wr-source">Источник: стр. {{ item.sourcePage }}</div>
      </article>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="isTileDataset && visible.length" class="magic-search-index" aria-hidden="true">
      <p v-for="item in visible" :key="`search-${item.id}`">
        {{ item.name }}. {{ item.effect }} {{ item.range }} {{ item.duration }} {{ item.defense }}
        {{ item.deity }}
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

.magic-card {
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
}

.magic-card .wr-card__title a {
  color: var(--site-ink);
  text-decoration: none;
}

.magic-card .wr-card__title a:hover {
  color: var(--site-blood);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dark .magic-card .wr-card__title a:hover {
  color: var(--site-gold);
}

.magic-cost {
  flex: 0 0 auto;
  font-family: var(--site-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--site-muted);
  white-space: nowrap;
}

.magic-ingredients {
  margin-top: 0.9rem;
  padding: 0.75rem 0.9rem;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.magic-ingredients__label {
  display: block;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--site-faint);
  margin-bottom: 0.25rem;
}

.magic-ingredients p {
  margin: 0;
  font-family: var(--site-serif);
  font-size: 15px;
  line-height: 1.7;
}

.magic-ingredients__alt {
  margin-top: 0.4rem !important;
  color: var(--site-muted);
}

.magic-removal {
  margin-top: 0.9rem;
  padding: 0.75rem 0.9rem;
  background: color-mix(in srgb, var(--site-gold) 7%, transparent);
  border-left: 2px solid var(--site-gold);
  border-radius: 0 4px 4px 0;
}

.magic-removal__label {
  display: block;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--site-gold);
  margin-bottom: 0.25rem;
}

.magic-removal p {
  margin: 0;
  font-family: var(--site-serif);
  font-size: 15px;
  line-height: 1.7;
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
