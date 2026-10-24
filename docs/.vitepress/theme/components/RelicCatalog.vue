<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/relics.json'
import type { Relic } from '../../schemas/relic'
import { useItemDrawer } from '../composables/useItemDrawer'

const relics = data.items as Relic[]
const { open } = useItemDrawer()

const kindLabels = {
  weapon: 'Оружие',
  armor: 'Броня'
} as const

const categoryLabels: Record<string, string> = {
  sword: 'Меч',
  dagger: 'Кинжал',
  axe: 'Топор',
  hammer: 'Молот',
  spear: 'Копьё',
  staff: 'Посох',
  bow: 'Лук',
  crossbow: 'Арбалет',
  'light-armor': 'Лёгкая броня',
  'medium-armor': 'Средняя броня',
  'heavy-armor': 'Тяжёлая броня'
}

const query = ref('')
const kind = ref<'all' | 'weapon' | 'armor'>('all')
const sort = ref<'name' | 'weight'>('name')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const searchText = (relic: Relic) =>
  normalized(
    [
      relic.name,
      categoryLabels[relic.category],
      relic.check,
      relic.weapon?.kind,
      relic.weapon?.type,
      relic.weapon?.damage,
      relic.weapon?.range,
      ...(relic.weapon?.effects ?? []),
      relic.armor?.kind,
      ...(relic.armor?.effects ?? []),
      ...relic.description
    ]
      .filter(Boolean)
      .join(' ')
  )

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return relics
    .filter((relic) => {
      if (kind.value !== 'all' && relic.kind !== kind.value) return false
      if (!q) return true
      return searchText(relic).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'weight') {
        const aw = a.weapon?.weight ?? a.armor?.weight ?? 0
        const bw = b.weapon?.weight ?? b.armor?.weight ?? 0
        return aw - bw || a.name.localeCompare(b.name, 'ru')
      }
      return a.name.localeCompare(b.name, 'ru')
    })
})

const reset = () => {
  query.value = ''
  kind.value = 'all'
  sort.value = 'name'
}

const weight = (relic: Relic) => relic.weapon?.weight ?? relic.armor?.weight ?? 0
const category = (relic: Relic) => categoryLabels[relic.category] ?? relic.category
const damageOrArmor = (relic: Relic) =>
  relic.weapon ? relic.weapon.damage : `ПБ ${relic.armor?.stoppingPower ?? 0}`
const effectSummary = (relic: Relic) =>
  (relic.weapon?.effects ?? relic.armor?.effects ?? []).join(' · ')

const openRelic = (relic: Relic, event?: MouseEvent) => {
  const row = (event?.currentTarget as HTMLElement | null)?.closest('tr')
  row?.querySelector<HTMLButtonElement>('.relic-open')?.focus()

  const stats = [{ label: 'Проверка', value: relic.check }]

  if (relic.weapon) {
    stats.push(
      { label: 'Тип', value: relic.weapon.type },
      { label: 'Вид', value: relic.weapon.kind },
      { label: 'Точность', value: relic.weapon.accuracy },
      { label: 'Урон', value: relic.weapon.damage },
      { label: 'Надёжность', value: String(relic.weapon.reliability) },
      { label: 'Хват', value: String(relic.weapon.hands) },
      { label: 'Дистанция', value: relic.weapon.range },
      { label: 'Эффект', value: relic.weapon.effects.join('; ') },
      { label: 'Скрытность', value: relic.weapon.concealment },
      { label: 'Усиления', value: String(relic.weapon.upgradeSlots) },
      { label: 'Вес', value: String(relic.weapon.weight) }
    )
  } else if (relic.armor) {
    stats.push(
      { label: 'Вид', value: relic.armor.kind },
      { label: 'ПБ', value: String(relic.armor.stoppingPower) },
      { label: 'УБ', value: String(relic.armor.upgradeSlots) },
      { label: 'Эффект', value: relic.armor.effects.join('; ') },
      { label: 'Защищает', value: relic.armor.covers },
      { label: 'СД', value: String(relic.armor.defense) },
      { label: 'Вес', value: String(relic.armor.weight) }
    )
  }

  open({
    title: relic.name,
    subtitle: `Реликвия · ${kindLabels[relic.kind]} · ${category(relic)}`,
    stats,
    description: relic.description.join('\n\n'),
    descriptionTitle: 'История',
    sourcePage: relic.sourcePage
  })
}
</script>

