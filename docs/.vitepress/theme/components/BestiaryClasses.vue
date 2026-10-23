<script setup lang="ts">
import { withBase } from 'vitepress'
import data from '../../data/bestiary.json'
import type { BestiaryClass } from '../../schemas/bestiary'

const classes = data.classes as BestiaryClass[]
const classHref = (id: string) => withBase(`/bestiary/monsters?class=${id}`)
</script>

<template>
  <div class="bestiary-classes">
    <a
      v-for="(item, index) in classes"
      :key="item.id"
      class="bc-card"
      :href="classHref(item.id)"
      :aria-label="`Чудовища класса ${item.name}`"
    >
      <div class="bc-top">
        <span class="bc-num">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="bc-hex" aria-hidden="true" />
      </div>
      <h3>{{ item.name }}</h3>
      <p>{{ item.description }}</p>
      <span class="bc-link">Смотреть чудовищ →</span>
    </a>
  </div>
</template>

<style scoped>
.bestiary-classes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1rem;
}

.bc-card {
  display: flex;
  flex-direction: column;
  padding: 0.9rem 1rem 1rem;
  color: inherit;
  font-weight: 400;
  text-decoration: none;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-top: 3px solid var(--site-gold);
  border-radius: 4px;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.bc-card:hover {
  color: inherit;
  border-color: var(--site-border-strong);
  border-top-color: var(--site-blood);
  box-shadow: 0 6px 18px rgba(42, 33, 24, 0.08);
  transform: translateY(-1px);
}

.dark .bc-card:hover {
  border-top-color: var(--site-gold);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.bc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.bc-num {
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--site-muted);
}

.bc-hex {
  width: 12px;
  height: 13px;
  background: var(--site-gold);
  clip-path: polygon(50% 0, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
}

.bc-card h3 {
  margin: 0.2rem 0 0.35rem;
  font-family: var(--site-serif);
  font-size: 1.1rem;
  line-height: 1.3;
}

.bc-card p {
  margin: 0;
  font-family: var(--site-serif);
  font-size: 13.5px;
  line-height: 1.65;
  color: var(--site-muted);
}

.bc-link {
  margin-top: auto;
  padding-top: 0.6rem;
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-blood);
}

.dark .bc-link {
  color: var(--site-gold);
}

@media (max-width: 1000px) {
  .bestiary-classes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .bestiary-classes {
    grid-template-columns: 1fr;
  }
}
</style>
