<script setup lang="ts">
import { computed } from 'vue'
import { splitRulesText } from '../../rulesText'

const props = defineProps<{ text?: string | null }>()

const segments = computed(() => splitRulesText(props.text ?? ''))
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
  white-space: nowrap;
}
</style>
