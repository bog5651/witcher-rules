<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/weapons.json'
import type { Weapon } from '../../schemas/weapon'
import { useItemDrawer } from '../composables/useItemDrawer'
import EffectText from './EffectText.vue'

const weapons = data.items as Weapon[]
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

const concealmentLabels = {
  tiny: 'Маленькое',
  small: 'Небольшое',
  large: 'Крупное',
  none: 'Не спрятать'
} as const

const concealmentShort = {
  tiny: 'М',
  small: 'Н',
  large: 'К',
  none: 'Н/С'
} as const

const categories = [...new Set(weapons.map((weapon) => weapon.category))]

const query = ref('')
const category = ref('all')
const origin = ref<'all' | 'common' | 'elderfolk' | 'witcher'>('all')
const availability = ref('all')
const damageType = ref('all')
const sort = ref<'name' | 'price' | 'weight'>('name')
const selected = ref<string[]>([])

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const matchesFilters = (weapon: Weapon) => {
  if (category.value !== 'all' && weapon.category !== category.value) return false
  if (origin.value === 'common' && (weapon.elderfolk || weapon.witcher)) return false
  if (origin.value === 'elderfolk' && !weapon.elderfolk) return false
  if (origin.value === 'witcher' && !weapon.witcher) return false
  if (availability.value !== 'all' && weapon.availability !== availability.value) return false
  if (damageType.value !== 'all' && !weapon.damageTypes.includes(damageType.value)) return false
  return true
}

const baseCount = computed(() => weapons.filter(matchesFilters).length)

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return weapons
    .filter((weapon) => {
      if (!matchesFilters(weapon)) return false
      if (!q) return true
      return normalized(
        [weapon.name, weapon.category, weapon.effects.join(' '), weapon.range].join(' ')
      ).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'price') {
        return (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY)
      }
      if (sort.value === 'weight') return a.weight - b.weight
      return a.name.localeCompare(b.name, 'ru')
    })
})

const allVisibleSelected = computed(() => {
  return visible.value.length > 0 && visible.value.every((w) => selected.value.includes(w.id))
})

const toggle = (id: string) => {
  selected.value = selected.value.includes(id)
    ? selected.value.filter((item) => item !== id)
    : [...selected.value, id]
}

const toggleAllVisible = () => {
  if (allVisibleSelected.value) {
    const ids = new Set(visible.value.map((w) => w.id))
    selected.value = selected.value.filter((id) => !ids.has(id))
  } else {
    selected.value = [...new Set([...selected.value, ...visible.value.map((w) => w.id)])]
  }
}

const clearSelection = () => {
  selected.value = []
}

const selectedItems = computed(() => weapons.filter((w) => selected.value.includes(w.id)))
const totalWeight = computed(() => selectedItems.value.reduce((sum, w) => sum + w.weight, 0))
const pricedItems = computed(() => selectedItems.value.filter((w) => w.price !== null))
const totalPrice = computed(() => pricedItems.value.reduce((sum, w) => sum + (w.price ?? 0), 0))
const unpricedCount = computed(() => selectedItems.value.length - pricedItems.value.length)

const reset = () => {
  query.value = ''
  category.value = 'all'
  origin.value = 'all'
  availability.value = 'all'
  damageType.value = 'all'
  sort.value = 'name'
}

const signed = (value: number) => (value > 0 ? `+${value}` : String(value))
const formatWeight = (value: number) => value.toLocaleString('ru-RU')

const originLabel = (weapon: Weapon) =>
  weapon.elderfolk ? 'Старший Народ' : weapon.witcher ? 'Ведьмачье' : 'Обычное'

const damageTypeLabels: Record<string, string> = {
  Р: 'Режущий',
  К: 'Колющий',
  Д: 'Дробящий',
  С: 'Стихийный'
}

const damageTypeText = (weapon: Weapon) =>
  weapon.damageTypes.map((type) => damageTypeLabels[type] ?? type).join(', ')

const handsLabel = (hands: number) => {
  if (hands === 1) return 'Одна рука'
  if (hands === 2) return 'Две руки'
  return `${hands} руки`
}

