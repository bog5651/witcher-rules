<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/formulas.json'
import type { Formula } from '../../schemas/formula'
import { useItemDrawer } from '../composables/useItemDrawer'
import SubstanceIcon from './SubstanceIcon.vue'

const items = data.items as Formula[]
const { open: openDrawer } = useItemDrawer()

const levelLabels = {
  novice: 'Формулы новичка',
  adept: 'Формулы подмастерья',
  master: 'Формулы мастера'
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

const levelOrder = ['novice', 'adept', 'master'] as const

const query = ref('')
const level = ref<'all' | Formula['level']>('all')
const sort = ref<'name' | 'price' | 'dc'>('name')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items
    .filter((item) => {
      if (level.value !== 'all' && item.level !== level.value) return false
      if (!q) return true
      return normalized(item.name).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'price') return a.price - b.price
      if (sort.value === 'dc') return a.dc - b.dc
      return a.name.localeCompare(b.name, 'ru')
    })
})

const sections = computed(() =>
  levelOrder
    .map((key) => ({
      key,
      label: levelLabels[key],
      items: visible.value.filter((item) => item.level === key)
    }))
    .filter((section) => section.items.length)
)

const reset = () => {
  query.value = ''
  level.value = 'all'
  sort.value = 'name'
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')

const ingredientText = (item: Formula) =>
  item.ingredients
    .map((ingredient) => `${ingredient.count}× ${substanceLabels[ingredient.substance]}`)
    .join(', ')

const openItem = (item: Formula) => {
  openDrawer({
    title: item.name,
    subtitle: levelLabels[item.level],
    description: item.description,
    sourcePage: item.sourcePage,
    stats: [
      { label: 'Уровень', value: levelLabels[item.level] },
      { label: 'СЛ Алхимии', value: String(item.dc) },
      { label: 'Время', value: item.time },
      { label: 'Ингредиенты', value: ingredientText(item) },
      { label: 'Эффект', value: item.effect ?? '' },
      { label: 'Цена', value: `${formatNumber(item.price)} кр.` }
    ]
  })
}
</script>

<template>
  <div class="formula-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="formula-query">Поиск</label>
        <input
          id="formula-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название формулы…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="formula-level">Уровень</label>
        <select id="formula-level" v-model="level" class="wr-select">
          <option value="all">Все</option>
          <option value="novice">Новичок</option>
          <option value="adept">Подмастерье</option>
          <option value="master">Мастер</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="formula-sort">Сортировка</label>
        <select id="formula-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="dc">По СЛ</option>
          <option value="price">По цене</option>
        </select>
      </div>

      <button class="formula-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <p class="formula-legend">
      Иконки показывают субстанции, а число рядом — количество единиц. Наведите на иконку, чтобы
      увидеть название субстанции.
    </p>

    <template v-for="section in sections" :key="section.key">
      <h3>{{ section.label }}</h3>
      <div class="formula-table-wrap">
        <table class="formula-table">
          <thead>
            <tr>
              <th>Название</th>
              <th>СЛ</th>
              <th>Время</th>
              <th>Ингредиенты</th>
              <th>Цена, кр.</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in section.items" :id="`formula-${item.id}`" :key="item.id">
              <td class="col-name">
                <button type="button" class="wr-item-link" @click="openItem(item)">
                  {{ item.name }}
                </button>
              </td>
              <td class="col-num">{{ item.dc }}</td>
              <td>{{ item.time }}</td>
              <td>
                <span class="formula-ingredients">
                  <span
                    v-for="ingredient in item.ingredients"
                    :key="ingredient.substance"
                    class="formula-ingredient"
                  >
                    <SubstanceIcon :name="ingredient.substance" :size="18" />
                    <span v-if="ingredient.count > 1">×{{ ingredient.count }}</span>
                  </span>
                </span>
              </td>
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
.formula-catalog {
  margin-top: 1.5rem;
}

.formula-catalog h3 {
  margin: 1.4rem 0 0.6rem;
  font-family: var(--site-serif);
  font-size: 1.2rem;
}

.formula-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.formula-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .formula-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.formula-legend {
  margin: 0 0 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.formula-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.formula-table {
  width: 100%;
  min-width: 760px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.formula-table th,
.formula-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: middle;
}

.formula-table th {
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

.formula-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.formula-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.formula-table tbody tr:last-child td {
  border-bottom: 0;
}

.formula-table .col-name {
  min-width: 220px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.formula-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.formula-ingredients {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.formula-ingredient {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  font-size: 11px;
  color: var(--site-muted);
  white-space: nowrap;
}
</style>
