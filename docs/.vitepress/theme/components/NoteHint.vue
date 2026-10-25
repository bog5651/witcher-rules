<script setup lang="ts">
import { useTermTooltip } from '../composables/useTermTooltip'

const props = defineProps<{
  text: string
  definition: string
  title?: string
  sourcePage?: number
  sourceBook?: string
}>()

const { show, hide } = useTermTooltip()

const open = (event: Event) => {
  show(event, {
    title: props.title ?? props.text,
    definition: props.definition,
    sourcePage: props.sourcePage,
    sourceBook: props.sourceBook
  })
}
</script>

<template>
  <button
    type="button"
    class="wr-note"
    @mouseenter="open"
    @mouseleave="hide"
    @focus="open"
    @blur="hide"
    @click.stop="open"
  >
    {{ text }}
  </button>
</template>

<style scoped>
.wr-note {
  display: inline;
  padding: 0;
  font: inherit;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  border-bottom: 1px dotted currentColor;
  cursor: help;
}

.wr-note:hover,
.wr-note:focus-visible {
  color: var(--site-blood);
  outline: none;
}

.dark .wr-note:hover,
.dark .wr-note:focus-visible {
  color: var(--site-gold);
}
</style>
