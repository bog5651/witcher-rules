<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import { getBook } from '../../data/books'
import { useItemDrawer } from '../composables/useItemDrawer'
import EffectText from './EffectText.vue'
import RulesText from './RulesText.vue'

const { item, isOpen, close } = useItemDrawer()
const route = useRoute()

const mounted = ref(false)
const panel = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
let previousFocus: HTMLElement | null = null

const descriptionParagraphs = computed(() => {
  return item.value?.description?.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean) ?? []
})

const noteParagraphs = computed(() => {
  return item.value?.note?.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean) ?? []
})

const sourceLine = computed(() => {
  if (!item.value?.sourcePage) return ''
  return `Источник: стр. ${item.value.sourcePage} · ${getBook(item.value.sourceBook).title}`
})

const onKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return

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

watch(isOpen, async (open) => {
  if (open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    await nextTick()
    closeButton.value?.focus()
  } else {
    document.body.style.overflow = ''
    previousFocus?.focus()
    previousFocus = null
  }
})

watch(
  () => route.path,
  () => close()
)

onMounted(() => {
  mounted.value = true
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="drawer">
      <div v-if="item" class="item-drawer">
        <div class="item-drawer__backdrop" @click="close" />

        <aside
          ref="panel"
          class="item-drawer__panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="item-drawer-title"
        >
          <header class="item-drawer__header">
            <div>
              <p v-if="item.subtitle" class="item-drawer__subtitle">{{ item.subtitle }}</p>
              <h2 id="item-drawer-title" class="item-drawer__title">{{ item.title }}</h2>
            </div>
            <button
              ref="closeButton"
              class="item-drawer__close"
              type="button"
              aria-label="Закрыть"
              @click="close"
            >
              ×
            </button>
          </header>

          <dl class="item-drawer__stats">
            <div v-for="stat in item.stats" :key="stat.label" class="item-drawer__stat">
              <dt>{{ stat.label }}</dt>
              <dd>
                <EffectText v-if="stat.label === 'Эффект'" :text="stat.value" />
                <RulesText v-else :text="stat.value || '—'" />
              </dd>
            </div>
          </dl>

          <section v-if="descriptionParagraphs.length" class="item-drawer__description">
            <h3>{{ item.descriptionTitle || 'Описание' }}</h3>
            <p v-for="paragraph in descriptionParagraphs" :key="paragraph">
              <EffectText v-if="item.descriptionTitle === 'Эффект'" :text="paragraph" />
              <RulesText v-else :text="paragraph" />
            </p>
          </section>

          <section v-if="noteParagraphs.length" class="item-drawer__note">
            <h3>{{ item.noteTitle || 'Примечание' }}</h3>
            <p v-for="paragraph in noteParagraphs" :key="paragraph">
              <EffectText :text="paragraph" />
            </p>
          </section>

          <p v-if="sourceLine" class="item-drawer__source">
            {{ sourceLine }}
          </p>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.item-drawer {
  position: fixed;
  inset: 0;
  z-index: 1000;
}

.item-drawer__backdrop {
  position: absolute;
  inset: 0;
  background: rgba(24, 16, 8, 0.48);
  backdrop-filter: blur(2px);
}

.item-drawer__panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: min(460px, 100vw);
  padding: 1.25rem 1.35rem 2rem;
  overflow-y: auto;
  background: var(--site-surface);
  border-left: 1px solid var(--site-border-strong);
  box-shadow: -18px 0 48px rgba(0, 0, 0, 0.22);
}

.item-drawer__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--site-border);
}

.item-drawer__subtitle {
  margin: 0 0 0.35rem;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-faint);
}

.item-drawer__title {
  margin: 0;
  padding: 0;
  border: 0;
  font-family: var(--site-serif);
  font-size: 1.55rem;
  line-height: 1.25;
}

.item-drawer__close {
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

.item-drawer__close:hover,
.item-drawer__close:focus-visible {
  color: var(--site-blood);
  border-color: var(--site-blood);
  outline: none;
}

.dark .item-drawer__close:hover,
.dark .item-drawer__close:focus-visible {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.item-drawer__stats {
  display: grid;
  grid-template-columns: minmax(108px, max-content) 1fr;
  gap: 0.45rem 1rem;
  margin: 1.15rem 0 0;
  padding: 0;
}

.item-drawer__stat {
  display: contents;
}

.item-drawer__stat dt {
  padding-top: 2px;
  font-family: var(--site-sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.5;
  text-transform: uppercase;
  color: var(--site-faint);
}

.item-drawer__stat dd {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 13px;
  line-height: 1.5;
  color: var(--site-ink);
  white-space: pre-line;
}

.item-drawer__description {
  margin-top: 1.35rem;
  padding-top: 1rem;
  border-top: 1px solid var(--site-border);
}

.item-drawer__description h3 {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-faint);
}

.item-drawer__description p {
  margin: 0.65rem 0 0;
  font-family: var(--site-serif);
  font-size: 15px;
  line-height: 1.75;
  color: var(--site-ink);
}

.item-drawer__note {
  margin-top: 1.1rem;
  padding: 0.85rem 0.95rem;
  background: var(--site-surface-2);
  border-left: 3px solid var(--site-gold);
  border-radius: 4px;
}

.item-drawer__note h3 {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-faint);
}

.item-drawer__note p {
  margin: 0.55rem 0 0;
  font-family: var(--site-serif);
  font-size: 14px;
  line-height: 1.7;
  color: var(--site-ink);
}

.item-drawer__source {
  margin: 1.5rem 0 0;
  padding-top: 1.5rem;
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-faint);
}

.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.22s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-active .item-drawer__panel,
.drawer-leave-active .item-drawer__panel {
  transition: transform 0.26s cubic-bezier(0.22, 0.61, 0.36, 1);
}

.drawer-enter-from .item-drawer__panel,
.drawer-leave-to .item-drawer__panel {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .item-drawer__panel {
    width: 100%;
    border-left: 0;
  }
}
</style>
