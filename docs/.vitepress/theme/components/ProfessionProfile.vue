<script setup lang="ts">
import { computed } from 'vue'
import data from '../../data/professions.json'
import type { Profession } from '../../schemas/profession'
import EffectText from './EffectText.vue'

const props = defineProps<{ id: string }>()

const professions = data.items as Profession[]

const profile = computed(() => professions.find((item) => item.id === props.id))
const treeHref = computed(() => `/character/trees?profession=${props.id}`)
const hasMagic = computed(() => (profile.value?.magicAbilities.length ?? 0) > 0)
</script>

<template>
  <article v-if="profile" class="profession-profile">
    <header class="pp-quote">
      <span class="pp-source">Стр. {{ profile.sourcePage }}</span>
      <blockquote>«{{ profile.quote }}»</blockquote>
      <cite>{{ profile.quoteAuthor }}</cite>
    </header>

    <div class="pp-summary">
      <section class="pp-summary__item">
        <span class="pp-label">Определяющий навык</span>
        <strong>{{ profile.definingSkill.name }}</strong>
        <span class="pp-attr">({{ profile.definingSkill.attribute }})</span>
      </section>

      <section class="pp-summary__item">
        <span class="pp-label">Энергия</span>
        <strong class="pp-energy">{{ profile.energy }}</strong>
      </section>

      <section class="pp-summary__item">
        <span class="pp-label">Магические способности</span>
        <ul v-if="hasMagic" class="pp-inline">
          <li v-for="ability in profile.magicAbilities" :key="ability">{{ ability }}</li>
        </ul>
        <strong v-else>Нет</strong>
      </section>
    </div>

    <div class="pp-columns">
      <section class="pp-panel">
        <h2>Навыки</h2>
        <ul class="pp-list">
          <li v-for="skill in profile.skills" :key="skill">{{ skill }}</li>
        </ul>

        <div v-if="profile.skillNote" class="pp-note">
          <h3>{{ profile.skillNote.title }}</h3>
          <p><EffectText :text="profile.skillNote.text" /></p>
          <ul class="pp-note-list">
            <li v-for="item in profile.skillNote.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>

      <section class="pp-panel">
        <h2>
          Снаряжение
          <span>(выберите {{ profile.equipment.choose }})</span>
        </h2>
        <ul class="pp-list">
          <li v-for="item in profile.equipment.items" :key="item">{{ item }}</li>
        </ul>

        <div v-if="profile.fixedEquipment" class="pp-fixed">
          <h3>{{ profile.fixedEquipment.title }}</h3>
          <ul class="pp-list">
            <li v-for="item in profile.fixedEquipment.items" :key="item">{{ item }}</li>
          </ul>
        </div>
      </section>
    </div>

    <section class="pp-skill">
      <p class="pp-label">Определяющий навык</p>
      <h2>
        {{ profile.definingSkill.name }}
        <span>({{ profile.definingSkill.attribute }})</span>
      </h2>
      <p><EffectText :text="profile.definingSkill.description" /></p>
    </section>

    <a class="pp-tree" :href="treeHref" :aria-label="`Древо навыков: ${profile.name}`">
      <span>Древо навыков</span>
      <strong>Три ветви и девять способностей</strong>
      <span class="pp-tree__arrow">Открыть →</span>
    </a>
  </article>

  <div v-else class="wr-empty">Профессия не найдена.</div>
</template>

<style scoped>
.profession-profile {
  margin-top: 1.2rem;
}

.pp-quote {
  padding: 1rem 1.15rem;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border);
  border-left: 3px solid var(--site-gold);
  border-radius: 4px;
}

.pp-quote blockquote {
  margin: 0;
  padding: 0;
  background: transparent;
  border: 0;
  border-radius: 0;
  font-family: var(--site-serif);
  font-size: 1.02rem;
  line-height: 1.6;
  color: var(--site-ink);
}

.pp-quote cite {
  display: block;
  margin-top: 0.55rem;
  font-family: var(--site-sans);
  font-size: 12px;
  font-style: normal;
  color: var(--site-muted);
  text-align: right;
}

.pp-source {
  display: block;
  margin-bottom: 0.35rem;
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.pp-summary {
  display: grid;
  grid-template-columns: 1.2fr 0.55fr 1.25fr;
  gap: 0.55rem;
  margin-top: 0.65rem;
}

.pp-summary__item {
  padding: 0.7rem 0.8rem;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.pp-label {
  display: block;
  margin-bottom: 0.25rem;
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.pp-summary strong {
  font-family: var(--site-serif);
  font-size: 1.05rem;
  line-height: 1.3;
  color: var(--site-ink);
}

.pp-attr {
  margin-left: 0.2rem;
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-muted);
}

.pp-energy {
  font-size: 1.6rem !important;
  line-height: 1 !important;
}

.pp-inline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pp-inline li {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
  color: var(--site-muted);
}

.pp-inline li + li {
  margin-top: 0.15rem;
}

.pp-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-top: 0.65rem;
}

.pp-panel {
  padding: 0.8rem 0.9rem;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.pp-panel h2 {
  margin: 0 0 0.45rem;
  padding-top: 0;
  border-top: 0;
  font-family: var(--site-serif);
  font-size: 1.05rem;
}

.pp-panel h2 span {
  font-family: var(--site-sans);
  font-size: 11px;
  font-weight: 400;
  color: var(--site-muted);
}

.pp-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pp-list li {
  margin: 0;
  padding: 0.28rem 0;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.45;
  color: var(--site-muted);
  border-top: 1px solid var(--site-border);
}

.pp-list li:first-child {
  padding-top: 0;
  border-top: 0;
}

.pp-list li:last-child {
  padding-bottom: 0;
}

.pp-note {
  margin-top: 0.7rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--site-border);
}

.pp-note h3,
.pp-fixed h3 {
  margin: 0 0 0.25rem;
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.pp-note p {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.55;
  color: var(--site-muted);
}

.pp-note-list {
  margin: 0.35rem 0 0;
  padding-left: 1rem;
}

.pp-note-list li {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.5;
  color: var(--site-muted);
}

.pp-fixed {
  margin-top: 0.7rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--site-border);
}

.pp-skill {
  margin-top: 0.65rem;
  padding: 1rem 1.1rem;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border-strong);
  border-radius: 4px;
}

.pp-skill h2 {
  margin: 0.1rem 0 0.45rem;
  padding-top: 0;
  border-top: 0;
  font-family: var(--site-serif);
  font-size: 1.35rem;
}

.pp-skill h2 span {
  font-family: var(--site-sans);
  font-size: 12px;
  font-weight: 400;
  color: var(--site-faint);
}

.pp-skill p:last-child {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.7;
  color: var(--site-muted);
}

.pp-tree {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.65rem;
  padding: 0.75rem 0.9rem;
  color: var(--site-ink);
  font-weight: 400;
  text-decoration: none;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.pp-tree:hover {
  color: var(--site-ink);
  border-color: var(--site-gold);
}

.pp-tree > span:first-child {
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--site-muted);
}

.pp-tree strong {
  font-family: var(--site-serif);
  font-size: 0.95rem;
}

.pp-tree__arrow {
  margin-left: auto;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-blood);
  white-space: nowrap;
}

.dark .pp-tree__arrow {
  color: var(--site-gold);
}

@media (max-width: 900px) {
  .pp-summary,
  .pp-columns {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .pp-quote {
    padding: 1rem 0.9rem;
  }

  .pp-tree {
    flex-wrap: wrap;
  }

  .pp-tree__arrow {
    width: 100%;
    margin-left: 0;
  }
}
</style>
