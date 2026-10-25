<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/spells.json'
import { bookList, getBook } from '../../data/books'
import type { Spell, SpellElement, SpellLevel } from '../../schemas/spell'
import MagicTile from './MagicTile.vue'
import { useMagicDrawer } from '../composables/useMagicDrawer'

const props = defineProps<{
  level?: SpellLevel
  element?: SpellElement
  lockLevel?: boolean
}>()

const spells = data.items as Spell[]
const { openMagic } = useMagicDrawer()

const levelLabels: Record<SpellLevel, string> = {
  novice: 'Новичок',
  adept: 'Подмастерье',
  master: 'Мастер'
}

const levelShortLabels: Record<SpellLevel, string> = {
  novice: 'Нов.',
  adept: 'Подм.',
  master: 'Маст.'
}

const elementLabels: Record<SpellElement, string> = {
  mixed: 'Смешанные',
  earth: 'Земля',
  air: 'Воздух',
  fire: 'Огонь',
  water: 'Вода',
  necromancy: 'Некромантия'
}

const levelOrder: Record<SpellLevel, number> = {
  novice: 0,
  adept: 1,
  master: 2
}

const initialLevel = props.level ?? 'all'
const initialElement = props.element ?? 'all'

const query = ref('')
const level = ref<'all' | SpellLevel>(initialLevel)
const element = ref<'all' | SpellElement>(initialElement)
const book = ref<'all' | string>('all')
const sort = ref<'name' | 'level' | 'cost'>('level')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const baseCount = computed(() => {
  return spells.filter((spell) => {
    if (level.value !== 'all' && spell.level !== level.value) return false
    if (element.value !== 'all' && spell.element !== element.value) return false
    if (book.value !== 'all' && getBook(spell.sourceBook).id !== book.value) return false
    return true
  }).length
})

const booksInData = computed(() =>
  bookList.filter((item) => spells.some((spell) => getBook(spell.sourceBook).id === item.id))
)

const visible = computed(() => {
  const q = normalized(query.value.trim())

  const filtered = spells.filter((spell) => {
    if (level.value !== 'all' && spell.level !== level.value) return false
    if (element.value !== 'all' && spell.element !== element.value) return false
    if (book.value !== 'all' && getBook(spell.sourceBook).id !== book.value) return false
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
  level.value = initialLevel
  element.value = initialElement
  book.value = 'all'
  sort.value = 'level'
}

const costLabel = (spell: Spell) => {
  if (spell.costText) return spell.costText
  if (spell.costVariable) return 'Вын: меняется'
  return `${spell.cost} Вын`
}

const openSpell = (spell: Spell) => {
  openMagic({
    title: spell.name,
    subtitle: `Заклинание · ${levelLabels[spell.level]} · ${elementLabels[spell.element]}`,
    stats: [
      { label: 'Стихия', value: elementLabels[spell.element] },
      { label: 'Уровень', value: levelLabels[spell.level] },
      { label: 'Затраты', value: costLabel(spell) },
      { label: 'Дистанция', value: spell.range },
      { label: 'Длительность', value: spell.duration },
      { label: 'Защита', value: spell.defense },
      ...(spell.healthCost ? [{ label: 'Затраты ПЗ', value: spell.healthCost }] : []),
      ...(spell.language === 'en' ? [{ label: 'Язык', value: 'Английский (оригинал)' }] : [])
    ],
    effect: spell.effect,
    sourcePage: spell.sourcePage,
    sourceBook: spell.sourceBook
  })
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
          <option value="necromancy">Некромантия</option>
        </select>
      </div>

      <div v-if="booksInData.length > 1" class="wr-field">
        <label for="spell-book">Книга</label>
        <select id="spell-book" v-model="book" class="wr-select">
          <option value="all">Все</option>
          <option v-for="item in booksInData" :key="item.id" :value="item.id">
            {{ item.short }} — {{ item.note }}
          </option>
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
      <span class="wr-count">{{ visible.length }} из {{ baseCount }}</span>
    </div>

    <p v-if="visible.length" class="magic-grid-hint">
      Нажмите на карточку, чтобы открыть подробности.
    </p>

    <div v-if="visible.length" class="magic-tile-grid">
      <MagicTile
        v-for="spell in visible"
        :id="`spell-${spell.id}`"
        :key="spell.id"
        :title="spell.name"
        kind-label="Заклинание"
        :tone="spell.element"
        :meta-label="elementLabels[spell.element]"
        :tag-label="levelShortLabels[spell.level]"
        :cost-label="costLabel(spell)"
        :source-book="spell.sourceBook"
        :source-page="spell.sourcePage"
        :language="spell.language"
        @open="openSpell(spell)"
      />
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="visible.length" class="magic-search-index" aria-hidden="true">
      <p v-for="spell in visible" :key="`search-${spell.id}`">
        <RulesText
          :text="
            [spell.name, spell.effect, spell.range, spell.duration, spell.defense]
              .filter(Boolean)
              .join(' ')
          "
        />
      </p>
    </div>
  </div>
</template>

<style scoped>
.magic-tile-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

.magic-grid-hint {
  margin: 0.8rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.4;
  color: var(--site-faint);
}

.magic-search-index {
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

@media (max-width: 1100px) {
  .magic-tile-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .magic-tile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .magic-tile-grid {
    grid-template-columns: 1fr;
  }

  .spell-reset {
    width: 100%;
  }
}
</style>
