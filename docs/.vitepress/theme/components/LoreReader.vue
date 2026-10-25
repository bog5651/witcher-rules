<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

interface SectionState {
  id: string
  title: string
  open: boolean
}

const root = ref<HTMLElement | null>(null)
const sections = ref<SectionState[]>([])
const openStates = ref<Record<string, boolean>>({})
const bodies = new Map<string, HTMLElement>()
const headers = new Map<string, HTMLElement>()
let docEl: HTMLElement | null = null

const setOpen = (id: string, open: boolean) => {
  const body = bodies.get(id)
  const header = headers.get(id)
  if (!body || !header) return
  body.hidden = !open
  header.setAttribute('aria-expanded', String(open))
  openStates.value = { ...openStates.value, [id]: open }
  const state = sections.value.find((item) => item.id === id)
  if (state) state.open = open
}

const toggle = (id: string) => {
  setOpen(id, !openStates.value[id])
}

const openSection = (id: string) => {
  setOpen(id, true)
  headers.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const expandAll = () => {
  for (const section of sections.value) setOpen(section.id, true)
}

const collapseAll = () => {
  for (const section of sections.value) setOpen(section.id, false)
}

const openFromHash = () => {
  const hash = decodeURIComponent(window.location.hash.slice(1))
  if (!hash) return
  const target = document.getElementById(hash)
  if (!target) return

  const section = target.closest('.lore-section')
  const sectionBody = section?.querySelector('.lore-section__body') as HTMLElement | null
  if (sectionBody?.dataset.sectionId) {
    setOpen(sectionBody.dataset.sectionId, true)
    return
  }

  let current: HTMLElement | null = target
  while (current && current !== docEl) {
    if (current.classList.contains('lore-section__body')) {
      const id = current.dataset.sectionId
      if (id) setOpen(id, true)
      break
    }
    current = current.parentElement
  }
}

const build = async () => {
  await nextTick()
  const rootEl = root.value
  docEl =
    (rootEl?.closest('[data-pagefind-body]') as HTMLElement | null) ??
    (rootEl?.closest('.vp-doc') as HTMLElement | null) ??
    null
  if (!rootEl || !docEl) return
  if (docEl.querySelector(':scope > .lore-section')) return

  const children = Array.from(docEl.children)
  const headings = children.filter(
    (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === 'H2'
  )
  if (!headings.length) return

  const nextSections: SectionState[] = []
  docEl.insertBefore(rootEl, headings[0])

  headings.forEach((heading, index) => {
    const title = heading.textContent?.replace(/\u200b/g, '').trim() || `Раздел ${index + 1}`
    const id = heading.id || `lore-${index + 1}`
    heading.id = id

    const section = document.createElement('section')
    section.className = 'lore-section'

    const header = document.createElement('div')
    header.className = 'lore-section__header'
    header.setAttribute('role', 'button')
    header.setAttribute('tabindex', '0')
    header.setAttribute('aria-expanded', 'false')

    const counter = document.createElement('span')
    counter.className = 'lore-section__index'
    counter.textContent = String(index + 1).padStart(2, '0')

    const chevron = document.createElement('span')
    chevron.className = 'lore-section__chevron'
    chevron.setAttribute('aria-hidden', 'true')

    const body = document.createElement('div')
    body.className = 'lore-section__body'
    body.dataset.sectionId = id
    body.hidden = true

    const firstBodyNode = heading.nextSibling
    docEl!.insertBefore(section, heading)
    header.appendChild(counter)
    header.appendChild(heading)
    header.appendChild(chevron)
    section.appendChild(header)
    section.appendChild(body)

    let node = firstBodyNode
    while (node && node !== headings[index + 1]) {
      const next = node.nextSibling
      if (node !== rootEl) body.appendChild(node)
      node = next
    }

    header.addEventListener('click', () => toggle(id))
    header.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        toggle(id)
      }
    })
    bodies.set(id, body)
    headers.set(id, header)
    nextSections.push({ id, title, open: false })
  })

  sections.value = nextSections
  openStates.value = Object.fromEntries(nextSections.map((section) => [section.id, false]))
  openFromHash()
}

