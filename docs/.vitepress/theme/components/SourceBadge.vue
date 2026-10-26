<script setup lang="ts">
import { computed } from 'vue'
import { getBook } from '../../data/books'
import { useTermTooltip } from '../composables/useTermTooltip'

const props = defineProps<{
  book?: string | null
  page?: number | null
  compact?: boolean
  static?: boolean
}>()

const tag = computed(() => (props.static ? 'span' : 'button'))
const meta = computed(() => getBook(props.book))
const label = computed(() => {
  if (!props.page) return meta.value.short
  return `${meta.value.short} ${props.page}`
})
const aria = computed(() => {
  if (!props.page) return meta.value.title
  return `${meta.value.title}, стр. ${props.page}`
})

const { show, hide } = useTermTooltip()

const open = (event: Event) => {
  show(event, {
    title: meta.value.short,
    definition: meta.value.title,
    sourcePage: props.page ?? undefined,
    sourceBook: meta.value.id
  })
}
</script>

<template>
  <component
    :is="tag"
    :type="tag === 'button' ? 'button' : undefined"
    class="wr-source"
    :class="{ 'wr-source--external': meta.id !== 'witcher-core', 'wr-source--compact': compact }"
    :title="aria"
    :aria-label="aria"
    @mouseenter="open"
    @mouseleave="hide"
    @focus="open"
    @blur="hide"
    @click.stop
  >
    {{ label }}
  </component>
</template>

<style scoped>
.wr-source {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  padding: 0.1rem 0.28rem;
  font-family: var(--site-sans);
  font-size: 9px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.03em;
  white-space: nowrap;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 3px;
  cursor: help;
  vertical-align: 1px;
  margin-left: 0.25rem;
}

.wr-source:hover,
.wr-source:focus-visible {
  color: var(--site-blood);
  border-color: color-mix(in srgb, var(--site-blood) 55%, var(--site-border));
  outline: none;
}

.dark .wr-source:hover,
.dark .wr-source:focus-visible {
  color: var(--site-gold);
  border-color: color-mix(in srgb, var(--site-gold) 55%, var(--site-border));
}

.wr-source--external {
  color: var(--site-gold);
  border-color: color-mix(in srgb, var(--site-gold) 45%, var(--site-border));
  background: color-mix(in srgb, var(--site-gold) 7%, transparent);
}

.wr-source--external:hover,
.wr-source--external:focus-visible {
  color: var(--site-blood);
}

.dark .wr-source--external:hover,
.dark .wr-source--external:focus-visible {
  color: var(--site-gold);
}

.wr-source--compact {
  padding: 0;
  font-size: 8px;
  border: 0;
  opacity: 0.8;
}
</style>
