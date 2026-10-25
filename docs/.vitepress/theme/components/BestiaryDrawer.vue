<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import data from '../../data/bestiary.json'
import type { BestiaryClass, BestiaryEntry } from '../../schemas/bestiary'
import EffectText from './EffectText.vue'

const props = defineProps<{
  entry: BestiaryEntry
  initialVariant: number
}>()

const emit = defineEmits<{ close: [] }>()

const classes = data.classes as BestiaryClass[]
const clampVariant = (index: number) =>
  Math.min(Math.max(index, 0), Math.max(props.entry.variants.length - 1, 0))
const activeVariant = ref(clampVariant(props.initialVariant))
const mounted = ref(false)
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
let previousFocus: HTMLElement | null = null
let previousOverflow = ''
let appRoot: HTMLElement | null = null

const overallLabels = {
  simple: 'Простые',
  medium: 'Средние',
  complex: 'Сложные'
} as const

const tierLabels = {
  ordinary: 'Обычные',
  unremarkable: 'Незаурядные',
  hard: 'Трудные'
} as const

const attributeLabels = [
  ['int', 'Инт'],
  ['rea', 'Реа'],
  ['dex', 'Лвк'],
  ['body', 'Тел'],
  ['speed', 'Скор'],
  ['emp', 'Эмп'],
  ['craft', 'Рем'],
  ['will', 'Воля'],
  ['luck', 'Удача']
] as const

const derivedLabels = [
  ['stun', 'Уст'],
  ['run', 'Бег'],
  ['jump', 'Прж'],
  ['stamina', 'Вын'],
  ['carry', 'Вес'],
  ['rest', 'Отдых'],
  ['hp', 'ПЗ'],
  ['energy', 'Энергия']
] as const

const variant = computed(() => props.entry.variants[activeVariant.value] ?? props.entry.variants[0])
const classInfo = computed(() => classes.find((item) => item.id === props.entry.classId))
const difficulty = computed(() => {
  const value = props.entry.difficulty
  if (!value) return ''
  return `${overallLabels[value.overall]} · ${tierLabels[value.tier]}`
})
const sourceLabel = computed(() => {
  if (props.entry.descriptionPage && props.entry.descriptionPage !== props.entry.statPage) {
    return `Стр. ${props.entry.statPage}–${props.entry.descriptionPage}`
  }
  return `Стр. ${props.entry.statPage}`
})
const sizeRows = computed(() => {
  const size = variant.value.size
  const rows: Array<[string, string]> = []
  const add = (label: string, value: string | null) => {
    if (value) rows.push([label, value])
  }

  add('Рост', size.height)
  add('Вес', size.weight)
  add('Среда обитания', size.habitat)
  add('Интеллект', size.intellect)
  add('Численность', size.population)
  return rows
})

const close = () => emit('close')

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab' || !panel.value) return

  const focusables = Array.from(
    panel.value.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => !element.hasAttribute('disabled'))

  if (!focusables.length) return

  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => [props.entry.id, props.initialVariant],
  async () => {
    activeVariant.value = clampVariant(props.initialVariant)
    await nextTick()
    panel.value?.scrollTo({ top: 0 })
  }
)

