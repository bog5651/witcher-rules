<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/components.json'
import type { ComponentItem } from '../../schemas/component'
import { useItemDrawer } from '../composables/useItemDrawer'

const items = data.items as ComponentItem[]
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

const categoryLabels = {
  crafting: 'Ремесленные материалы',
  animal: 'Шкуры и части животных',
  alchemical: 'Алхимические пропитки и составы',
  metal: 'Слитки и минералы'
} as const

const query = ref('')
const category = ref('all')
const availability = ref('all')
const sort = ref<'name' | 'price' | 'weight'>('name')
const selected = ref<string[]>([])

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items
    .filter((item) => {
      if (category.value !== 'all' && item.category !== category.value) return false
      if (availability.value !== 'all' && item.availability !== availability.value) return false
      if (!q) return true
      return normalized([item.name, item.where].join(' ')).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'price') return a.price - b.price
      if (sort.value === 'weight') return a.weight - b.weight
      return a.name.localeCompare(b.name, 'ru')
    })
})

const allVisibleSelected = computed(() => {
  return visible.value.length > 0 && visible.value.every((item) => selected.value.includes(item.id))
})

const toggle = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((item) => item !== id)
    : [...selected.value, id]
}

const toggleAllVisible = () => {
  if (allVisibleSelected.value) {
    const ids = new Set(visible.value.map((item) => item.id))
    selected.value = selected.value.filter((id) => !ids.has(id))
  } else {
    selected.value = [...new Set([...selected.value, ...visible.value.map((item) => item.id)])]
  }
}

const clearSelection = () => {
  selected.value = []
}

const selectedItems = computed(() => items.filter((item) => selected.value.includes(item.id)))
const totalWeight = computed(() => selectedItems.value.reduce((sum, item) => sum + item.weight, 0))
const totalPrice = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price, 0))

const reset = () => {
  query.value = ''
  category.value = 'all'
  availability.value = 'all'
  sort.value = 'name'
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')
const formatDC = (item: ComponentItem) =>
  item.gatheringDC === null ? '—' : String(item.gatheringDC)

const openItem = (item: ComponentItem) => {
  openDrawer({
    title: item.name,
    subtitle: categoryLabels[item.category],
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Категория', value: categoryLabels[item.category] },
      { label: 'Доступность', value: availabilityLabels[item.availability] },
      { label: 'Где найти', value: item.where },
      { label: 'Количество', value: item.quantity },
      { label: 'СЛ собирания', value: formatDC(item) },
      { label: 'Вес', value: `${formatNumber(item.weight)} кг` },
      { label: 'Цена', value: `${formatNumber(item.price)} кр.` }
    ]
  })
}
</script>

<template>
  <div class="component-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="component-query">Поиск</label>
        <input
          id="component-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или место поиска…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="component-category">Категория</label>
        <select id="component-category" v-model="category" class="wr-select">
          <option value="all">Все</option>
          <option v-for="(label, key) in categoryLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <div class="wr-field">
        <label for="component-availability">Доступность</label>
        <select id="component-availability" v-model="availability" class="wr-select">
          <option value="all">Все</option>
          <option value="everywhere">Повсеместная</option>
          <option value="common">Обычная</option>
          <option value="rare">Редкая</option>
          <option value="unique">Уникальная</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="component-sort">Сортировка</label>
        <select id="component-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="price">По цене</option>
          <option value="weight">По весу</option>
        </select>
      </div>

      <button class="component-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <div class="wr-summary">
      <span>Выбрано: <strong>{{ selected.length }}</strong></span>
      <span>Вес: <strong>{{ formatNumber(totalWeight) }} кг</strong></span>
      <span>Цена: <strong>{{ formatNumber(totalPrice) }} кр.</strong></span>
      <button
        v-if="selected.length"
        class="component-reset"
        type="button"
        @click="clearSelection"
      >
        Сбросить выбор
      </button>
    </div>

    <p class="component-legend">
      <strong>Дос</strong> — доступность (П/О/Р/У); <strong>СЛ</strong> — сложность собирания.
      Колонка «Количество» относится только к собирательству.
    </p>

    <div v-if="visible.length" class="component-table-wrap">
      <table class="component-table">
        <thead>
          <tr>
            <th class="col-check">
              <input
                type="checkbox"
                :checked="allVisibleSelected"
                aria-label="Выбрать все видимые"
                @change="toggleAllVisible"
              />
            </th>
            <th>Название</th>
            <th>Категория</th>
            <th title="Доступность">Дос</th>
            <th>Где найти</th>
            <th>Количество</th>
            <th title="Сложность собирания">СЛ</th>
            <th>Вес, кг</th>
            <th>Цена, кр.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visible" :id="`component-${item.id}`" :key="item.id">
            <td class="col-check">
              <input
                type="checkbox"
                :checked="selected.includes(item.id)"
                :aria-label="`Выбрать: ${item.name}`"
                @change="toggle(item.id)"
              />
            </td>
            <td class="col-name">
              <button type="button" class="wr-item-link" @click="openItem(item)">
                {{ item.name }}
              </button>
            </td>
            <td>{{ categoryLabels[item.category] }}</td>
            <td>
              <span class="wr-abbr" :title="availabilityLabels[item.availability]">
                {{ availabilityShort[item.availability] }}
              </span>
            </td>
            <td class="col-where">{{ item.where }}</td>
            <td><RulesText :text="item.quantity" /></td>
            <td class="col-num">{{ formatDC(item) }}</td>
            <td class="col-num">{{ formatNumber(item.weight) }}</td>
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
.component-catalog {
  margin-top: 1.5rem;
}

.component-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.component-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .component-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.component-legend {
  margin: 0 0 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.component-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.component-table {
  width: 100%;
  min-width: 1040px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.component-table th,
.component-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.component-table th {
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

.component-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.component-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.component-table tbody tr:last-child td {
  border-bottom: 0;
}

.component-table .col-check {
  width: 28px;
  text-align: center;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.component-table .col-name {
  min-width: 170px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.component-table .col-where {
  min-width: 190px;
  color: var(--site-muted);
}

.component-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.component-table .wr-abbr {
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
