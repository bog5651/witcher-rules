<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/gear.json'
import type { Gear } from '../../schemas/gear'
import { useItemDrawer } from '../composables/useItemDrawer'

const items = data.items as Gear[]
const { open: openDrawer } = useItemDrawer()

const categoryLabels = {
  standard: 'Стандартное снаряжение',
  containers: 'Ёмкости',
  food: 'Еда и питьё',
  clothing: 'Одежда',
  services: 'Услуги',
  lodging: 'Проживание'
} as const

type Category = keyof typeof categoryLabels

const category = ref<'all' | Category>('all')
const query = ref('')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items.filter((item) => {
    if (category.value !== 'all' && item.category !== category.value) return false
    if (!q) return true
    return normalized(item.name).includes(q)
  })
})

const sections = computed(() =>
  (Object.keys(categoryLabels) as Category[])
    .map((key) => ({
      key,
      label: categoryLabels[key],
      items: visible.value.filter((item) => item.category === key),
      hasWeight: key !== 'services' && key !== 'lodging'
    }))
    .filter((section) => section.items.length)
)

const reset = () => {
  query.value = ''
  category.value = 'all'
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')
const formatWeight = (item: Gear) => (item.weight === null ? '—' : formatNumber(item.weight))
const formatPrice = (item: Gear) =>
  item.price === null ? (item.priceNote ?? '—') : formatNumber(item.price)

const openItem = (item: Gear) => {
  openDrawer({
    title: item.name,
    subtitle: categoryLabels[item.category],
    description: item.description,
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Категория', value: categoryLabels[item.category] },
      { label: 'Вес', value: item.weight === null ? '—' : `${formatWeight(item)} кг` },
      { label: 'Цена', value: item.price === null ? (item.priceNote ?? '—') : `${formatPrice(item)} кр.` }
    ]
  })
}
</script>

<template>
  <div class="gear-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="gear-query">Поиск</label>
        <input
          id="gear-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название предмета…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="gear-category">Категория</label>
        <select id="gear-category" v-model="category" class="wr-select">
          <option value="all">Все</option>
          <option v-for="(label, key) in categoryLabels" :key="key" :value="key">
            {{ label }}
          </option>
        </select>
      </div>

      <button class="gear-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <template v-for="section in sections" :key="section.key">
      <h3>{{ section.label }}</h3>
      <div
        class="gear-table-wrap"
        :class="{ 'gear-table-wrap--narrow': !section.hasWeight }"
      >
        <table class="gear-table" :class="{ 'gear-table--no-weight': !section.hasWeight }">
          <thead>
            <tr>
              <th>Название</th>
              <th v-if="section.hasWeight">Вес, кг</th>
              <th>Цена</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in section.items" :id="`gear-${item.id}`" :key="item.id">
              <td class="col-name">
                <button type="button" class="wr-item-link" @click="openItem(item)">
                  {{ item.name }}
                </button>
              </td>
              <td v-if="section.hasWeight" class="col-num">{{ formatWeight(item) }}</td>
              <td class="col-num">{{ formatPrice(item) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <div v-if="!sections.length" class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>
  </div>
</template>

<style scoped>
.gear-catalog {
  margin-top: 1.5rem;
}

.gear-catalog h3 {
  margin: 1.4rem 0 0.6rem;
  font-family: var(--site-serif);
  font-size: 1.2rem;
}

.gear-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.gear-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .gear-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.gear-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.gear-table-wrap--narrow {
  width: fit-content;
  max-width: 100%;
}

.gear-table {
  width: 100%;
  min-width: 620px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.gear-table--no-weight {
  width: auto;
  min-width: 420px;
  max-width: 680px;
}

.gear-table th,
.gear-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.gear-table th {
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

.gear-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.gear-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.gear-table tbody tr:last-child td {
  border-bottom: 0;
}

.gear-table .col-name {
  min-width: 300px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.gear-table .col-name a {
  color: var(--site-ink);
  text-decoration: none;
}

.gear-table .col-name a:hover {
  color: var(--site-blood);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dark .gear-table .col-name a:hover {
  color: var(--site-gold);
}

.gear-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