const openItem = (weapon: Weapon) => {
  openDrawer({
    title: weapon.name,
    subtitle: weapon.category,
    description: weapon.description,
    sourcePage: weapon.sourcePage,
    stats: [
      { label: 'Тип урона', value: damageTypeText(weapon) },
      { label: 'Точность', value: signed(weapon.accuracy) },
      { label: 'Урон', value: weapon.damage },
      { label: 'Надёжность', value: String(weapon.reliability) },
      { label: 'Хват', value: handsLabel(weapon.hands) },
      { label: 'Дистанция', value: weapon.range },
      { label: 'Эффект', value: weapon.effects.join('; ') || '—' },
      { label: 'Доступность', value: availabilityLabels[weapon.availability] },
      { label: 'Скрытность', value: concealmentLabels[weapon.concealment] },
      { label: 'Усиления', value: String(weapon.upgradeSlots) },
      { label: 'Вес', value: `${formatWeight(weapon.weight)} кг` },
      {
        label: 'Цена',
        value: weapon.price === null ? 'По чертежу' : `${formatWeight(weapon.price)} кр.`
      },
      { label: 'Происхождение', value: originLabel(weapon) }
    ]
  })
}
</script>

<template>
  <div class="weapon-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="weapon-query">Поиск</label>
        <input
          id="weapon-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или эффект…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="weapon-category">Категория</label>
        <select id="weapon-category" v-model="category" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="weapon-origin">Происхождение</label>
        <select id="weapon-origin" v-model="origin" class="wr-select">
          <option value="all">Все</option>
          <option value="common">Обычное</option>
          <option value="elderfolk">Старший Народ</option>
          <option value="witcher">Ведьмачье</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="weapon-availability">Доступность</label>
        <select id="weapon-availability" v-model="availability" class="wr-select">
          <option value="all">Все</option>
          <option value="everywhere">Повсеместная</option>
          <option value="common">Обычная</option>
          <option value="rare">Редкая</option>
          <option value="unique">Уникальная</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="weapon-damage">Тип урона</label>
        <select id="weapon-damage" v-model="damageType" class="wr-select">
          <option value="all">Все</option>
          <option value="Р">Режущий</option>
          <option value="К">Колющий</option>
          <option value="Д">Дробящий</option>
          <option value="С">Стихийный</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="weapon-sort">Сортировка</label>
        <select id="weapon-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="price">По цене</option>
          <option value="weight">По весу</option>
        </select>
      </div>

      <button class="weapon-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ baseCount }}</span>
    </div>

    <div class="wr-summary">
      <span>Выбрано: <strong>{{ selected.length }}</strong></span>
      <span>Вес: <strong>{{ formatWeight(totalWeight) }} кг</strong></span>
      <span>
        Цена:
        <strong v-if="!unpricedCount">{{ formatWeight(totalPrice) }} кр.</strong>
        <strong v-else-if="!pricedItems.length">по чертежу</strong>
        <strong v-else>{{ formatWeight(totalPrice) }} кр. + {{ unpricedCount }} по чертежу</strong>
      </span>
      <button v-if="selected.length" class="weapon-reset" type="button" @click="clearSelection">
        Сбросить выбор
      </button>
    </div>

    <p class="weapon-legend">
      <strong>Т</strong> — точность, <strong>Дос</strong> — доступность (П/О/Р/У),
      <strong>Н</strong> — надёжность, <strong>Х</strong> — хват, <strong>Ус</strong> — усиления,
      <strong>Скр</strong> — скрытность (М/Н/К/Н/С).
    </p>

    <div v-if="visible.length" class="weapon-table-wrap">
      <table class="weapon-table">
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
            <th>Тип</th>
            <th title="Точность">Т</th>
            <th title="Доступность">Дос</th>
            <th>Урон</th>
            <th title="Надёжность">Н</th>
            <th title="Хват">Х</th>
            <th>Дистанция</th>
            <th>Эффект</th>
            <th title="Скрытность">Скр</th>
            <th title="Усиления">Ус</th>
            <th>Вес, кг</th>
            <th>Цена, кр.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="weapon in visible" :id="`weapon-${weapon.id}`" :key="weapon.id">
            <td class="col-check">
              <input
                type="checkbox"
                :checked="selected.includes(weapon.id)"
                :aria-label="`Выбрать: ${weapon.name}`"
                @change="toggle(weapon.id)"
              />
            </td>
            <td class="col-name">
              <button type="button" class="wr-item-link" @click="openItem(weapon)">
                {{ weapon.name }}
              </button>
              <span v-if="weapon.elderfolk" class="weapon-origin">Старший Народ</span>
              <span v-else-if="weapon.witcher" class="weapon-origin weapon-origin--witcher">
                Ведьмачье
              </span>
            </td>
            <td>{{ weapon.type }}</td>
            <td class="col-num">{{ signed(weapon.accuracy) }}</td>
            <td>
              <span class="wr-abbr" :title="availabilityLabels[weapon.availability]">
                {{ availabilityShort[weapon.availability] }}
              </span>
            </td>
            <td class="col-damage"><RulesText :text="weapon.damage" /></td>
            <td class="col-num">{{ weapon.reliability }}</td>
            <td class="col-num">{{ weapon.hands }}</td>
            <td>{{ weapon.range }}</td>
            <td class="col-effects">
              <EffectText :text="weapon.effects.join('; ') || '—'" />
            </td>
            <td>
              <span class="wr-abbr" :title="concealmentLabels[weapon.concealment]">
                {{ concealmentShort[weapon.concealment] }}
              </span>
            </td>
            <td class="col-num">{{ weapon.upgradeSlots }}</td>
            <td class="col-num">{{ formatWeight(weapon.weight) }}</td>
            <td
              class="col-num"
              :title="weapon.price === null ? 'Цена не указана: предмет изготавливается по чертежу' : undefined"
            >
              {{ weapon.price === null ? '—' : formatWeight(weapon.price) }}
            </td>
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
.weapon-catalog {
  margin-top: 1.5rem;
}

