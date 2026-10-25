<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/transport.json'
import type { Tack, Vehicle } from '../../schemas/transport'
import { useItemDrawer } from '../composables/useItemDrawer'

const vehicles = data.vehicles as Vehicle[]
const tack = data.tack as Tack[]
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
  saddles: 'Сёдла',
  blinkers: 'Шоры',
  saddlebags: 'Перемётные сумы',
  'horse-armor': 'Конские доспехи'
} as const

type TackCategory = keyof typeof categoryLabels

const query = ref('')
const kind = ref<'all' | 'vehicles' | 'tack'>('all')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visibleVehicles = computed(() => {
  const q = normalized(query.value.trim())
  if (kind.value === 'tack') return []
  if (!q) return vehicles
  return vehicles.filter((item) => normalized(item.name).includes(q))
})

const visibleTack = computed(() => {
  const q = normalized(query.value.trim())
  if (kind.value === 'vehicles') return []
  if (!q) return tack
  return tack.filter((item) => normalized([item.name, item.effect].join(' ')).includes(q))
})

const tackGroups = computed(() =>
  (Object.keys(categoryLabels) as TackCategory[])
    .map((key) => ({
      key,
      label: categoryLabels[key],
      items: visibleTack.value.filter((item) => item.category === key)
    }))
    .filter((group) => group.items.length)
)

const reset = () => {
  query.value = ''
  kind.value = 'all'
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')

const openVehicle = (item: Vehicle) => {
  openDrawer({
    title: item.name,
    subtitle: 'Скакуны и транспорт',
    description: item.description,
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Атлетика + Лов', value: item.athletics },
      { label: 'Модификатор управления', value: item.controlModifier },
      { label: 'Скорость', value: item.speed },
      { label: 'ПЗ', value: String(item.hp) },
      { label: 'Вес', value: `${formatNumber(item.weight)} кг` },
      { label: 'Цена', value: `${formatNumber(item.price)} кр.` }
    ]
  })
}

const openTack = (item: Tack) => {
  openDrawer({
    title: item.name,
    subtitle: `Упряжь · ${categoryLabels[item.category]}`,
    description: item.description,
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Категория', value: categoryLabels[item.category] },
      { label: 'Доступность', value: availabilityLabels[item.availability] },
      { label: 'Эффект', value: item.effect },
      { label: 'Вес', value: `${formatNumber(item.weight)} кг` },
      { label: 'Цена', value: `${formatNumber(item.price)} кр.` }
    ]
  })
}
</script>

<template>
  <div class="transport-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="transport-query">Поиск</label>
        <input
          id="transport-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или эффект…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="transport-kind">Раздел</label>
        <select id="transport-kind" v-model="kind" class="wr-select">
          <option value="all">Все</option>
          <option value="vehicles">Транспорт</option>
          <option value="tack">Упряжь</option>
        </select>
      </div>

      <button class="transport-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visibleVehicles.length + visibleTack.length }} из {{ vehicles.length + tack.length }}</span>
    </div>

    <template v-if="visibleVehicles.length">
      <h3>Скакуны и транспорт</h3>
      <div class="transport-table-wrap">
        <table class="transport-table">
          <thead>
            <tr>
              <th>Название</th>
              <th class="col-center">Атлетика + Лов</th>
              <th class="col-center">Модификатор управления</th>
              <th class="col-center">Скорость</th>
              <th>ПЗ</th>
              <th>Вес, кг</th>
              <th>Цена, кр.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in visibleVehicles" :id="`vehicle-${item.id}`" :key="item.id">
              <td class="col-name">
                <button type="button" class="wr-item-link" @click="openVehicle(item)">
                  {{ item.name }}
                </button>
              </td>
              <td class="col-center">{{ item.athletics }}</td>
              <td class="col-center">{{ item.controlModifier }}</td>
              <td class="col-center">{{ item.speed }}</td>
              <td class="col-num">{{ item.hp }}</td>
              <td class="col-num">{{ formatNumber(item.weight) }}</td>
              <td class="col-num">{{ formatNumber(item.price) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template v-if="tackGroups.length">
      <h3>Упряжь</h3>
      <p class="transport-legend">
        <strong>Дос</strong> — доступность (П/О/Р/У).
      </p>
      <div class="transport-table-wrap">
        <table class="transport-table">
          <thead>
            <tr>
              <th>Название</th>
              <th title="Доступность">Дос</th>
              <th>Эффект</th>
              <th>Вес, кг</th>
              <th>Цена, кр.</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in tackGroups" :key="group.key">
              <tr class="group-row">
                <td colspan="5">{{ group.label }}</td>
              </tr>
              <tr v-for="item in group.items" :id="`tack-${item.id}`" :key="item.id">
                <td class="col-name">
                  <button type="button" class="wr-item-link" @click="openTack(item)">
                    {{ item.name }}
                  </button>
                </td>
                <td>
                  <span class="wr-abbr" :title="availabilityLabels[item.availability]">
                    {{ availabilityShort[item.availability] }}
                  </span>
                </td>
                <td class="col-effects"><RulesText :text="item.effect" /></td>
                <td class="col-num">{{ formatNumber(item.weight) }}</td>
                <td class="col-num">{{ formatNumber(item.price) }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </template>

    <div v-if="!visibleVehicles.length && !tackGroups.length" class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>
  </div>
</template>

<style scoped>
.transport-catalog {
  margin-top: 1.5rem;
}

.transport-catalog h3 {
  margin: 1.4rem 0 0.6rem;
  font-family: var(--site-serif);
  font-size: 1.2rem;
}

.transport-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.transport-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .transport-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.transport-legend {
  margin: 0 0 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.transport-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.transport-table {
  width: 100%;
  min-width: 700px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.transport-table th,
.transport-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.transport-table th {
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

.transport-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.transport-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.transport-table tbody tr:last-child td {
  border-bottom: 0;
}

.transport-table .group-row td {
  padding: 0.35rem 0.45rem;
  background: var(--site-surface-2);
  font-family: var(--site-serif);
  font-size: 12px;
  font-weight: 600;
  color: var(--site-ink);
}

.transport-table .col-name {
  min-width: 180px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.transport-table .col-name a {
  color: var(--site-ink);
  text-decoration: none;
}

.transport-table .col-name a:hover {
  color: var(--site-blood);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dark .transport-table .col-name a:hover {
  color: var(--site-gold);
}

.transport-table .col-effects {
  min-width: 260px;
  color: var(--site-muted);
}

.transport-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.transport-table .col-center {
  text-align: center;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.transport-table .wr-abbr {
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
