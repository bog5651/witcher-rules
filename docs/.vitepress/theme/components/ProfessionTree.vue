<script setup lang="ts">
import { ref } from 'vue'
import data from '../../data/profession-trees.json'
import type { ProfessionTree } from '../../schemas/professionTree'

const professions = data.professions as ProfessionTree[]
const active = ref(professions[0]?.id ?? '')
const branchColors = ['blue', 'green', 'red'] as const
</script>

<template>
  <div class="profession-tree">
    <div class="pt-tabs" role="tablist" aria-label="Профессии">
      <button
        v-for="profession in professions"
        :key="profession.id"
        type="button"
        role="tab"
        class="pt-tab"
        :class="{ 'pt-tab--active': active === profession.id }"
        :aria-selected="active === profession.id"
        @click="active = profession.id"
      >
        {{ profession.name }}
      </button>
    </div>

    <section
      v-for="profession in professions"
      v-show="active === profession.id"
      :key="profession.id"
      class="pt-panel"
      role="tabpanel"
    >
      <header class="pt-header">
        <div>
          <p class="pt-kicker">Древо навыков</p>
          <h2>{{ profession.name }}</h2>
        </div>
        <span class="pt-source">Стр. {{ profession.sourcePage }}</span>
      </header>

      <div class="pt-root">
        <span class="pt-root__label">Определяющий навык</span>
        <h3>
          {{ profession.definingSkill.name }}
          <span v-if="profession.definingSkill.attribute">({{ profession.definingSkill.attribute }})</span>
        </h3>
        <p>{{ profession.definingSkill.description }}</p>
      </div>

      <div class="pt-branches">
        <section
          v-for="(branch, branchIndex) in profession.branches"
          :key="branch.name"
          class="pt-branch"
          :class="`pt-branch--${branchColors[branchIndex]}`"
        >
          <h3>{{ branch.name }}</h3>
          <article v-for="ability in branch.abilities" :key="ability.rank" class="pt-ability">
            <div class="pt-ability__head">
              <span class="pt-rank">{{ ability.rank }}</span>
              <h4>
                {{ ability.name }}
                <span v-if="ability.attribute">({{ ability.attribute }})</span>
              </h4>
            </div>
            <p>{{ ability.description }}</p>
          </article>
        </section>
      </div>

      <div v-if="profession.extras.length || profession.notes.length" class="pt-meta">
        <section v-for="extra in profession.extras" :key="extra.title" class="pt-extra">
          <h4>{{ extra.title }}</h4>
          <div class="pt-extra__table">
            <table>
              <thead>
                <tr>
                  <th v-for="column in extra.columns" :key="column">{{ column }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, rowIndex) in extra.rows" :key="rowIndex">
                  <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="profession.notes.length" class="pt-notes">
          <h4>На полях</h4>
          <p v-for="note in profession.notes" :key="note.title">
            <strong>{{ note.title }}.</strong> {{ note.text }}
          </p>
        </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.profession-tree {
  margin-top: 1.5rem;
}

.pt-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--site-border);
}

.pt-tab {
  padding: 0.35rem 0.6rem;
  font-family: var(--site-sans);
  font-size: 12px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.pt-tab:hover {
  color: var(--site-ink);
  border-color: var(--site-border-strong);
}

.pt-tab--active {
  color: var(--site-surface);
  background: var(--site-ink);
  border-color: var(--site-ink);
}

.dark .pt-tab--active {
  color: var(--site-ink);
  background: var(--site-gold);
  border-color: var(--site-gold);
}

.pt-panel {
  padding-top: 1.1rem;
}

.pt-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.pt-kicker {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--site-faint);
}

.pt-header h2 {
  margin: 0.1rem 0 0;
  font-family: var(--site-serif);
  font-size: 1.7rem;
}

.pt-source {
  font-family: var(--site-sans);
  font-size: 11px;
  color: var(--site-faint);
  white-space: nowrap;
}

.pt-root {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border-strong);
  border-radius: 4px;
}

.pt-root__label {
  font-family: var(--site-sans);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--site-faint);
}

.pt-root h3 {
  margin: 0.15rem 0 0.5rem;
  font-family: var(--site-serif);
  font-size: 1.2rem;
}

.pt-root p {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.65;
  color: var(--site-muted);
}

.pt-branches {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
  margin-top: 0.9rem;
}

.pt-branch {
  padding: 0.75rem;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-top: 3px solid var(--site-border-strong);
  border-radius: 4px;
}

.pt-branch--blue {
  border-top-color: #3f628f;
}

.pt-branch--green {
  border-top-color: #4f7d55;
}

.pt-branch--red {
  border-top-color: #9b3a34;
}

.pt-branch > h3 {
  margin: 0 0 0.6rem;
  font-family: var(--site-serif);
  font-size: 1rem;
  text-align: center;
}

.pt-ability {
  padding: 0.55rem 0 0.6rem;
  border-top: 1px solid var(--site-border);
}

.pt-ability:first-of-type {
  border-top: 0;
}

.pt-ability__head {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}

.pt-rank {
  flex: none;
  padding: 0.05rem 0.3rem;
  font-family: var(--site-sans);
  font-size: 10px;
  font-weight: 700;
  color: var(--site-surface);
  background: var(--site-ink);
  border-radius: 3px;
}

.dark .pt-rank {
  color: var(--site-ink);
  background: var(--site-gold);
}

.pt-ability h4 {
  margin: 0;
  font-family: var(--site-serif);
  font-size: 0.95rem;
  line-height: 1.35;
}

.pt-ability h4 span {
  font-family: var(--site-sans);
  font-size: 10px;
  font-weight: 400;
  color: var(--site-faint);
}

.pt-ability p {
  margin: 0.3rem 0 0;
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-muted);
}

.pt-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 0.8rem;
  margin-top: 0.9rem;
}

.pt-extra,
.pt-notes {
  padding: 0.75rem;
  background: var(--site-surface-2);
  border: 1px solid var(--site-border);
  border-radius: 4px;
}

.pt-extra h4,
.pt-notes h4 {
  margin: 0 0 0.45rem;
  font-family: var(--site-serif);
  font-size: 0.95rem;
}

.pt-extra__table {
  overflow-x: auto;
}

.pt-extra table {
  width: 100%;
  margin: 0;
  font-size: 11px;
}

.pt-extra th,
.pt-extra td {
  padding: 0.25rem 0.35rem;
}

.pt-notes p {
  margin: 0 0 0.4rem;
  font-size: 11px;
  line-height: 1.55;
  color: var(--site-muted);
}

.pt-notes p:last-child {
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .pt-branches {
    grid-template-columns: 1fr;
  }
}
</style>
