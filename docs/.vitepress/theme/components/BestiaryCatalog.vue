<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import data from '../../data/bestiary.json'
import { bookList, getBook } from '../../data/books'
import type { BestiaryClass, BestiaryEntry, BestiaryVariant } from '../../schemas/bestiary'
import BestiaryDrawer from './BestiaryDrawer.vue'

const props = defineProps<{ dataset: 'monsters' | 'animals' }>()

interface Row {
  entry: BestiaryEntry
  variant: BestiaryVariant
  variantIndex: number
}

const classes = data.classes as BestiaryClass[]
const classById = new Map(classes.map((item) => [item.id, item]))
const entries = computed(() =>
  props.dataset === 'monsters'
    ? (data.monsters as BestiaryEntry[])
    : (data.animals as BestiaryEntry[])
)
const hasDifficulty = computed(() => props.dataset === 'monsters')

const overallLabels = {
  simple: 'Простые',
  medium: 'Средние',
  complex: 'Сложные'
} as const

const tierLabels = {
  ordinary: 'Обычные',
  unremarkable: 'Незаурядные',
  hard: 'Трудные'
} as const

const overallOrder = { simple: 0, medium: 1, complex: 2 } as const
const tierOrder = { ordinary: 0, unremarkable: 1, hard: 2 } as const

const rows = computed<Row[]>(() =>
  entries.value.flatMap((entry) =>
    entry.variants.map((variant, variantIndex) => ({ entry, variant, variantIndex }))
  )
)

const query = ref('')
const classFilter = ref<'all' | string>('all')
const book = ref<'all' | string>('all')
const overall = ref<'all' | 'simple' | 'medium' | 'complex'>('all')
const tier = ref<'all' | 'ordinary' | 'unremarkable' | 'hard'>('all')
const sort = ref<'name' | 'difficulty' | 'reward' | 'hp'>('name')
const selected = ref<{ entry: BestiaryEntry; variantIndex: number } | null>(null)

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const className = (entry: BestiaryEntry) => classById.get(entry.classId)?.name ?? '—'

const difficultyLabel = (entry: BestiaryEntry) => {
  if (!entry.difficulty) return '—'
  return `${overallLabels[entry.difficulty.overall]} · ${tierLabels[entry.difficulty.tier]}`
}

const rowName = (row: Row) =>
  row.entry.variants.length > 1 ? row.variant.name : row.entry.name

const rowSub = (row: Row) =>
  row.entry.variants.length > 1 ? row.entry.name : ''

const searchText = (row: Row) =>
  normalized(
    [
      row.entry.name,
      row.variant.name,
      className(row.entry),
      row.entry.flavor?.check,
      row.entry.flavor?.quote,
      row.entry.flavor?.author,
      row.entry.flavor?.knowledgeCheck,
      row.entry.flavor?.text.join(' '),
      ...Object.values(row.variant.size).filter((item): item is string => Boolean(item)),
      ...row.variant.skills.map((item) => item.name),
      ...row.variant.abilities.flatMap((item) => [item.name, item.description]),
      ...row.variant.weapons.flatMap((item) => [item.name, item.damage, item.effect]),
      ...row.variant.loot.map((item) => item.name),
      ...row.variant.vulnerabilities.map((item) => item.name),
      ...row.entry.notes.flatMap((item) => [item.title, item.text]),
      ...row.entry.extraTables.flatMap((table) => [
        table.title,
        ...table.columns,
        ...table.rows.flat()
      ])
    ]
      .filter(Boolean)
      .join(' ')
  )