onMounted(() => {
  build()
  window.addEventListener('hashchange', openFromHash)
})

onBeforeUnmount(() => {
  window.removeEventListener('hashchange', openFromHash)
})
</script>

<template>
  <div ref="root" class="lore-reader" :class="{ 'lore-reader--empty': !sections.length }">
    <div v-if="sections.length" class="lore-toolbar">
      <div class="lore-toolbar__chips" role="list">
        <button
          v-for="section in sections"
          :key="section.id"
          type="button"
          class="lore-chip"
          :class="{ 'lore-chip--active': section.open }"
          role="listitem"
          @click="openSection(section.id)"
        >
          {{ section.title }}
        </button>
      </div>
      <div class="lore-toolbar__actions">
        <button type="button" class="lore-action" @click="expandAll">Развернуть всё</button>
        <button type="button" class="lore-action" @click="collapseAll">Свернуть всё</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lore-reader {
  margin: 1.5rem 0 0.5rem;
}

.lore-reader--empty {
  margin: 0;
}

.lore-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem 1rem;
  padding: 0.75rem 0.85rem;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.lore-toolbar__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  min-width: 0;
}

.lore-chip {
  padding: 0.25rem 0.5rem;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.3;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 3px;
  cursor: pointer;
}

.lore-chip:hover,
.lore-chip:focus-visible,
.lore-chip--active {
  color: var(--site-ink);
  background: var(--site-gold-soft);
  border-color: color-mix(in srgb, var(--site-gold) 45%, var(--site-border));
  outline: none;
}

.lore-toolbar__actions {
  display: inline-flex;
  flex: 0 0 auto;
  gap: 0.3rem;
}

.lore-action {
  padding: 0.25rem 0.5rem;
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 3px;
  cursor: pointer;
}

.lore-action:hover,
.lore-action:focus-visible {
  color: var(--site-blood);
  border-color: var(--site-blood);
  outline: none;
}

.dark .lore-action:hover,
.dark .lore-action:focus-visible {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

@media (max-width: 720px) {
  .lore-toolbar {
    flex-direction: column;
  }

  .lore-toolbar__actions {
    width: 100%;
  }

  .lore-action {
    flex: 1;
  }
}
</style>

<style>
.lore-section {
  margin-top: 0.65rem;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  background: var(--site-surface);
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
}

.lore-section__header {
  display: flex;
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
  align-items: center;
  gap: 0.65rem;
  width: 100%;
  padding: 0.7rem 0.85rem;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.lore-section__header:hover {
  background: var(--site-gold-soft);
}

.lore-section__header:focus-visible {
  outline: 2px solid var(--site-gold);
  outline-offset: -2px;
}

.lore-section__index {
  flex: 0 0 auto;
  font-family: var(--site-sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--site-faint);
}

.lore-section__header .header-anchor {
  display: none;
}

.lore-section__header h2 {
  flex: 1;
  margin: 0;
  padding: 0;
  border: 0;
  font-family: var(--site-serif);
  font-size: 1.12rem;
  line-height: 1.3;
  color: var(--site-ink);
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
}

.lore-section__chevron {
  position: relative;
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  color: var(--site-muted);
}

.lore-section__chevron::before,
.lore-section__chevron::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.7rem;
  height: 1px;
  content: '';
  background: currentColor;
  transform: translate(-50%, -50%);
  transition: transform 0.16s ease;
}

.lore-section__chevron::after {
  transform: translate(-50%, -50%) rotate(90deg);
}

.lore-section__header[aria-expanded='true'] .lore-section__chevron::after {
  transform: translate(-50%, -50%) rotate(0deg);
}

.lore-section__body {
  padding: 0 0.85rem 0.85rem;
  border-top: 1px solid var(--site-border);
}

.lore-section__body > :first-child {
  margin-top: 0.85rem;
}

.lore-section__body[hidden] {
  display: none;
}

@media (max-width: 720px) {
  .lore-section__header {
    align-items: flex-start;
  }
}
</style>
