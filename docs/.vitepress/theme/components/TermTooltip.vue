<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTermTooltip } from '../composables/useTermTooltip'

const { active, hide } = useTermTooltip()
const mounted = ref(false)

const style = computed(() => {
  if (!active.value) return {}

  const gap = 8
  const compact = !active.value.definition && !active.value.sourcePage
  const compactWidth = Math.min(
    160,
    Math.max(64, active.value.title.length * 7 + 22)
  )
  const maxWidth = compact ? compactWidth : 340
  const width = Math.min(maxWidth, window.innerWidth - 16)
  let left = active.value.left + active.value.width / 2 - width / 2
  left = Math.max(8, Math.min(left, window.innerWidth - width - 8))

  const estimatedHeight = compact ? 40 : 150
  let top = active.value.top + active.value.height + gap
  if (top + estimatedHeight > window.innerHeight - 8) {
    top = Math.max(8, active.value.top - estimatedHeight - gap)
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`
  }
})

const isCompact = computed(
  () => !!active.value && !active.value.definition && !active.value.sourcePage
)

const onPointerDown = (event: PointerEvent) => {
  const target = event.target
  if (target instanceof Element && target.closest('.wr-term')) return
  hide()
}

onMounted(() => {
  mounted.value = true
  window.addEventListener('scroll', hide, true)
  window.addEventListener('resize', hide)
  document.addEventListener('pointerdown', onPointerDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', hide, true)
  window.removeEventListener('resize', hide)
  document.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <Transition name="term-tip">
      <div
        v-if="active"
        id="term-tooltip"
        class="term-tooltip"
        :class="{ 'term-tooltip--compact': isCompact }"
        role="tooltip"
        :style="style"
      >
        <p class="term-tooltip__term">{{ active.title }}</p>
        <p v-if="active.definition" class="term-tooltip__definition">
          <RulesText :text="active.definition" />
        </p>
        <p v-if="active.sourcePage" class="term-tooltip__source">
          Стр. {{ active.sourcePage }} книги.
        </p>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.term-tooltip {
  position: fixed;
  z-index: 1100;
  padding: 0.7rem 0.8rem;
  background: var(--site-surface);
  border: 1px solid var(--site-border-strong);
  border-radius: 5px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.term-tooltip__term {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--site-faint);
}

.term-tooltip--compact {
  padding: 0.25rem 0.4rem;
}

.term-tooltip--compact .term-tooltip__term {
  font-size: 10px;
  letter-spacing: 0.03em;
  color: var(--site-ink);
  white-space: nowrap;
  text-align: center;
}

.term-tooltip__definition {
  margin: 0.4rem 0 0;
  font-family: var(--site-serif);
  font-size: 14px;
  line-height: 1.6;
  color: var(--site-ink);
}

.term-tooltip__source {
  margin: 0.45rem 0 0;
  font-family: var(--site-sans);
  font-size: 10px;
  color: var(--site-faint);
}

.term-tip-enter-active,
.term-tip-leave-active {
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.term-tip-enter-from,
.term-tip-leave-to {
  opacity: 0;
  transform: translateY(2px);
}
</style>
