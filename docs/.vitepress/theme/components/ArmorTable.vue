<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/armor.json'
import type { Armor } from '../../schemas/armor'

const armor = data.items as Armor[]

const locationLabels = {
  head: 'Голова',
  torso: 'Торс',
  legs: 'Ноги',
  shield: 'Щит'
} as const

const classLabels = {
  light: 'Лёгкая',
  medium: 'Средняя',
  heavy: 'Тяжёлая'
} as const

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

const locations = ['head', 'torso', 'legs', 'shield'] as const
const classes = ['light', 'medium', 'heavy'] as const

const query = ref('')
const location = ref<'all' | Armor['location']>('all')
const weightClass = ref<'all' | Armor['weightClass']>('all')
const availability = ref('all')
const sort = ref<'name' | 'price' | 'weight' | 'protection'>('name')
const selected = ref<string[]>([])

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const matchesFilters = (item: Armor) => {
  if (location.value !== 'all' && item.location !== location.value) return false
  if (weightClass.value !== 'all' && item.weightClass !== weightClass.value) return false
  if (availability.value !== 'all' && item.availability !== availability.value) return false
  return true
}

const baseCount = computed(() => armor.filter(matchesFilters).length)

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return armor
    .filter((item) => {
      if (!matchesFilters(item)) return false
      if (!q) return true
      return normalized([item.name, item.effect].join(' ')).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'price') return a.price - b.price
      if (sort.value === 'weight') return a.weight - b.weight
      if (sort.value === 'protection') {
        return (b.protection ?? b.reliability ?? 0) - (a.protection ?? a.reliability ?? 0)
      }
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

const selectedItems = computed(() => armor.filter((item) => selected.value.includes(item.id)))
const totalWeight = computed(() => selectedItems.value.reduce((sum, item) => sum + item.weight, 0))
const totalPrice = computed(() => selectedItems.value.reduce((sum, item) => sum + item.price, 0))

const reset = () => {
  query.value = ''
  location.value = 'all'
  weightClass.value = 'all'
  availability.value = 'all'
  sort.value = 'name'
}

const formatWeight = (value: number) => value.toLocaleString('ru-RU')
const protectionValue = (item: Armor) => item.protection ?? item.reliability ?? 0
</script>

<template>
  <div class="armor-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="armor-query">Поиск</label>
        <input
          id="armor-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или эффект…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="armor-location">Часть тела</label>
        <select id="armor-location" v-model="location" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in locations" :key="item" :value="item">
            {{ locationLabels[item] }}
          </option>
        </select>
      </div>

      <div class="wr-field">
        <label for="armor-class">Класс</label>
        <select id="armor-class" v-model="weightClass" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in classes" :key="item" :value="item">
            {{ classLabels[item] }}
          </option>
        </select>
      </div>

      <div class="wr-field">
        <label for="armor-availability">Доступность</label>
        <select id="armor-availability" v-model="availability" class="wr-select">
          <option value="all">Все</option>
          <option value="everywhere">Повсеместная</option>
          <option value="common">Обычная</option>
          <option value="rare">Редкая</option>
          <option value="unique">Уникальная</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="armor-sort">Сортировка</label>
        <select id="armor-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="protection">По защите</option>
          <option value="price">По цене</option>
          <option value="weight">По весу</option>
        </select>
      </div>

      <button class="armor-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ baseCount }}</span>
    </div>

    <div class="wr-summary">
      <span>Выбрано: <strong>{{ selected.length }}</strong></span>
      <span>Вес: <strong>{{ formatWeight(totalWeight) }} кг</strong></span>
      <span>Цена: <strong>{{ formatWeight(totalPrice) }} кр.</strong></span>
      <button v-if="selected.length" class="armor-reset" type="button" @click="clearSelection">
        Сбросить выбор
      </button>
    </div>

    <div v-if="visible.length" class="armor-table-wrap">
      <table class="armor-table">
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
            <th>Часть</th>
            <th>Класс</th>
            <th title="Прочность брони или надёжность щита">ПБ/Н</th>
            <th title="Доступность">Дос</th>
            <th title="Усиления брони">УБ</th>
            <th>Эффект</th>
            <th title="Скованность движений">СД</th>
            <th>Вес, кг</th>
            <th>Цена, кр.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visible" :id="`armor-${item.id}`" :key="item.id">
            <td class="col-check">
              <input
                type="checkbox"
                :checked="selected.includes(item.id)"
                :aria-label="`Выбрать: ${item.name}`"
                @change="toggle(item.id)"
              />
            </td>
            <td class="col-name">
              <a :href="`#armor-${item.id}`">{{ item.name }}</a>
            </td>
            <td>{{ locationLabels[item.location] }}</td>
            <td>{{ classLabels[item.weightClass] }}</td>
            <td class="col-num">{{ protectionValue(item) }}</td>
            <td>
              <span class="wr-abbr" :title="availabilityLabels[item.availability]">
                {{ availabilityShort[item.availability] }}
              </span>
            </td>
            <td class="col-num">{{ item.upgradeSlots }}</td>
            <td class="col-effects">{{ item.effect }}</td>
            <td class="col-num">{{ item.encumbrance }}</td>
            <td class="col-num">{{ formatWeight(item.weight) }}</td>
            <td class="col-num">{{ formatWeight(item.price) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <p class="armor-legend">
      <strong>ПБ</strong> — прочность брони, <strong>Н</strong> — надёжность щита,
      <strong>Дос</strong> — доступность (П/О/Р/У), <strong>УБ</strong> — усиления брони,
      <strong>СД</strong> — скованность движений.
    </p>
  </div>
</template>

<style scoped>
.armor-catalog {
  margin-top: 1.5rem;
}

.armor-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.armor-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.armor-table th,
.armor-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.armor-table th {
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

.armor-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.armor-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.armor-table tbody tr:last-child td {
  border-bottom: 0;
}

.armor-table .col-check {
  width: 28px;
  text-align: center;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.armor-table .col-name {
  min-width: 190px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.armor-table .col-name a {
  color: var(--site-ink);
  text-decoration: none;
}

.armor-table .col-name a:hover {
  color: var(--site-blood);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dark .armor-table .col-name a:hover {
  color: var(--site-gold);
}

.armor-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.armor-table .col-effects {
  min-width: 150px;
  color: var(--site-muted);
}

.armor-table .wr-abbr {
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

.armor-legend {
  margin-top: 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.armor-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.armor-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .armor-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

@media (max-width: 640px) {
  .wr-summary {
    align-items: flex-start;
  }
}
</style>