const visible = computed(() => {
  const q = normalized(query.value.trim())

  return rows.value
    .filter((row) => {
      if (classFilter.value !== 'all' && row.entry.classId !== classFilter.value) return false
      if (book.value !== 'all' && getBook(row.entry.sourceBook).id !== book.value) return false
      if (overall.value !== 'all' && row.entry.difficulty?.overall !== overall.value) return false
      if (tier.value !== 'all' && row.entry.difficulty?.tier !== tier.value) return false
      if (!q) return true
      return searchText(row).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'name') return rowName(a).localeCompare(rowName(b), 'ru')
      if (sort.value === 'hp') {
        return b.variant.derived.hp - a.variant.derived.hp || rowName(a).localeCompare(rowName(b), 'ru')
      }
      if (sort.value === 'reward') {
        return (
          (b.entry.reward ?? -1) - (a.entry.reward ?? -1) ||
          rowName(a).localeCompare(rowName(b), 'ru')
        )
      }
      const aOverall = a.entry.difficulty ? overallOrder[a.entry.difficulty.overall] : 3
      const bOverall = b.entry.difficulty ? overallOrder[b.entry.difficulty.overall] : 3
      const aTier = a.entry.difficulty ? tierOrder[a.entry.difficulty.tier] : 3
      const bTier = b.entry.difficulty ? tierOrder[b.entry.difficulty.tier] : 3
      return aOverall - bOverall || aTier - bTier || rowName(a).localeCompare(rowName(b), 'ru')
    })
})

const visibleEntries = computed(() => new Set(visible.value.map((row) => row.entry.id)).size)

const booksInData = computed(() =>
  bookList.filter((item) => entries.value.some((entry) => getBook(entry.sourceBook).id === item.id))
)

const reset = () => {
  query.value = ''
  classFilter.value = 'all'
  book.value = 'all'
  overall.value = 'all'
  tier.value = 'all'
  sort.value = 'name'

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.delete('class')
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
}

const openRow = (row: Row, event?: MouseEvent) => {
  const rowElement = (event?.currentTarget as HTMLElement | null)?.closest('tr')
  rowElement?.querySelector<HTMLButtonElement>('.bestiary-open')?.focus()
  selected.value = { entry: row.entry, variantIndex: row.variantIndex }
}

const applyClassFromUrl = () => {
  if (props.dataset !== 'monsters') return
  const requested = new URLSearchParams(window.location.search).get('class')
  classFilter.value =
    requested && classes.some((item) => item.id === requested) ? requested : 'all'
}

onMounted(() => {
  applyClassFromUrl()
  window.addEventListener('popstate', applyClassFromUrl)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', applyClassFromUrl)
})
</script>

