<script setup lang="ts">
import { computed } from 'vue'
import { splitRulesText } from '../../rulesText'

const props = defineProps<{ text?: string | number | null }>()

const segments = computed(() => splitRulesText(String(props.text ?? '')))
</script>

<template>
  <span class="wr-rules-text">
    <template v-for="(segment, index) in segments" :key="index">
      <code v-if="segment.type === 'dice'" class="wr-dice">{{ segment.value }}</code>
      <template v-else>{{ segment.value }}</template>
    </template>
  </span>
</template>

<style scoped>
.wr-rules-text {
  white-space: pre-line;
}

.wr-dice {
  display: inline-block;
  padding: 0.02rem 0.3rem;
  font-family: var(--site-sans);
  font-size: 0.92em;
  font-weight: 600;
  line-height: 1.2;
  color: inherit;
  white-space: nowrap;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border-strong);
  border-radius: 4px;
}
</style>
