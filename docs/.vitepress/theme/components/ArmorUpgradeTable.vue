<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/armor-upgrades.json'
import type { ArmorUpgrade } from '../../schemas/armorUpgrade'
import { useItemDrawer } from '../composables/useItemDrawer'
import EffectText from './EffectText.vue'

const items = data.items as ArmorUpgrade[]
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

const query = ref('')
const availability = ref('all')
const sort = ref<'name' | 'price' | 'weight'>('name')
const selected = ref<string[]>([])

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items
    .filter((item) => {
      if (availability.value !== 'all' && item.availability !== availability.value) return false
      if (!q) return true
      return normalized([item.name, item.effect].join(' ')).includes(q)
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
  availability.value = 'all'
  sort.value = 'name'
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')

const openItem = (item: ArmorUpgrade) => {
  openDrawer({
    title: item.name,
    subtitle: 'Усиление брони',
    description: item.description,
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Эффект', value: item.effect || '—' },
      { label: 'Бонус к прочности', value: `+${item.protectionBonus}` },
      { label: 'Сопротивления', value: item.resistances.join(', ') || '—' },
      { label: 'Доступность', value: availabilityLabels[item.availability] },
      { label: 'Вес', value: `${formatNumber(item.weight)} кг` },
      { label: 'Цена', value: `${formatNumber(item.price)} кр.` }
    ]
  })
}
</script>

<template>
  <div class="upgrade-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="upgrade-query">Поиск</label>
        <input
          id="upgrade-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или эффект…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="upgrade-availability">Доступность</label>
        <select id="upgrade-availability" v-model="availability" class="wr-select">
          <option value="all">Все</option>
          <option value="everywhere">Повсеместная</option>
          <option value="common">Обычная</option>
          <option value="rare">Редкая</option>
          <option value="unique">Уникальная</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="upgrade-sort">Сортировка</label>
        <select id="upgrade-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="price">По цене</option>
          <option value="weight">По весу</option>
        </select>
      </div>

      <button class="upgrade-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <div class="wr-summary">
      <span>Выбрано: <strong>{{ selected.length }}</strong></span>
      <span>Вес: <strong>{{ formatNumber(totalWeight) }} кг</strong></span>
      <span>Цена: <strong>{{ formatNumber(totalPrice) }} кр.</strong></span>
      <button v-if="selected.length" class="upgrade-reset" type="button" @click="clearSelection">
        Сбросить выбор
      </button>
    </div>

    <p class="upgrade-legend">
      <strong>ПБ</strong> — бонус к прочности брони; <strong>Д/Р/К</strong> — сопротивление
      дробящему, режущему и колющему урону; <strong>Дос</strong> — доступность (П/О/Р/У).
    </p>

    <div v-if="visible.length" class="upgrade-table-wrap">
      <table class="upgrade-table">
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
            <th>Эффект</th>
            <th>ПБ</th>
            <th title="Дробящее">Д</th>
            <th title="Режущее">Р</th>
            <th title="Колющее">К</th>
            <th title="Доступность">Дос</th>
            <th>Вес, кг</th>
            <th>Цена, кр.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visible" :id="`upgrade-${item.id}`" :key="item.id">
            <td class="col-check">
              <input
                type="checkbox"
                :checked="selected.includes(item.id)"
                :aria-label="`Выбрать: ${item.name}`"
                @change="toggle(item.id)"
              />
            </td>
            <td class="col-name">
              <button type="button" class="wr-item-link" @click="openItem(item)">{{ item.name }}</button>
            </td>
            <td class="col-effects">
              <EffectText :text="item.effect || '—'" />
            </td>
            <td class="col-num">+{{ item.protectionBonus }}</td>
            <td class="col-mark">{{ item.resistances.includes('Д') ? '×' : '' }}</td>
            <td class="col-mark">{{ item.resistances.includes('Р') ? '×' : '' }}</td>
            <td class="col-mark">{{ item.resistances.includes('К') ? '×' : '' }}</td>
            <td>
              <span class="wr-abbr" :title="availabilityLabels[item.availability]">
                {{ availabilityShort[item.availability] }}
              </span>
            </td>
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
.upgrade-catalog {
  margin-top: 1.5rem;
}

.upgrade-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.upgrade-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .upgrade-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.upgrade-legend {
  margin: 0 0 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.upgrade-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.upgrade-table {
  width: 100%;
  min-width: 880px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.upgrade-table th,
.upgrade-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.upgrade-table th {
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

.upgrade-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.upgrade-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.upgrade-table tbody tr:last-child td {
  border-bottom: 0;
}

.upgrade-table .col-check {
  width: 28px;
  text-align: center;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.upgrade-table .col-name {
  min-width: 170px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.upgrade-table .col-name a {
  color: var(--site-ink);
  text-decoration: none;
}

.upgrade-table .col-name a:hover {
  color: var(--site-blood);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dark .upgrade-table .col-name a:hover {
  color: var(--site-gold);
}

.upgrade-table .col-effects {
  min-width: 210px;
  color: var(--site-muted);
}

.upgrade-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.upgrade-table .col-mark {
  text-align: center;
  color: var(--site-muted);
  font-weight: 600;
}

.upgrade-table .wr-abbr {
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
