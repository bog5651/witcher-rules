<script setup lang="ts">
import { computed } from 'vue'
import { effectGlossary, type EffectGlossaryEntry } from '../effectGlossary'
import { useTermTooltip } from '../composables/useTermTooltip'

const props = defineProps<{ text: string }>()
const { show, hide } = useTermTooltip()

interface TextSegment {
  type: 'text'
  value: string
}

interface TermSegment {
  type: 'term'
  value: string
  entry: EffectGlossaryEntry
}

type Segment = TextSegment | TermSegment

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const sortedTerms = [...effectGlossary].sort((a, b) => b.term.length - a.term.length)
const pattern = new RegExp(sortedTerms.map((entry) => escapeRegExp(entry.term)).join('|'), 'g')

const segments = computed<Segment[]>(() => {
  const text = props.text ?? ''
  if (!text) return []

  const result: Segment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    const matched = match[0]
    const entry = sortedTerms.find((item) => item.term === matched)
    if (!entry) continue

    let end = index + matched.length
    if (text[end] === ' ' && text[end + 1] === '(') {
      const close = text.indexOf(')', end + 2)
      if (close !== -1) end = close + 1
    }

    if (index > lastIndex) {
      result.push({ type: 'text', value: text.slice(lastIndex, index) })
    }
    result.push({ type: 'term', value: text.slice(index, end), entry })
    lastIndex = end
  }

  if (lastIndex < text.length) {
    result.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return result
})

const showTerm = (event: Event, entry: EffectGlossaryEntry) => {
  show(event, {
    title: entry.term,
    definition: entry.definition,
    sourcePage: entry.sourcePage
  })
}
</script>

<template>
  <span class="wr-effect-text">
    <template v-for="(segment, index) in segments" :key="index">
      <span v-if="segment.type === 'text'">{{ segment.value }}</span>
      <button
        v-else
        type="button"
        class="wr-term"
        @mouseenter="showTerm($event, segment.entry)"
        @mouseleave="hide"
        @focus="showTerm($event, segment.entry)"
        @blur="hide"
        @click.stop="showTerm($event, segment.entry)"
      >
        {{ segment.value }}
      </button>
    </template>
  </span>
</template>

<style scoped>
.wr-effect-text {
  white-space: pre-line;
}

.wr-term {
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

.wr-term:hover,
.wr-term:focus-visible {
  color: var(--site-blood);
  outline: none;
}

.dark .wr-term:hover,
.dark .wr-term:focus-visible {
  color: var(--site-gold);
}
</style>