onMounted(async () => {
  mounted.value = true
  previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
  previousOverflow = document.body.style.overflow
  appRoot = document.getElementById('app')
  appRoot?.setAttribute('inert', '')
  document.body.style.overflow = 'hidden'
  document.addEventListener('keydown', onKeydown)
  await nextTick()
  closeButton.value?.focus()
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = previousOverflow
  appRoot?.removeAttribute('inert')
  previousFocus?.focus()
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <div class="bestiary-drawer">
      <div class="bestiary-drawer__backdrop" @click="close" />

      <aside
        ref="panel"
        class="bestiary-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bestiary-drawer-title"
      >
        <header class="bestiary-drawer__header">
          <div>
            <p class="bestiary-drawer__subtitle">
              {{ classInfo?.name }}
              <span v-if="difficulty"> · {{ difficulty }}</span>
            </p>
            <h2 id="bestiary-drawer-title" class="bestiary-drawer__title">{{ entry.name }}</h2>
          </div>
          <button
            ref="closeButton"
            class="bestiary-drawer__close"
            type="button"
            aria-label="Закрыть"
            @click="close"
          >
            ×
          </button>
        </header>

        <div v-if="entry.variants.length > 1" class="bestiary-variants" role="group" aria-label="Варианты">
          <button
            v-for="(item, index) in entry.variants"
            :key="item.name"
            type="button"
            class="bestiary-variant"
            :class="{ 'bestiary-variant--active': activeVariant === index }"
            :aria-pressed="activeVariant === index"
            @click="activeVariant = index"
          >
            {{ item.name }}
          </button>
        </div>

        <section class="bestiary-section">
          <h3>Параметры</h3>
          <div class="bestiary-attributes">
            <div v-for="[key, label] in attributeLabels" :key="key" class="bestiary-attribute">
              <span>{{ label }}</span>
              <strong>{{ variant.attributes[key] }}</strong>
            </div>
          </div>
          <div class="bestiary-derived">
            <div v-for="[key, label] in derivedLabels" :key="key" class="bestiary-derived__item">
              <span>{{ label }}</span>
              <strong><RulesText :text="variant.derived[key] ?? '—'" /></strong>
            </div>
          </div>
          <div class="bestiary-combat">
            <span>Броня <strong>{{ variant.armor }}</strong></span>
            <span v-if="entry.reward !== null">Награда <strong>{{ entry.reward }} крон</strong></span>
          </div>
        </section>

        <section v-if="sizeRows.length" class="bestiary-section">
          <h3>Размер и среда</h3>
          <dl class="bestiary-size">
            <div v-for="[label, value] in sizeRows" :key="label">
              <dt>{{ label }}</dt>
              <dd><RulesText :text="value" /></dd>
            </div>
          </dl>
        </section>

        <section class="bestiary-section">
          <h3>Навыки</h3>
          <ul class="bestiary-skills">
            <li v-for="skill in variant.skills" :key="skill.name">
              <span>{{ skill.name }}</span>
              <strong>+{{ skill.value }}</strong>
            </li>
          </ul>
        </section>

        <section v-if="variant.abilities.length" class="bestiary-section">
          <h3>Способности</h3>
          <article v-for="ability in variant.abilities" :key="ability.name" class="bestiary-ability">
            <h4>{{ ability.name }}</h4>
            <p><EffectText :text="ability.description" /></p>
          </article>
        </section>

        <section class="bestiary-section">
          <h3>Оружие</h3>
          <div class="bestiary-table-wrap">
            <table class="bestiary-weapons" aria-label="Оружие">
              <thead>
                <tr>
                  <th scope="col">Название</th>
                  <th scope="col">Урон</th>
                  <th scope="col">Эффект</th>
                  <th scope="col">СА</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="weapon in variant.weapons" :key="weapon.name">
                  <td>{{ weapon.name }}</td>
                  <td><RulesText :text="weapon.damage" /></td>
                  <td><EffectText :text="weapon.effect" /></td>
                  <td>{{ weapon.attackCost }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <div class="bestiary-two-col">
          <section class="bestiary-section">
            <h3>Добыча</h3>
            <ul class="bestiary-list">
              <li v-for="loot in variant.loot" :key="loot.name">
                {{ loot.name }}<span v-if="loot.formula"> (<RulesText :text="loot.formula" />)</span>
              </li>
            </ul>
          </section>

          <section class="bestiary-section">
            <h3>Уязвимости</h3>
            <ul class="bestiary-list">
              <li v-for="vulnerability in variant.vulnerabilities" :key="vulnerability.name">
                <strong>{{ vulnerability.name }}</strong>
                <span v-if="vulnerability.description"> — <EffectText :text="vulnerability.description" /></span>
              </li>
            </ul>
          </section>
        </div>

        <section v-if="entry.flavor" class="bestiary-section bestiary-flavor">
          <h3>Описание</h3>
          <p class="bestiary-check"><RulesText :text="entry.flavor.check" /></p>
          <blockquote>
            «{{ entry.flavor.quote }}»
            <cite>{{ entry.flavor.author }}</cite>
          </blockquote>
          <p class="bestiary-check"><RulesText :text="entry.flavor.knowledgeCheck" /></p>
          <p v-for="paragraph in entry.flavor.text" :key="paragraph"><RulesText :text="paragraph" /></p>
        </section>

        <section v-for="note in entry.notes" :key="note.title" class="bestiary-section bestiary-note">
          <h3>{{ note.title }}</h3>
          <p><EffectText :text="note.text" /></p>
        </section>

        <section v-for="table in entry.extraTables" :key="table.title" class="bestiary-section">
          <h3>{{ table.title }}</h3>
          <div class="bestiary-table-wrap">
            <table :aria-label="table.title">
              <thead>
                <tr>
                  <th v-for="column in table.columns" :key="column" scope="col">{{ column }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in table.rows" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex"><RulesText :text="cell" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <p class="bestiary-drawer__source">Источник: {{ sourceLabel }} книги.</p>
      </aside>
    </div>
  </Teleport>
</template>

<style scoped>
.bestiary-drawer {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.bestiary-drawer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(24, 16, 8, 0.48);
  backdrop-filter: blur(2px);
}

.bestiary-drawer__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: min(760px, 100vw);
  padding: 0 1.35rem 2rem;
  overflow-y: auto;
  background: var(--site-surface);
  border-left: 1px solid var(--site-border-strong);
  box-shadow: -18px 0 48px rgba(0, 0, 0, 0.22);
}

.bestiary-drawer__header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin: 0 -1.35rem;
  padding: 1.25rem 1.35rem 1rem;
  background: var(--site-surface);
  border-bottom: 1px solid var(--site-border);
}

.bestiary-drawer__subtitle {
  margin: 0 0 0.35rem;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.bestiary-drawer__title {
  margin: 0;
  padding: 0;
  border: 0;
  font-family: var(--site-serif);
  font-size: 1.6rem;
  line-height: 1.25;
}

.bestiary-drawer__close {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  font-family: var(--site-sans);
  font-size: 1.35rem;
  line-height: 1;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.bestiary-drawer__close:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.bestiary-drawer__close:focus-visible {
  color: var(--site-blood);
  border-color: var(--site-blood);
  outline: 2px solid var(--site-gold);
  outline-offset: 2px;
}

.dark .bestiary-drawer__close:hover,
.dark .bestiary-drawer__close:focus-visible {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.bestiary-variants {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.8rem;
}

.bestiary-variant {
  padding: 0.3rem 0.55rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.bestiary-variant:focus-visible {
  outline: 2px solid var(--site-gold);
  outline-offset: 2px;
}

.bestiary-variant--active {
  color: var(--site-surface);
  background: var(--site-ink);
  border-color: var(--site-ink);
}

.dark .bestiary-variant--active {
  color: var(--site-bg);
  background: var(--site-gold);
  border-color: var(--site-gold);
}

.bestiary-section {
  padding-top: 0.9rem;
  margin-top: 0.9rem;
  border-top: 1px solid var(--site-border);
}

.bestiary-section:first-of-type {
  margin-top: 0.9rem;
}

.bestiary-section h3 {
  margin: 0 0 0.5rem;
  padding: 0;
  border: 0;
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.bestiary-attributes {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 0.25rem;
}

.bestiary-attribute {
  padding: 0.35rem 0.25rem;
  text-align: center;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border);
  border-radius: 3px;
}

.bestiary-attribute span,
.bestiary-derived__item span {
  display: block;
  font-family: var(--site-sans);
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.bestiary-attribute strong {
  display: block;
  font-family: var(--site-serif);
  font-size: 1rem;
}

.bestiary-derived {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.25rem;
  margin-top: 0.35rem;
}

.bestiary-derived__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.3rem;
  padding: 0.3rem 0.4rem;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border);
  border-radius: 3px;
}

.bestiary-derived__item strong {
  font-family: var(--site-serif);
  font-size: 0.9rem;
}

.bestiary-combat {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 0.5rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
}

.bestiary-combat strong {
  color: var(--site-ink);
}

.bestiary-size {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem 0.8rem;
  margin: 0;
}

.bestiary-size div {
  display: grid;
  grid-template-columns: 9rem 1fr;
  gap: 0.4rem;
  padding-bottom: 0.25rem;
  border-bottom: 1px dotted var(--site-border);
}

.bestiary-size dt {
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-muted);
}

.bestiary-size dd {
  margin: 0;
  font-family: var(--site-serif);
  font-size: 12px;
  color: var(--site-ink);
}

.bestiary-skills {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.2rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.bestiary-skills li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.2rem 0;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  border-bottom: 1px solid var(--site-border);
}

.bestiary-skills strong {
  font-family: var(--site-serif);
  color: var(--site-ink);
  white-space: nowrap;
}

.bestiary-ability {
  padding: 0.5rem 0;
  border-top: 1px solid var(--site-border);
}

.bestiary-ability:first-of-type {
  border-top: 0;
  padding-top: 0;
}

.bestiary-ability h4 {
  margin: 0 0 0.2rem;
  font-family: var(--site-serif);
  font-size: 0.95rem;
}

.bestiary-ability p {
  margin: 0;
  font-family: var(--site-serif);
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--site-muted);
}

.bestiary-table-wrap {
  overflow-x: auto;
}

.bestiary-weapons,
.bestiary-section table {
  width: 100%;
  margin: 0;
  border: 0;
  border-collapse: collapse;
  font-size: 11px;
}

.bestiary-weapons tr,
.bestiary-section table tr {
  background: transparent;
  border: 0;
}

.bestiary-weapons tbody tr:nth-child(2n),
.bestiary-section table tbody tr:nth-child(2n) {
  background: transparent;
}

.bestiary-weapons th,
.bestiary-weapons td,
.bestiary-section table th,
.bestiary-section table td {
  padding: 0.3rem 0.4rem;
  text-align: left;
  vertical-align: top;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--site-border);
}

.bestiary-weapons th,
.bestiary-section table th {
  background: var(--site-surface-2);
  border-bottom-color: var(--site-border-strong);
}

.bestiary-weapons tbody tr:nth-child(2n) td,
.bestiary-section table tbody tr:nth-child(2n) td {
  background: transparent;
}

.bestiary-weapons tbody tr:last-child td,
.bestiary-section table tbody tr:last-child td {
  border-bottom: 0;
}

.bestiary-weapons th:last-child,
.bestiary-weapons td:last-child {
  text-align: center;
}

.bestiary-weapons td:nth-child(3) {
  white-space: pre-line;
}

.bestiary-two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.bestiary-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.bestiary-list li {
  padding: 0.25rem 0;
  font-family: var(--site-serif);
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--site-muted);
  border-top: 1px solid var(--site-border);
}

.bestiary-list li:first-child {
  border-top: 0;
}

.bestiary-flavor blockquote {
  margin: 0.6rem 0;
  padding: 0.6rem 0.8rem;
  background: var(--site-surface-2);
  border-left: 3px solid var(--site-gold);
  border-radius: 0 4px 4px 0;
  font-family: var(--site-serif);
  font-size: 13px;
  line-height: 1.6;
  color: var(--site-muted);
}

.bestiary-flavor cite {
  display: block;
  margin-top: 0.35rem;
  font-family: var(--site-sans);
  font-size: 11px;
  font-style: normal;
  text-align: right;
}

.bestiary-check {
  margin: 0.35rem 0;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  color: var(--site-muted);
}

.bestiary-flavor > p:not(.bestiary-check) {
  margin: 0.55rem 0;
  font-family: var(--site-serif);
  font-size: 13px;
  line-height: 1.7;
  color: var(--site-muted);
}

.bestiary-note p {
  margin: 0;
  font-family: var(--site-serif);
  font-size: 12.5px;
  line-height: 1.65;
  color: var(--site-muted);
  white-space: pre-line;
}

.bestiary-drawer__source {
  margin: 1.2rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-muted);
}

@media (max-width: 760px) {
  .bestiary-drawer__panel {
    padding: 0 0.9rem 1.5rem;
  }

  .bestiary-drawer__header {
    margin: 0 -0.9rem;
    padding: 1rem 0.9rem 1rem;
  }

  .bestiary-attributes {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .bestiary-derived {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .bestiary-size,
  .bestiary-skills,
  .bestiary-two-col {
    grid-template-columns: 1fr;
  }

  .bestiary-size div {
    grid-template-columns: 8rem 1fr;
  }
}
</style>
