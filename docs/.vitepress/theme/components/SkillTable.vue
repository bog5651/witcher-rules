<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/skills.json'
import type { Skill } from '../../schemas/skill'

const items = data.items as Skill[]

const attributeLabels = {
  int: 'Интеллект',
  ref: 'Реакция',
  dex: 'Ловкость',
  body: 'Телосложение',
  emp: 'Эмпатия',
  craft: 'Ремесло',
  will: 'Воля'
} as const

const attributeOrder = ['int', 'ref', 'dex', 'body', 'emp', 'craft', 'will'] as const

const query = ref('')
const attribute = ref<'all' | Skill['attribute']>('all')
const complexity = ref<'all' | 'simple' | 'complex'>('all')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return items.filter((item) => {
    if (attribute.value !== 'all' && item.attribute !== attribute.value) return false
    if (complexity.value === 'simple' && item.complex) return false
    if (complexity.value === 'complex' && !item.complex) return false
    if (!q) return true
    return normalized(item.name).includes(q) || normalized(item.summary).includes(q)
  })
})

const sections = computed(() =>
  attributeOrder
    .map((key) => ({
      key,
      label: attributeLabels[key],
      items: visible.value
        .filter((item) => item.attribute === key)
        .sort((a, b) => a.name.localeCompare(b.name, 'ru'))
    }))
    .filter((section) => section.items.length)
)

const reset = () => {
  query.value = ''
  attribute.value = 'all'
  complexity.value = 'all'
}
</script>

<template>
  <div class="skill-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="skill-query">Поиск</label>
        <input
          id="skill-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или описание…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="skill-attribute">Параметр</label>
        <select id="skill-attribute" v-model="attribute" class="wr-select">
          <option value="all">Все</option>
          <option v-for="key in attributeOrder" :key="key" :value="key">
            {{ attributeLabels[key] }}
          </option>
        </select>
      </div>

      <div class="wr-field">
        <label for="skill-complexity">Тип</label>
        <select id="skill-complexity" v-model="complexity" class="wr-select">
          <option value="all">Все</option>
          <option value="simple">Обычные</option>
          <option value="complex">Сложные (2)</option>
        </select>
      </div>

      <button class="skill-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ items.length }}</span>
    </div>

    <template v-for="section in sections" :key="section.key">
      <h3>{{ section.label }}</h3>
      <div class="skill-table-wrap">
        <table class="skill-table">
          <thead>
            <tr>
              <th>Навык</th>
              <th>Тип</th>
              <th>Что делает</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in section.items" :id="`skill-${item.id}`" :key="item.id">
              <td class="col-name">{{ item.name }}</td>
              <td class="col-type">
                <span :class="['skill-type', { 'skill-type--complex': item.complex }]">
                  {{ item.complex ? 'Сложный (2)' : 'Обычный' }}
                </span>
              </td>
              <td class="col-summary"><RulesText :text="item.summary" /></td>
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
.skill-catalog {
  margin-top: 1.5rem;
}

.skill-catalog h3 {
  margin: 1.4rem 0 0.6rem;
  font-family: var(--site-serif);
  font-size: 1.2rem;
}

.skill-reset {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.skill-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .skill-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.skill-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.skill-table {
  width: 100%;
  min-width: 720px;
  margin: 0;
  border-collapse: collapse;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.5;
}

.skill-table th,
.skill-table td {
  padding: 0.4rem 0.5rem;
  border-bottom: 1px solid var(--site-border);
  text-align: left;
  vertical-align: top;
}

.skill-table th {
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

.skill-table tbody tr:nth-child(2n) td {
  background: color-mix(in srgb, var(--site-surface-2) 45%, transparent);
}

.skill-table tbody tr:hover td {
  background: var(--site-gold-soft);
}

.skill-table tbody tr:last-child td {
  border-bottom: 0;
}

.skill-table .col-name {
  min-width: 190px;
  font-family: var(--site-serif);
  font-size: 13px;
  font-weight: 600;
}

.skill-table .col-type {
  white-space: nowrap;
}

.skill-type {
  display: inline-block;
  padding: 0.1rem 0.35rem;
  font-size: 10px;
  color: var(--site-muted);
  background: var(--site-surface-2);
  border-radius: 3px;
}

.skill-type--complex {
  color: var(--site-blood);
  background: var(--site-blood-soft);
}

.dark .skill-type--complex {
  color: var(--site-gold);
  background: var(--site-gold-soft);
}

.skill-table .col-summary {
  color: var(--site-muted);
}
</style>