.wr-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem 1.25rem;
  padding: 0.65rem 0.85rem;
  margin-bottom: 0.75rem;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 4px;
  font-family: var(--site-sans);
  font-size: 13px;
  color: var(--site-muted);
}

.wr-summary strong {
  color: var(--site-ink);
}

.weapon-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.weapon-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .weapon-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.weapon-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.weapon-table {
  width: 100%;
  min-width: 1060px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
}

.weapon-table th,
.weapon-table td {
  padding: 0.4rem 0.45rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.weapon-table th {
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

.weapon-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.weapon-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.weapon-table tbody tr:last-child td {
  border-bottom: 0;
}

.weapon-table .col-check {
  width: 28px;
  text-align: center;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
}

.weapon-table .col-name {
  min-width: 170px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.weapon-table .col-name a {
  color: var(--site-ink);
  text-decoration: none;
}

.weapon-table .col-name a:hover {
  color: var(--site-blood);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dark .weapon-table .col-name a:hover {
  color: var(--site-gold);
}

.weapon-origin {
  display: inline-block;
  margin-left: 0.35rem;
  padding: 0.1rem 0.3rem;
  font-family: var(--site-sans);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.03em;
  line-height: 1.3;
  text-transform: uppercase;
  color: var(--site-muted);
  border: 1px solid var(--site-border);
  border-radius: 3px;
  white-space: nowrap;
  vertical-align: 1px;
}

.weapon-origin--witcher {
  color: var(--site-blue);
  border-color: color-mix(in srgb, var(--site-blue) 35%, transparent);
  background: color-mix(in srgb, var(--site-blue) 8%, transparent);
}

.weapon-table .col-num {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.weapon-table .col-damage {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.weapon-table .col-effects {
  min-width: 160px;
  color: var(--site-muted);
}

.weapon-table .wr-abbr {
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

.weapon-legend {
  margin: 0 0 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

@media (max-width: 640px) {
  .wr-summary {
    align-items: flex-start;
  }
}
</style>
