<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/schematics.json'
import type { Schematic } from '../../schemas/schematic'
import { useItemDrawer } from '../composables/useItemDrawer'

const items = data.items as Schematic[]
const { open: openDrawer } = useItemDrawer()

const categoryLabels = {
  component: 'Компоненты',
  weapon: 'Оружие',
  armor: 'Броня',
  upgrade: 'Усиления брони'
} as const

const levelLabels = {
  novice: 'Новичок',
  adept: 'Подмастерье',
  master: 'Мастер',
  grandmaster: 'Великий мастер'
} as const

const originLabels = {
  common: 'Обычное',
  elder: 'Старший Народ'
} as const

type Category = keyof typeof categoryLabels
type Level = keyof typeof levelLabels
type Origin = keyof typeof originLabels

const categoryOrder: Category[] = ['component', 'weapon', 'armor', 'upgrade']
const levelOrder: Level[] = ['novice', 'adept', 'master', 'grandmaster']

const query = ref('')
const category = ref<'all' | Category>('all')
const level = ref<'all' | Level>('all')
const origin = ref<'all' | Origin>('all')
const sort = ref<'name' | 'dc' | 'price' | 'surcharge'>('name')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items
    .filter((item) => {
      if (category.value !== 'all' && item.category !== category.value) return false
      if (level.value !== 'all' && item.level !== level.value) return false
      if (origin.value !== 'all' && item.origin !== origin.value) return false
      if (!q) return true
      return (
        normalized(item.name).includes(q) ||
        item.components.some((component) => normalized(component.name).includes(q))
      )
    })
    .sort((a, b) => {
      if (sort.value === 'dc') return a.dc - b.dc
      if (sort.value === 'price') return a.price - b.price
      if (sort.value === 'surcharge') return a.surcharge - b.surcharge
      return a.name.localeCompare(b.name, 'ru')
    })
})

const sections = computed(() => {
  const result: Array<{
    key: string
    label: string
    items: Schematic[]
  }> = []

  for (const categoryKey of categoryOrder) {
    for (const levelKey of levelOrder) {
      for (const originKey of ['common', 'elder'] as Origin[]) {
        const sectionItems = visible.value.filter(
          (item) =>
            item.category === categoryKey &&
            item.level === levelKey &&
            item.origin === originKey
        )
        if (!sectionItems.length) continue

        const categoryLabel =
          originKey === 'elder'
            ? `${categoryLabels[categoryKey]} Старшего Народа`
            : categoryLabels[categoryKey]

        result.push({
          key: `${categoryKey}-${levelKey}-${originKey}`,
          label: `${categoryLabel} · ${levelLabels[levelKey]}`,
          items: sectionItems
        })
      }
    }
  }

  return result
})

const reset = () => {
  query.value = ''
  category.value = 'all'
  level.value = 'all'
  origin.value = 'all'
  sort.value = 'name'
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')

const componentsText = (item: Schematic) =>
  item.components.map((component) => `${component.name} ×${component.count}`).join(', ')

const openItem = (item: Schematic) => {
  openDrawer({
    title: item.name,
    subtitle: `Чертёж · ${categoryLabels[item.category]} · ${levelLabels[item.level]}`,
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Категория', value: categoryLabels[item.category] },
      { label: 'Уровень', value: levelLabels[item.level] },
      { label: 'Происхождение', value: originLabels[item.origin] },
      { label: 'СЛ Изготовления', value: String(item.dc) },
      { label: 'Время', value: item.time },
      { label: 'Компоненты', value: componentsText(item) },
      { label: 'Доплата', value: `${formatNumber(item.surcharge)} кр.` },
      { label: 'Цена', value: `${formatNumber(item.price)} кр.` }
    ]
  })
}
</script>

<template>
  <div class="schematic-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="schematic-query">Поиск</label>
        <input
          id="schematic-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или компонент…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="schematic-category">Категория</label>
        <select id="schematic-category" v-model="category" class="wr-select">
          <option value="all">Все</option>
          <option value="component">Компоненты</option>
          <option value="weapon">Оружие</option>
          <option value="armor">Броня</option>
          <option value="upgrade">Усиления брони</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="schematic-level">Уровень</label>
        <select id="schematic-level" v-model="level" class="wr-select">
          <option value="all">Все</option>
          <option value="novice">Новичок</option>
          <option value="adept">Подмастерье</option>
          <option value="master">Мастер</option>
          <option value="grandmaster">Великий мастер</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="schematic-origin">Происхождение</label>
        <select id="schematic-origin" v-model="origin" class="wr-select">
          <option value="all">Все</option>
          <option value="common">Обычное</option>
          <option value="elder">Старший Народ</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="schematic-sort">Сортировка</label>
        <select id="schematic-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="dc">По СЛ</option>
          <option value="price">По цене</option>
          <option value="surcharge">По доплате</option>
        </select>
      </div>

      <button class="schematic-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <p class="schematic-legend">
      <strong>Доплата</strong> — сумма, которой можно ускорить изготовление, сразу получив все
      материалы. <strong>Цена</strong> — стоимость готового предмета. Компоненты указаны в
      количестве единиц.
    </p>

    <template v-for="section in sections" :key="section.key">
      <h3>{{ section.label }}</h3>
      <div class="schematic-table-wrap">
        <table class="schematic-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>СЛ</th>
              <th>Время</th>
              <th>Компоненты</th>
              <th>Доплата</th>
              <th>Цена</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in section.items" :id="`schematic-${item.id}`" :key="item.id">
              <td class="col-name">
                <button type="button" class="wr-item-link" @click="openItem(item)">
                  {{ item.name }}
                </button>
              </td>
              <td class="col-num">{{ item.dc }}</td>
              <td class="col-time">{{ item.time }}</td>
              <td class="col-components">{{ componentsText(item) }}</td>
              <td class="col-num">{{ formatNumber(item.surcharge) }}</td>
              <td class="col-num">{{ formatNumber(item.price) }}</td>
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
.schematic-catalog {
  margin-top: 1.5rem;
}

.schematic-catalog h3 {
  margin: 1.4rem 0 0.6rem;
  font-family: var(--site-serif);
  font-size: 1.2rem;
}

.schematic-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.schematic-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .schematic-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.schematic-legend {
  margin: 0 0 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.schematic-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.schematic-table {
  width: 100%;
  min-width: 940px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.schematic-table th,
.schematic-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.schematic-table th {
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

.schematic-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.schematic-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.schematic-table tbody tr:last-child td {
  border-bottom: 0;
}

.schematic-table .col-name {
  min-width: 210px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.schematic-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.schematic-table .col-time {
  white-space: nowrap;
}

.schematic-table .col-components {
  color: var(--site-muted);
}
</style>