<template>
  <div class="relic-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="relic-query">Поиск</label>
        <input
          id="relic-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название, эффект или история…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="relic-kind">Тип</label>
        <select id="relic-kind" v-model="kind" class="wr-select">
          <option value="all">Все</option>
          <option value="weapon">Оружие</option>
          <option value="armor">Броня</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="relic-sort">Сортировка</label>
        <select id="relic-sort" v-model="sort" class="wr-select">
          <option value="name">По названию</option>
          <option value="weight">По весу</option>
        </select>
      </div>

      <button class="relic-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ relics.length }}</span>
    </div>

    <p class="relic-hint">
      Нажмите на название, чтобы открыть полный блок характеристик и историю реликвии.
    </p>

    <div v-if="visible.length" class="relic-table-wrap">
      <table class="relic-table" aria-label="Реликвии Ведьмака">
        <thead>
          <tr>
            <th scope="col">Название</th>
            <th scope="col">Вид</th>
            <th scope="col">Урон / ПБ</th>
            <th scope="col">Эффект</th>
            <th scope="col">Вес</th>
            <th scope="col">Стр.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="relic in visible" :key="relic.id" @click="openRelic(relic, $event)">
            <td>
              <button class="relic-open" type="button" @click.stop="openRelic(relic, $event)">
                {{ relic.name }}
              </button>
            </td>
            <td>{{ category(relic) }}</td>
            <td>{{ damageOrArmor(relic) }}</td>
            <td>{{ effectSummary(relic) }}</td>
            <td>{{ weight(relic) }}</td>
            <td>{{ relic.sourcePage }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="visible.length" class="relic-search-index" aria-hidden="true">
      <p v-for="relic in visible" :key="`search-${relic.id}`">
        {{ relic.name }}. {{ searchText(relic) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.relic-reset {
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

.relic-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .relic-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.relic-hint {
  margin: 0.8rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.4;
  color: var(--site-muted);
}

.relic-table-wrap {
  margin-top: 0.75rem;
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.relic-table {
  width: 100%;
  min-width: 760px;
  margin: 0;
  border: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
}

.relic-table tr {
  background: transparent;
  border: 0;
}

.relic-table th {
  padding: 0.45rem 0.55rem;
  text-align: left;
  white-space: nowrap;
  background: var(--site-surface-2);
  border: 0;
  border-bottom: 1px solid var(--site-border-strong);
  color: var(--site-muted);
}

.relic-table td {
  padding: 0.45rem 0.55rem;
  vertical-align: top;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--site-border);
  color: var(--site-muted);
}

.relic-table tbody tr {
  cursor: pointer;
}

.relic-table tbody tr:nth-child(2n),
.relic-table tbody tr:nth-child(2n) td {
  background: transparent;
}

.relic-table tbody tr:hover td {
  background: var(--site-surface-2);
}

.relic-table tbody tr:last-child td {
  border-bottom: 0;
}

.relic-open {
  padding: 0;
  font-family: var(--site-serif);
  font-size: 13.5px;
  font-weight: 600;
  color: var(--site-ink);
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.relic-open:hover {
  color: var(--site-blood);
}

.relic-open:focus-visible {
  outline: 2px solid var(--site-gold);
  outline-offset: 2px;
}

.dark .relic-open:hover {
  color: var(--site-gold);
}

.relic-search-index {
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
  .relic-reset {
    width: 100%;
  }
}
</style>
