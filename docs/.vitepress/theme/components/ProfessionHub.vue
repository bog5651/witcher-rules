<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import data from '../../data/professions.json'
import type { Profession } from '../../schemas/profession'
import ProfessionProfile from './ProfessionProfile.vue'

const professions = data.items as Profession[]
const active = ref(professions[0]?.id ?? '')

const selectTab = (id: string) => {
  active.value = id

  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href)
    url.searchParams.set('profession', id)
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`)
  }
}

const syncFromUrl = () => {
  const requested = new URLSearchParams(window.location.search).get('profession')
  if (requested && professions.some((profession) => profession.id === requested)) {
    active.value = requested
  }
}

const focusTab = (index: number) => {
  const profession = professions[index]
  if (!profession) return
  selectTab(profession.id)
  document.getElementById(`ph-tab-${profession.id}`)?.focus()
}

const onTabKeydown = (event: KeyboardEvent, index: number) => {
  let next = index

  if (event.key === 'ArrowRight') next = (index + 1) % professions.length
  else if (event.key === 'ArrowLeft') next = (index - 1 + professions.length) % professions.length
  else if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = professions.length - 1
  else return

  event.preventDefault()
  focusTab(next)
}

onMounted(() => {
  syncFromUrl()
  window.addEventListener('popstate', syncFromUrl)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', syncFromUrl)
})
</script>

<template>
  <div class="profession-hub">
    <div class="ph-tabs" role="tablist" aria-label="Профессии">
      <button
        v-for="(profession, index) in professions"
        :id="`ph-tab-${profession.id}`"
        :key="profession.id"
        type="button"
        role="tab"
        class="ph-tab"
        :class="{ 'ph-tab--active': active === profession.id }"
        :aria-selected="active === profession.id"
        :aria-controls="`ph-panel-${profession.id}`"
        :tabindex="active === profession.id ? 0 : -1"
        @click="selectTab(profession.id)"
        @keydown="onTabKeydown($event, index)"
      >
        {{ profession.name }}
      </button>
    </div>

    <section
      v-for="profession in professions"
      v-show="active === profession.id"
      :id="`ph-panel-${profession.id}`"
      :key="profession.id"
      class="ph-panel"
      role="tabpanel"
      :aria-labelledby="`ph-tab-${profession.id}`"
    >
      <ProfessionProfile :id="profession.id" />
    </section>
  </div>
</template>

<style scoped>
.profession-hub {
  margin-top: 1.5rem;
}

.ph-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--site-border);
}

.ph-tab {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.ph-tab:hover {
  color: var(--site-ink);
  border-color: var(--site-border-strong);
}

.ph-tab--active {
  color: var(--site-ink);
  background: var(--site-surface-2);
  border-color: var(--site-gold);
}

.ph-tab:focus-visible {
  outline: 2px solid var(--site-gold);
  outline-offset: 2px;
}

.ph-panel {
  outline: none;
}
</style>