<template>
  <div class="bestiary-catalog">
    <div v-if="rows.length" class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label :for="`bestiary-query-${dataset}`">Поиск</label>
        <input
          :id="`bestiary-query-${dataset}`"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название, способность, добыча…"
          autocomplete="off"
        />
      </div>

      <div v-if="hasDifficulty" class="wr-field">
        <label :for="`bestiary-class-${dataset}`">Класс</label>
        <select :id="`bestiary-class-${dataset}`" v-model="classFilter" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in classes" :key="item.id" :value="item.id">{{ item.name }}</option>
        </select>
      </div>

      <div v-if="booksInData.length > 1" class="wr-field">
        <label :for="`bestiary-book-${dataset}`">Книга</label>
        <select :id="`bestiary-book-${dataset}`" v-model="book" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in booksInData" :key="item.id" :value="item.id">
            {{ item.short }} — {{ item.note }}
          </option>
        </select>
      </div>

      <div v-if="hasDifficulty" class="wr-field">
        <label :for="`bestiary-overall-${dataset}`">Сложность</label>
        <select :id="`bestiary-overall-${dataset}`" v-model="overall" class="wr-select">
          <option value="all">Все</option>
          <option value="simple">Простые</option>
          <option value="medium">Средние</option>
          <option value="complex">Сложные</option>
        </select>
      </div>

      <div v-if="hasDifficulty" class="wr-field">
        <label :for="`bestiary-tier-${dataset}`">Уровень</label>
        <select :id="`bestiary-tier-${dataset}`" v-model="tier" class="wr-select">
          <option value="all">Все</option>
          <option value="ordinary">Обычные</option>
          <option value="unremarkable">Незаурядные</option>
          <option value="hard">Трудные</option>
        </select>
      </div>

      <div class="wr-field">
        <label :for="`bestiary-sort-${dataset}`">Сортировка</label>
        <select :id="`bestiary-sort-${dataset}`" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option v-if="hasDifficulty" value="difficulty">По сложности</option>
          <option v-if="hasDifficulty" value="reward">По награде</option>
          <option value="hp">По ПЗ</option>
        </select>
      </div>

      <button class="bestiary-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visibleEntries }} из {{ entries.length }}</span>
    </div>

    <p v-if="visible.length" class="bestiary-hint">
      Нажмите на название, чтобы открыть полный блок характеристик.
      <template v-if="hasDifficulty">
        У некоторых чудовищ есть варианты — они показаны отдельными строками.
      </template>
    </p>

    <div v-if="visible.length" class="bestiary-table-wrap">
      <table
        class="bestiary-table"
        :aria-label="dataset === 'monsters' ? 'Чудовища бестиария' : 'Животные бестиария'"
      >
        <thead>
          <tr>
            <th scope="col">Название</th>
            <th v-if="hasDifficulty" scope="col">Класс</th>
            <th v-if="hasDifficulty" scope="col">Сложность</th>
            <th scope="col">Броня</th>
            <th scope="col">ПЗ</th>
            <th scope="col">Бег</th>
            <th v-if="hasDifficulty" scope="col">Награда, крон</th>
            <th scope="col">Источник</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in visible"
            :key="`${row.entry.id}-${row.variant.name}`"
            @click="openRow(row, $event)"
          >
            <td>
              <button class="bestiary-open" type="button" @click.stop="openRow(row, $event)">
                {{ rowName(row) }}
              </button>
              <span v-if="rowSub(row)" class="bestiary-row-sub">{{ rowSub(row) }}</span>
            </td>
            <td v-if="hasDifficulty">
              <span class="bestiary-class">{{ className(row.entry) }}</span>
            </td>
            <td v-if="hasDifficulty">{{ difficultyLabel(row.entry) }}</td>
            <td>{{ row.variant.armor }}</td>
            <td>{{ row.variant.derived.hp }}</td>
            <td>{{ row.variant.derived.run }}</td>
            <td v-if="hasDifficulty">{{ row.entry.reward ?? '—' }}</td>
            <td>
              <SourceBadge
                :book="row.entry.sourceBook"
                :page="row.entry.descriptionPage ?? row.entry.statPage"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="visible.length" class="bestiary-search-index" aria-hidden="true">
      <p v-for="row in visible" :key="`search-${row.entry.id}-${row.variant.name}`">
        <RulesText :text="[row.entry.name, row.variant.name, searchText(row)].filter(Boolean).join('. ')" />
      </p>
    </div>

    <BestiaryDrawer
      v-if="selected"
      :entry="selected.entry"
      :initial-variant="selected.variantIndex"
      @close="selected = null"
    />
  </div>
</template>

<style scoped>
.bestiary-reset {
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

.bestiary-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .bestiary-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.bestiary-hint {
  margin: 0.8rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.4;
  color: var(--site-muted);
}

.bestiary-table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.bestiary-table {
  width: 100%;
  min-width: 760px;
  margin: 0;
  border: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
}

.bestiary-table tr {
  background: transparent;
  border: 0;
}

.bestiary-table th {
  padding: 0.45rem 0.55rem;
  text-align: left;
  white-space: nowrap;
  background: var(--site-surface-2);
  border: 0;
  border-bottom: 1px solid var(--site-border-strong);
  color: var(--site-muted);
}

.bestiary-table td {
  padding: 0.45rem 0.55rem;
  vertical-align: top;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--site-border);
  color: var(--site-muted);
}

.bestiary-table tbody tr {
  cursor: pointer;
}

.bestiary-table tbody tr:nth-child(2n),
.bestiary-table tbody tr:nth-child(2n) td {
  background: transparent;
}

.bestiary-table tbody tr:hover td {
  background: var(--site-surface-2);
}

.bestiary-table tbody tr:last-child td {
  border-bottom: 0;
}

.bestiary-open {
  padding: 0;
  font-family: var(--site-serif);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--site-ink);
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.bestiary-open:hover {
  color: var(--site-blood);
}

.bestiary-open:focus-visible {
  outline: 2px solid var(--site-gold);
  outline-offset: 2px;
}

.dark .bestiary-open:hover {
  color: var(--site-gold);
}

.bestiary-row-sub {
  display: block;
  margin-top: 0.1rem;
  font-size: 10px;
  color: var(--site-muted);
}

.bestiary-class {
  white-space: nowrap;
}

.bestiary-search-index {
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

@media (max-width: 520px) {
  .bestiary-reset {
    width: 100%;
  }
}
</style>
