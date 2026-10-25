<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/critical-injuries.json'
import type { CriticalInjury } from '../../schemas/criticalInjury'

const items = data.items as CriticalInjury[]

const severityLabels = {
  light: 'Лёгкие',
  medium: 'Средние',
  heavy: 'Тяжёлые',
  deadly: 'Смертельные'
} as const

const severityOrder = ['light', 'medium', 'heavy', 'deadly'] as const

const severity = ref<CriticalInjury['severity']>('light')

const rollRank: Record<string, number> = {
  '2-3': 0,
  '4-5': 1,
  '6-8': 2,
  '9-10': 3,
  '11': 4,
  '12': 5
}

const visible = computed(() =>
  items
    .filter((item) => item.severity === severity.value)
    .sort((a, b) => (rollRank[a.roll] ?? 99) - (rollRank[b.roll] ?? 99))
)

const countFor = (key: CriticalInjury['severity']) =>
  items.filter((item) => item.severity === key).length
</script>

<template>
  <div class="injury-catalog">
    <div class="injury-tabs" role="tablist" aria-label="Уровень критического ранения">
      <button
        v-for="key in severityOrder"
        :key="key"
        type="button"
        role="tab"
        class="injury-tab"
        :class="{ 'injury-tab--active': severity === key }"
        :aria-selected="severity === key"
        @click="severity = key"
      >
        {{ severityLabels[key] }}
        <span class="injury-tab__count">{{ countFor(key) }}</span>
      </button>
    </div>

    <p class="injury-note">
      Если при броске выпало <strong>1</strong>, критическое ранение не наносится — применяется
      только дополнительный урон за уровень критического ранения.
    </p>

    <div class="injury-list">
      <article v-for="injury in visible" :key="injury.id" class="injury-card">
        <header class="injury-card__header">
          <span class="injury-card__roll"><RulesText text="2d6" />: {{ injury.roll }}</span>
          <h3>{{ injury.name }}</h3>
        </header>

        <p class="injury-card__effect"><RulesText :text="injury.effect" /></p>

        <div class="injury-card__after">
          <div>
            <h4>После стабилизации</h4>
            <p><RulesText :text="injury.stabilized" /></p>
          </div>
          <div>
            <h4>После лечения</h4>
            <p><RulesText :text="injury.healed" /></p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.injury-catalog {
  margin-top: 1.5rem;
}

.injury-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.injury-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.65rem;
  font-family: var(--site-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.injury-tab:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .injury-tab:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.injury-tab--active,
.injury-tab--active:hover {
  color: #fff8ea;
  background: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .injury-tab--active,
.dark .injury-tab--active:hover {
  color: #171310;
  background: var(--site-gold);
  border-color: var(--site-gold);
}

.injury-tab__count {
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  opacity: 0.75;
}

.injury-note {
  margin: 0 0 0.85rem;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.6;
  color: var(--site-faint);
}

.injury-list {
  display: grid;
  gap: 0.7rem;
}

.injury-card {
  padding: 0.9rem 1rem;
  background: var(--site-surface);
  border: 1px solid var(--site-border);
  border-radius: 5px;
}

.injury-card__header {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.injury-card__roll {
  padding: 0.12rem 0.4rem;
  font-family: var(--site-sans);
  font-size: 10px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--site-blood);
  background: var(--site-blood-soft);
  border-radius: 3px;
  white-space: nowrap;
}

.dark .injury-card__roll {
  color: var(--site-gold);
  background: var(--site-gold-soft);
}

.injury-card h3 {
  margin: 0;
  padding: 0;
  border: 0;
  font-family: var(--site-serif);
  font-size: 1.05rem;
  line-height: 1.35;
}

.injury-card__effect {
  margin: 0.55rem 0 0;
  font-family: var(--site-serif);
  font-size: 14px;
  line-height: 1.65;
  color: var(--site-ink);
}

.injury-card__after {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.75rem;
  padding-top: 0.7rem;
  border-top: 1px solid var(--site-border);
}

.injury-card__after h4 {
  margin: 0;
  font-family: var(--site-sans);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--site-faint);
}

.injury-card__after p {
  margin: 0.25rem 0 0;
  font-family: var(--site-sans);
  font-size: 12px;
  line-height: 1.55;
  color: var(--site-muted);
}

@media (max-width: 640px) {
  .injury-card__after {
    grid-template-columns: 1fr;
  }
}
</style>
