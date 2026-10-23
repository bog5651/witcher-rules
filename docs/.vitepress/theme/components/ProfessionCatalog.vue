<script setup lang="ts">
import data from '../../data/professions.json'
import type { Profession } from '../../schemas/profession'

const professions = data.items as Profession[]

const magicLabel = (profession: Profession) => {
  if (profession.magicAbilities.length === 0) return 'Без магии'
  return profession.magicAbilities.join(' · ')
}
</script>

<template>
  <div class="profession-catalog">
    <a
      v-for="(profession, index) in professions"
      :key="profession.id"
      class="pc-card"
      :href="`/professions/${profession.id}`"
      :aria-labelledby="`pc-title-${profession.id}`"
    >
      <div class="pc-top">
        <span class="pc-num">{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="pc-energy">Энергия {{ profession.energy }}</span>
      </div>

      <h3 :id="`pc-title-${profession.id}`">{{ profession.name }}</h3>

      <p class="pc-skill">
        {{ profession.definingSkill.name }}
        <span>({{ profession.definingSkill.attribute }})</span>
      </p>

      <p class="pc-magic">{{ magicLabel(profession) }}</p>
      <span class="pc-link">Открыть профессию →</span>
    </a>
  </div>
</template>

<style scoped>
.profession-catalog {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
  margin-top: 1rem;
}

.pc-card {
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

.pc-card:hover {
  color: inherit;
  border-color: var(--site-border-strong);
  border-top-color: var(--site-blood);
  box-shadow: 0 6px 18px rgba(42, 33, 24, 0.08);
  transform: translateY(-1px);
}

.dark .pc-card:hover {
  border-top-color: var(--site-gold);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
}

.pc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.pc-num {
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--site-muted);
}

.pc-energy {
  font-family: var(--site-sans);
  font-size: 10px;
  color: var(--site-muted);
  white-space: nowrap;
}

.pc-card h3 {
  margin: 0.25rem 0 0.1rem;
  font-family: var(--site-serif);
  font-size: 1.2rem;
  line-height: 1.3;
}

.pc-skill {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: var(--site-muted);
}

.pc-skill span {
  color: var(--site-muted);
}

.pc-magic {
  margin: 0.45rem 0 0;
  font-family: var(--site-sans);
  font-size: 10.5px;
  line-height: 1.45;
  color: var(--site-muted);
}

.pc-link {
  margin-top: auto;
  padding-top: 0.65rem;
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-blood);
}

.dark .pc-link {
  color: var(--site-gold);
}

@media (max-width: 1000px) {
  .profession-catalog {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .profession-catalog {
    grid-template-columns: 1fr;
  }
}
</style>
