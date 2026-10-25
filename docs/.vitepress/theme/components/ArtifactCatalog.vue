<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/artifacts.json'
import { bookList, getBook } from '../../data/books'
import type { Artifact, ArtifactKind } from '../../schemas/artifact'
import { useItemDrawer } from '../composables/useItemDrawer'
import EffectText from './EffectText.vue'

const artifacts = data.items as Artifact[]
const { open } = useItemDrawer()

const kindLabels: Record<ArtifactKind, string> = {
  relic: 'Реликвия',
  weapon: 'Оружие',
  armor: 'Броня',
  focus: 'Фокусирующий предмет'
}

const kindShort: Record<ArtifactKind, string> = {
  relic: 'Реликвия',
  weapon: 'Оружие',
  armor: 'Броня',
  focus: 'Фокус'
}

const query = ref('')
const kind = ref<'all' | ArtifactKind>('all')
const book = ref<'all' | string>('all')
const sort = ref<'name' | 'kind'>('name')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const booksInData = computed(() =>
  bookList.filter((item) => artifacts.some((entry) => getBook(entry.sourceBook).id === item.id))
)

const baseCount = computed(
  () => artifacts.filter((item) => kind.value === 'all' || item.kind === kind.value).length
)

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return artifacts
    .filter((item) => {
      if (kind.value !== 'all' && item.kind !== kind.value) return false
      if (book.value !== 'all' && getBook(item.sourceBook).id !== book.value) return false
      if (!q) return true
      return normalized(
        [item.name, item.category, item.effect, ...item.description, ...item.stats.map((stat) => stat.value)].join(' ')
      ).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'kind') {
        return a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name, 'ru')
      }
      return a.name.localeCompare(b.name, 'ru')
    })
})

const reset = () => {
  query.value = ''
  kind.value = 'all'
  book.value = 'all'
  sort.value = 'name'
}

const openArtifact = (item: Artifact) => {
  open({
    title: item.name,
    subtitle: `Артефакт · ${kindLabels[item.kind]} · ${item.category}`,
    stats: item.stats,
    description: item.description.join('\n\n'),
    descriptionTitle: 'Описание',
    sourcePage: item.sourcePage,
    sourceBook: item.sourceBook
  })
}
</script>

<template>
  <div class="artifact-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="artifact-query">Поиск</label>
        <input
          id="artifact-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название, эффект или описание…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="artifact-kind">Тип</label>
        <select id="artifact-kind" v-model="kind" class="wr-select">
          <option value="all">Все</option>
          <option v-for="(label, value) in kindLabels" :key="value" :value="value">{{ label }}</option>
        </select>
      </div>

      <div v-if="booksInData.length > 1" class="wr-field">
        <label for="artifact-book">Книга</label>
        <select id="artifact-book" v-model="book" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in booksInData" :key="item.id" :value="item.id">
            {{ item.short }} — {{ item.note }}
          </option>
        </select>
      </div>

      <div class="wr-field">
        <label for="artifact-sort">Сортировка</label>
        <select id="artifact-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="kind">По типу</option>
        </select>
      </div>

      <button class="artifact-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ baseCount }}</span>
    </div>

    <p class="artifact-hint">
      Нажмите на название, чтобы открыть полный эффект, описание и характеристики.
    </p>

    <div v-if="visible.length" class="artifact-table-wrap">
      <table class="artifact-table" aria-label="Магические артефакты">
        <thead>
          <tr>
            <th scope="col">Название</th>
            <th scope="col">Тип</th>
            <th scope="col">Эффект</th>
            <th scope="col">Источник</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visible" :key="item.id" @click="openArtifact(item)">
            <td>
              <button class="artifact-open" type="button" @click.stop="openArtifact(item)">
                {{ item.name }}
              </button>
            </td>
            <td>
              <span class="artifact-kind">{{ kindShort[item.kind] }}</span>
              <span class="artifact-category">{{ item.category }}</span>
            </td>
            <td><EffectText :text="item.effect" /></td>
            <td><SourceBadge :book="item.sourceBook" :page="item.sourcePage" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="visible.length" class="artifact-search-index" aria-hidden="true">
      <p v-for="item in visible" :key="`search-${item.id}`">
        <RulesText :text="[item.name, item.effect, ...item.description].join(' ')" />
      </p>
    </div>
  </div>
</template>

<style scoped>
.artifact-reset {
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

.artifact-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .artifact-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.artifact-hint {
  margin: 0.8rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.4;
  color: var(--site-muted);
}

.artifact-table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.artifact-table {
  width: 100%;
  min-width: 760px;
  margin: 0;
  border: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
}

.artifact-table tr {
  background: transparent;
  border: 0;
}

.artifact-table th {
  padding: 0.45rem 0.55rem;
  text-align: left;
  white-space: nowrap;
  background: var(--site-surface-2);
  border: 0;
  border-bottom: 1px solid var(--site-border-strong);
  color: var(--site-muted);
}

.artifact-table td {
  padding: 0.45rem 0.55rem;
  vertical-align: top;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--site-border);
  color: var(--site-muted);
}

.artifact-table tbody tr {
  cursor: pointer;
}

.artifact-table tbody tr:nth-child(2n),
.artifact-table tbody tr:nth-child(2n) td {
  background: transparent;
}

.artifact-table tbody tr:hover td {
  background: var(--site-surface-2);
}

.artifact-table tbody tr:last-child td {
  border-bottom: 0;
}

.artifact-open {
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

.artifact-open:hover {
  color: var(--site-blood);
}

.artifact-open:focus-visible {
  outline: 2px solid var(--site-gold);
  outline-offset: 2px;
}

.dark .artifact-open:hover {
  color: var(--site-gold);
}

.artifact-kind,
.artifact-category {
  display: block;
  white-space: nowrap;
}

.artifact-kind {
  font-weight: 600;
  color: var(--site-ink);
}

.artifact-category {
  margin-top: 0.1rem;
  font-size: 10px;
  color: var(--site-faint);
}

.artifact-search-index {
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
  .artifact-reset {
    width: 100%;
  }
}
</style>
