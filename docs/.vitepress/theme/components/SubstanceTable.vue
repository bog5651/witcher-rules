<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/substances.json'
import type { SubstanceIngredient } from '../../schemas/substance'
import { useItemDrawer } from '../composables/useItemDrawer'
import SubstanceIcon from './SubstanceIcon.vue'

const items = data.items as SubstanceIngredient[]
const { open: openDrawer } = useItemDrawer()

const availabilityLabels = {
  everywhere: 'Повсеместная',
  common: 'Обычная',
  rare: 'Редкая',
  unique: 'Уникальная'
} as const

const availabilityShort = {
  everywhere: 'П',
  common: 'О',
  rare: 'Р',
  unique: 'У'
} as const

const substanceLabels = {
  vitriol: 'Купорос',
  rebis: 'Ребис',
  aether: 'Эфир',
  quebrith: 'Квебрит',
  hydragenum: 'Гидраген',
  vermilion: 'Киноварь',
  sol: 'Солнце',
  caelum: 'Аер',
  fulgur: 'Фульгор'
} as const

const substanceOrder = [
  'vitriol',
  'rebis',
  'aether',
  'quebrith',
  'hydragenum',
  'vermilion',
  'sol',
  'caelum',
  'fulgur'
] as const

const query = ref('')
const substance = ref('all')
const availability = ref('all')
const sort = ref<'name' | 'price' | 'weight'>('name')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items
    .filter((item) => {
      if (substance.value !== 'all' && item.substance !== substance.value) return false
      if (availability.value !== 'all' && item.availability !== availability.value) return false
      if (!q) return true
      return normalized([item.name, item.where].join(' ')).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'price') return a.price - b.price
      if (sort.value === 'weight') {
        return (a.weight ?? Number.POSITIVE_INFINITY) - (b.weight ?? Number.POSITIVE_INFINITY)
      }
      return a.name.localeCompare(b.name, 'ru')
    })
})

const reset = () => {
  query.value = ''
  substance.value = 'all'
  availability.value = 'all'
  sort.value = 'name'
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')
const formatWeight = (item: SubstanceIngredient) =>
  item.weight === null ? '—' : formatNumber(item.weight)
const formatDC = (item: SubstanceIngredient) =>
  item.gatheringDC === null ? '—' : String(item.gatheringDC)

const openItem = (item: SubstanceIngredient) => {
  openDrawer({
    title: item.name,
    subtitle: `Субстанция: ${substanceLabels[item.substance]}`,
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Субстанция', value: substanceLabels[item.substance] },
      { label: 'Доступность', value: availabilityLabels[item.availability] },
      { label: 'Где найти', value: item.where },
      { label: 'Количество', value: item.quantity },
      { label: 'СЛ собирания', value: formatDC(item) },
      { label: 'Вес', value: item.weight === null ? '—' : `${formatWeight(item)} кг` },
      { label: 'Цена', value: `${formatNumber(item.price)} кр.` }
    ]
  })
}
</script>

<template>
  <div class="substance-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="substance-query">Поиск</label>
        <input
          id="substance-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или место поиска…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="substance-type">Субстанция</label>
        <select id="substance-type" v-model="substance" class="wr-select">
          <option value="all">Все</option>
          <option v-for="key in substanceOrder" :key="key" :value="key">
            {{ substanceLabels[key] }}
          </option>
        </select>
      </div>

      <div class="wr-field">
        <label for="substance-availability">Доступность</label>
        <select id="substance-availability" v-model="availability" class="wr-select">
          <option value="all">Все</option>
          <option value="everywhere">Повсеместная</option>
          <option value="common">Обычная</option>
          <option value="rare">Редкая</option>
          <option value="unique">Уникальная</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="substance-sort">Сортировка</label>
        <select id="substance-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="price">По цене</option>
          <option value="weight">По весу</option>
        </select>
      </div>

      <button class="substance-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <p class="substance-legend">
      <strong>Дос</strong> — доступность (П/О/Р/У); <strong>СЛ</strong> — сложность собирания.
      Колонка «Количество» относится только к собирательству.
    </p>

    <div v-if="visible.length" class="substance-table-wrap">
      <table class="substance-table">
        <thead>
          <tr>
            <th>Название</th>
            <th>Субстанция</th>
            <th title="Доступность">Дос</th>
            <th>Где найти</th>
            <th>Количество</th>
            <th title="Сложность собирания">СЛ</th>
            <th>Вес, кг</th>
            <th>Цена, кр.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visible" :id="`substance-${item.id}`" :key="item.id">
            <td class="col-name">
              <button type="button" class="wr-item-link" @click="openItem(item)">
                {{ item.name }}
              </button>
            </td>
            <td class="col-substance">
              <SubstanceIcon :name="item.substance" :size="20" />
            </td>
            <td>
              <span class="wr-abbr" :title="availabilityLabels[item.availability]">
                {{ availabilityShort[item.availability] }}
              </span>
            </td>
            <td class="col-where">{{ item.where }}</td>
            <td><RulesText :text="item.quantity" /></td>
            <td class="col-num">{{ formatDC(item) }}</td>
            <td class="col-num">{{ formatWeight(item) }}</td>
            <td class="col-num">{{ formatNumber(item.price) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>
  </div>
</template>

<style scoped>
.substance-catalog {
  margin-top: 1.5rem;
}

.substance-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.substance-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .substance-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.substance-legend {
  margin: 0 0 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.substance-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.substance-table {
  width: 100%;
  min-width: 1040px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.substance-table th,
.substance-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.substance-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--site-surface-2);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--site-faint);
  white-space: nowrap;
}

.substance-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.substance-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.substance-table tbody tr:last-child td {
  border-bottom: 0;
}

.substance-table .col-name {
  min-width: 210px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.substance-table .col-where {
  min-width: 200px;
  color: var(--site-muted);
}

.substance-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.substance-table .col-substance {
  width: 70px;
  text-align: center;
}

.substance-table .wr-abbr {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  padding: 0.1rem 0.25rem;
  border: 1px solid var(--site-border);
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  color: var(--site-muted);
  white-space: nowrap;
  cursor: help;
}
</style>
