<script setup lang="ts">
import { computed, ref } from 'vue'
import ammoData from '../../data/ammo.json'
import upgradesData from '../../data/weapon-upgrades.json'
import type { Ammo, WeaponUpgrade } from '../../schemas/ammo'
import { useItemDrawer } from '../composables/useItemDrawer'
import EffectText from './EffectText.vue'

const props = defineProps<{ dataset: 'ammo' | 'upgrades' }>()

const ammo = ammoData.items as Ammo[]
const upgrades = upgradesData.items as WeaponUpgrade[]
const items = computed(() => (props.dataset === 'ammo' ? ammo : upgrades))

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
const sort = ref<'name' | 'price'>('name')
const { open } = useItemDrawer()

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items.value
    .filter((item) => {
      if (!q) return true
      return normalized([item.name, item.effect].join(' ')).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'price') return a.price - b.price || a.name.localeCompare(b.name, 'ru')
      return a.name.localeCompare(b.name, 'ru')
    })
})

const reset = () => {
  query.value = ''
  sort.value = 'name'
}

const ammoOf = (item: Ammo | WeaponUpgrade) => item as Ammo

const openItem = (item: Ammo | WeaponUpgrade) => {
  if (props.dataset === 'ammo') {
    const entry = ammoOf(item)
    open({
      title: entry.name,
      subtitle: 'Боеприпас',
      sourcePage: entry.sourcePage,
      sourceBook: entry.sourceBook,
      stats: [
        { label: 'Тип', value: entry.type },
        { label: 'Доступность', value: availabilityLabels[entry.availability] },
        { label: 'Надёжность', value: String(entry.reliability) },
        { label: 'Происхождение', value: entry.elderfolk ? 'Старший Народ' : 'Люди' },
        { label: 'Вес', value: `${entry.weight.toLocaleString('ru-RU')} кг` },
        { label: 'Цена', value: `${entry.price.toLocaleString('ru-RU')} кр.` }
      ]
    })
    return
  }

  open({
    title: item.name,
    subtitle: 'Улучшение арбалета',
    sourcePage: item.sourcePage,
    sourceBook: item.sourceBook,
    stats: [
      { label: 'Доступность', value: availabilityLabels[item.availability] },
      { label: 'Вес', value: `${item.weight.toLocaleString('ru-RU')} кг` },
      { label: 'Цена', value: `${item.price.toLocaleString('ru-RU')} кр.` }
    ]
  })
}

const formatNumber = (value: number) => value.toLocaleString('ru-RU')
</script>

<template>
  <div class="weapon-accessory">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label :for="`${dataset}-query`">Поиск</label>
        <input
          :id="`${dataset}-query`"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или эффект…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label :for="`${dataset}-sort`">Сортировка</label>
        <select :id="`${dataset}-sort`" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="price">По цене</option>
        </select>
      </div>

      <button class="weapon-accessory__reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <p class="weapon-accessory__hint">
      Нажмите на название, чтобы открыть полное описание и характеристики.
    </p>

    <div v-if="visible.length" class="weapon-accessory__table-wrap">
      <table class="weapon-accessory__table" :aria-label="dataset === 'ammo' ? 'Боеприпасы' : 'Улучшения арбалета'">
        <thead>
          <tr>
            <th scope="col">Название</th>
            <th v-if="dataset === 'ammo'" scope="col">Тип</th>
            <th v-if="dataset === 'ammo'" scope="col">Н</th>
            <th scope="col">Дос</th>
            <th scope="col">Эффект</th>
            <th scope="col">Вес</th>
            <th scope="col">Цена</th>
            <th scope="col">Источник</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in visible" :key="item.id">
            <td class="col-name">
              <button type="button" class="wr-item-link" @click="openItem(item)">
                {{ item.name }}
              </button>
            </td>
            <td v-if="dataset === 'ammo'">{{ ammoOf(item).type }}</td>
            <td v-if="dataset === 'ammo'" class="col-center">{{ ammoOf(item).reliability }}</td>
            <td>
              <span class="wr-abbr" :title="availabilityLabels[item.availability]">
                {{ availabilityShort[item.availability] }}
              </span>
            </td>
            <td class="col-effects"><EffectText :text="item.effect" /></td>
            <td class="col-num">{{ formatNumber(item.weight) }}</td>
            <td class="col-num">{{ formatNumber(item.price) }}</td>
            <td><SourceBadge :book="item.sourceBook" :page="item.sourcePage" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="visible.length" class="weapon-accessory__search-index" aria-hidden="true">
      <p v-for="item in visible" :key="`search-${item.id}`">
        <RulesText :text="[item.name, item.effect].join(' ')" />
      </p>
    </div>
  </div>
</template>

<style scoped>
.weapon-accessory__hint {
  margin: 0.8rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.4;
  color: var(--site-muted);
}

.weapon-accessory__reset {
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

.weapon-accessory__reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .weapon-accessory__reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.weapon-accessory__table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.weapon-accessory__table {
  width: 100%;
  min-width: 760px;
  margin: 0;
  border: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
}

.weapon-accessory__table tr {
  background: transparent;
  border: 0;
}

.weapon-accessory__table th {
  padding: 0.45rem 0.55rem;
  text-align: left;
  white-space: nowrap;
  background: var(--site-surface-2);
  border: 0;
  border-bottom: 1px solid var(--site-border-strong);
  color: var(--site-muted);
}

.weapon-accessory__table td {
  padding: 0.45rem 0.55rem;
  vertical-align: top;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--site-border);
  color: var(--site-muted);
}

.weapon-accessory__table tbody tr:nth-child(2n),
.weapon-accessory__table tbody tr:nth-child(2n) td {
  background: transparent;
}

.weapon-accessory__table tbody tr:hover td {
  background: var(--site-surface-2);
}

.weapon-accessory__table tbody tr:last-child td {
  border-bottom: 0;
}

.weapon-accessory__table .col-name {
  min-width: 180px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.weapon-accessory__table .col-effects {
  min-width: 260px;
}

.weapon-accessory__search-index {
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
  .weapon-accessory__reset {
    width: 100%;
  }
}
</style>
