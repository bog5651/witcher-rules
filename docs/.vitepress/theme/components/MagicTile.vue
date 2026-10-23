<script setup lang="ts">
import MagicIcon from './MagicIcon.vue'

defineProps<{
  id: string
  title: string
  kindLabel: string
  tone: string
  metaLabel: string
  tagLabel?: string | null
  tagTitle?: string
  costLabel: string
}>()

defineEmits<{
  open: []
}>()
</script>

<template>
  <button
    :id="id"
    type="button"
    class="magic-tile"
    :class="`magic-tile--${tone}`"
    :aria-label="`${kindLabel}: ${title}. Открыть подробности`"
    aria-haspopup="dialog"
    @click="$emit('open')"
  >
    <span class="magic-tile__top">
      <span class="magic-tile__meta">
        <MagicIcon :type="tone" />
        <span class="magic-tile__meta-label" :title="metaLabel">{{ metaLabel }}</span>
      </span>
      <span v-if="tagLabel" class="magic-tile__tag" :title="tagTitle || tagLabel">
        {{ tagLabel }}
      </span>
    </span>

    <span class="magic-tile__name">{{ title }}</span>

    <span class="magic-tile__cost">{{ costLabel }}</span>
  </button>
</template>

<style scoped>
.magic-tile {
  --magic-color: var(--site-gold);

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.35rem;
  width: 100%;
  min-height: 118px;
  padding: 0.68rem 0.75rem 0.62rem;
  text-align: left;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-top: 2px solid var(--magic-color);
  border-radius: 4px;
  cursor: pointer;
  scroll-margin-top: calc(var(--vp-nav-height) + 1rem);
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    background 0.16s ease;
}

.magic-tile:hover {
  background: color-mix(in srgb, var(--magic-color) 7%, var(--site-surface));
  border-color: color-mix(in srgb, var(--magic-color) 55%, var(--site-border));
  box-shadow: 0 8px 18px rgba(30, 20, 8, 0.1);
  transform: translateY(-2px);
}

.magic-tile:focus-visible {
  outline: 2px solid var(--site-gold);
  outline-offset: 2px;
}

.magic-tile--earth {
  --magic-color: #6f7d4e;
}

.magic-tile--air {
  --magic-color: #5d8190;
}

.magic-tile--fire {
  --magic-color: #a64b35;
}

.magic-tile--water {
  --magic-color: #4d7199;
}

.magic-tile--mixed {
  --magic-color: #8a6b9d;
}

.magic-tile--druid {
  --magic-color: #5f7d4f;
}

.magic-tile--preacher {
  --magic-color: #a47b2f;
}

.magic-tile--archpriest {
  --magic-color: #7a5c8f;
}

.magic-tile__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  min-height: 13px;
}

.magic-tile__meta {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  min-width: 0;
  font-family: var(--site-sans);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.055em;
  line-height: 1.2;
  text-transform: uppercase;
  color: var(--site-faint);
}

.magic-tile__meta :deep(.magic-icon) {
  color: var(--magic-color);
  font-size: 14px;
}

.magic-tile__meta-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.magic-tile__tag {
  flex: 0 1 auto;
  max-width: 88px;
  overflow: hidden;
  padding: 0.08rem 0.28rem;
  font-family: var(--site-sans);
  font-size: 8px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.04em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  color: var(--site-faint);
  background: var(--site-surface-2);
  border: 1px solid var(--site-border);
  border-radius: 2px;
}

.magic-tile__name {
  display: block;
  flex: 1;
  font-family: var(--site-serif);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--site-ink);
  overflow-wrap: break-word;
}

.magic-tile__cost {
  margin-top: auto;
  padding-top: 0.15rem;
  font-family: var(--site-sans);
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: 0.02em;
  color: var(--site-muted);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .magic-tile {
    transition: none;
  }

  .magic-tile:hover {
    transform: none;
  }
}
</style>
