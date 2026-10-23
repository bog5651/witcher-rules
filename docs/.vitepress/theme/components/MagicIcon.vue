<script setup lang="ts">
defineProps<{
  type: string
  label?: string
}>()
</script>

<template>
  <svg
    class="magic-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
    :role="label ? 'img' : undefined"
  >
    <template v-if="type === 'fire'">
      <path d="M13.2 2.8c.4 2.5.2 4.3-.7 5.8-.7 1.2-1.7 1.8-2.6 1.8-1.2 0-1.9-.9-2-2.4C6 10 5 12 5 14.1A7 7 0 0 0 12 21a7 7 0 0 0 7-7c0-4.3-3-7.5-5.8-11.2Z" />
    </template>
    <template v-else-if="type === 'water'">
      <path d="M12 3.2S6 9.2 6 13.1a6 6 0 0 0 12 0C18 9.2 12 3.2 12 3.2Z" />
      <path d="M9.2 14.2c.2 1.7 1.3 2.7 2.9 2.9" />
    </template>
    <template v-else-if="type === 'air'">
      <path d="M3.5 8.5h9.2a2.8 2.8 0 1 0-2.8-2.8" />
      <path d="M3.5 12h13a2.8 2.8 0 1 1-2.8 2.8" />
      <path d="M3.5 15.5h6" />
    </template>
    <template v-else-if="type === 'earth'">
      <path d="m3.5 19 6.2-11 3.3 5.5 2-2.7L20.5 19h-17Z" />
      <path d="m8.4 11.5 1.3 1.9" />
    </template>
    <template v-else-if="type === 'druid'">
      <path d="M20 4C10.5 4 4 8.7 4 15c0 3 2 5 5 5 6.4 0 11-6.7 11-16Z" />
      <path d="M4 20c3.2-5.8 7.1-9 13-11.2" />
    </template>
    <template v-else-if="type === 'preacher'">
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
    </template>
    <template v-else-if="type === 'archpriest'">
      <path d="m4 18 1.7-9 4.1 3.7L12 6l2.2 6.7L18.3 9 20 18H4Z" />
      <path d="M5 21h14" />
    </template>
    <template v-else-if="type === 'ritual'">
      <circle cx="12" cy="12" r="7.5" />
      <path d="m12 5.8 1.7 4.5 4.5 1.7-4.5 1.7-1.7 4.5-1.7-4.5L5.8 12l4.5-1.7L12 5.8Z" />
    </template>
    <template v-else-if="type === 'hex'">
      <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2" />
    </template>
    <template v-else>
      <path d="m12 2.5 1.7 6.3 6.3 1.7-6.3 1.7-1.7 6.3-1.7-6.3L4 10.5l6.3-1.7L12 2.5Z" />
    </template>
  </svg>
</template>

<style scoped>
.magic-icon {
  width: 1em;
  height: 1em;
  flex: 0 0 auto;
  vertical-align: -0.12em;
}
</style>
