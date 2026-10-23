<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/spells.json'
import type { Spell, SpellElement, SpellLevel } from '../../schemas/spell'

const props = defineProps<{
  level?: SpellLevel
  element?: SpellElement
  lockLevel?: boolean
}>()

const spells = data.items as Spell[]

const levelLabels: Record<SpellLevel, string> = {
  novice: 'Новичок',
  adept: 'Подмастерье',
  master: 'Мастер'
}

const elementLabels: Record<SpellElement, string> = {
  mixed: 'Смешанные',
  earth: 'Земля',
  air: 'Воздух',
  fire: 'Огонь',
  water: 'Вода'
}

const levelOrder: Record<SpellLevel, number> = {
  novice: 0,
  adept: 1,
  master: 2
}

const query = ref('')
const level = ref<'all' | SpellLevel>(props.level ?? 'all')
const element = ref<'all' | SpellElement>(props.element ?? 'all')
const sort = ref<'name' | 'level' | 'cost'>('level')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const visible = computed(() => {
  const q = normalized(query.value.trim())

  const filtered = spells.filter((spell) => {
    if (level.value !== 'all' && spell.level !== level.value) return false
    if (element.value !== 'all' && spell.element !== element.value) return false
    if (!q) return true

    const haystack = normalized(
      [spell.name, spell.effect, spell.range, spell.duration, spell.defense].join(' ')
    )
    return haystack.includes(q)
  })

  return filtered.sort((a, b) => {
    if (sort.value === 'name') return a.name.localeCompare(b.name, 'ru')
    if (sort.value === 'cost') return a.cost - b.cost || a.name.localeCompare(b.name, 'ru')
    return levelOrder[a.level] - levelOrder[b.level] || a.name.localeCompare(b.name, 'ru')
  })
})

const reset = () => {
  query.value = ''
  level.value = 'all'
  element.value = 'all'
  sort.value = 'level'
}

const costLabel = (spell: Spell) => {
  if (spell.costVariable) return 'меняется'
  return `${spell.cost} Вын`
}
</script>

<template>
  <div class="spell-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="spell-query">Поиск</label>
        <input
          id="spell-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название или эффект…"
          autocomplete="off"
        />
      </div>

      <div v-if="!lockLevel" class="wr-field">
        <label for="spell-level">Уровень</label>
        <select id="spell-level" v-model="level" class="wr-select">
          <option value="all">Все</option>
          <option value="novice">Новичок</option>
          <option value="adept">Подмастерье</option>
          <option value="master">Мастер</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="spell-element">Стихия</label>
        <select id="spell-element" v-model="element" class="wr-select">
          <option value="all">Все</option>
          <option value="mixed">Смешанные</option>
          <option value="earth">Земля</option>
          <option value="air">Воздух</option>
          <option value="fire">Огонь</option>
          <option value="water">Вода</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="spell-sort">Сортировка</label>
        <select id="spell-sort" v-model="sort" class="wr-select">
          <option value="level">По уровню</option>
          <option value="name">По названию</option>
          <option value="cost">По затратам</option>
        </select>
      </div>

      <button class="spell-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ spells.length }}</span>
    </div>

    <div v-if="visible.length" class="wr-cards">
      <article
        v-for="spell in visible"
        :id="`spell-${spell.id}`"
        :key="spell.id"
        class="wr-card spell-card"
      >
        <div class="wr-card__top">
          <h3 class="wr-card__title">
            <a :href="`#spell-${spell.id}`">{{ spell.name }}</a>
          </h3>
          <span class="spell-cost">{{ costLabel(spell) }}</span>
        </div>

        <div class="wr-badges">
          <span class="wr-badge" :class="`wr-badge--${spell.level}`">
            {{ levelLabels[spell.level] }}
          </span>
          <span class="wr-badge" :class="`wr-badge--${spell.element}`">
            {{ elementLabels[spell.element] }}
          </span>
        </div>

        <div class="wr-stat-grid">
          <div class="wr-stat">
            <span class="wr-stat__label">Дистанция</span>
            <span class="wr-stat__value">{{ spell.range }}</span>
          </div>
          <div class="wr-stat">
            <span class="wr-stat__label">Длительность</span>
            <span class="wr-stat__value">{{ spell.duration }}</span>
          </div>
          <div class="wr-stat">
            <span class="wr-stat__label">Защита</span>
            <span class="wr-stat__value">{{ spell.defense }}</span>
          </div>
          <div class="wr-stat">
            <span class="wr-stat__label">Затраты</span>
            <span class="wr-stat__value">{{ costLabel(spell) }}</span>
          </div>
        </div>

        <div class="wr-effect">
          <p>{{ spell.effect }}</p>
        </div>

        <div class="wr-source">Источник: стр. {{ spell.sourcePage }}</div>
      </article>
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>
  </div>
</template>

<style scoped>
.spell-card {
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
}

.spell-card .wr-card__title a {
  color: var(--site-ink);
  text-decoration: none;
}

.spell-card .wr-card__title a:hover {
  color: var(--site-blood);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.dark .spell-card .wr-card__title a:hover {
  color: var(--site-gold);
}

.spell-cost {
  flex: 0 0 auto;
  font-family: var(--site-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--site-muted);
  white-space: nowrap;
}

.spell-reset {
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

.spell-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .spell-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

@media (max-width: 640px) {
  .spell-reset {
    width: 100%;
  }
}
</style>
