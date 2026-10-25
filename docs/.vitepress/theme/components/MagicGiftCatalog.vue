<script setup lang="ts">
import { computed, ref } from 'vue'
import data from '../../data/magic-gifts.json'
import type { MagicGift, MagicGiftTier } from '../../schemas/magicGift'
import MagicTile from './MagicTile.vue'
import { useItemDrawer } from '../composables/useItemDrawer'

const gifts = data.items as MagicGift[]
const { open } = useItemDrawer()

const tierLabels: Record<MagicGiftTier, string> = {
  minor: 'Малый дар',
  major: 'Большой дар'
}

const tierShort: Record<MagicGiftTier, string> = {
  minor: 'Малый',
  major: 'Большой'
}

const query = ref('')
const tier = ref<'all' | MagicGiftTier>('all')
const sort = ref<'name' | 'tier' | 'cost'>('tier')

const normalized = (value: string) => value.toLocaleLowerCase('ru').replace(/ё/g, 'е')

const baseCount = computed(
  () => gifts.filter((gift) => tier.value === 'all' || gift.tier === tier.value).length
)

const visible = computed(() => {
  const q = normalized(query.value.trim())
  return gifts
    .filter((gift) => {
      if (tier.value !== 'all' && gift.tier !== tier.value) return false
      if (!q) return true
      return normalized([gift.name, gift.effect, gift.sideEffect].join(' ')).includes(q)
    })
    .sort((a, b) => {
      if (sort.value === 'name') return a.name.localeCompare(b.name, 'ru')
      if (sort.value === 'cost') return a.cost - b.cost || a.name.localeCompare(b.name, 'ru')
      return a.tier === b.tier
        ? a.name.localeCompare(b.name, 'ru')
        : a.tier === 'minor'
          ? -1
          : 1
    })
})

const reset = () => {
  query.value = ''
  tier.value = 'all'
  sort.value = 'tier'
}

const costLabel = (gift: MagicGift) => {
  if (gift.castDC) return `${gift.cost} Вын · СЛ ${gift.castDC}`
  return `${gift.cost} Вын · без проверки`
}

const openGift = (gift: MagicGift) => {
  open({
    title: gift.name,
    subtitle: `Магический дар · ${tierLabels[gift.tier]}`,
    stats: [
      { label: 'Уровень', value: tierLabels[gift.tier] },
      { label: 'Затраты', value: `${gift.cost} Вын` },
      { label: 'СЛ сотворения', value: gift.castDC ? String(gift.castDC) : 'Не требуется' },
      { label: 'Побочный эффект', value: gift.sideEffect }
    ],
    description: gift.effect,
    descriptionTitle: 'Эффект',
    sourcePage: gift.sourcePage,
    sourceBook: gift.sourceBook
  })
}
</script>

<template>
  <div class="gift-catalog">
    <div class="wr-toolbar">
      <div class="wr-field wr-field--grow">
        <label for="gift-query">Поиск</label>
        <input
          id="gift-query"
          v-model="query"
          class="wr-input"
          type="search"
          placeholder="Название, эффект или побочный эффект…"
          autocomplete="off"
        />
      </div>

      <div class="wr-field">
        <label for="gift-tier">Уровень</label>
        <select id="gift-tier" v-model="tier" class="wr-select">
          <option value="all">Все</option>
          <option value="minor">Малые</option>
          <option value="major">Большие</option>
        </select>
      </div>

      <div class="wr-field">
        <label for="gift-sort">Сортировка</label>
        <select id="gift-sort" v-model="sort" class="wr-select">
          <option value="tier">По уровню</option>
          <option value="name">По названию</option>
          <option value="cost">По затратам</option>
        </select>
      </div>

      <button class="gift-reset" type="button" @click="reset">Сбросить</button>
      <span class="wr-count">{{ visible.length }} из {{ baseCount }}</span>
    </div>

    <p v-if="visible.length" class="gift-hint">
      Нажмите на карточку, чтобы открыть эффект и побочный эффект.
    </p>

    <div v-if="visible.length" class="magic-tile-grid">
      <MagicTile
        v-for="gift in visible"
        :id="`gift-${gift.id}`"
        :key="gift.id"
        :title="gift.name"
        kind-label="Магический дар"
        tone="gift"
        :meta-label="tierLabels[gift.tier]"
        :tag-label="tierShort[gift.tier]"
        :cost-label="costLabel(gift)"
        :source-book="gift.sourceBook"
        :source-page="gift.sourcePage"
        @open="openGift(gift)"
      />
    </div>

    <div v-else class="wr-empty">
      Ничего не нашлось. Попробуйте изменить запрос или сбросить фильтры.
    </div>

    <div v-if="visible.length" class="gift-search-index" aria-hidden="true">
      <p v-for="gift in visible" :key="`search-${gift.id}`">
        <RulesText :text="[gift.name, gift.effect, gift.sideEffect].join(' ')" />
      </p>
    </div>
  </div>
</template>

<style scoped>
.magic-tile-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 1rem;
}

.gift-hint {
  margin: 0.8rem 0 0;
  font-family: var(--site-sans);
  font-size: 11px;
  line-height: 1.4;
  color: var(--site-faint);
}

.gift-reset {
  align-self: flex-end;
  padding: 0.45rem 0.7rem;
  font-family: var(--site-sans);
  font-size: 13px;
  color: var(--site-muted);
  background: transparent;
  border: 1px solid var(--site-border);
  border-radius: 4px;
  cursor: pointer;
}

.gift-reset:hover {
  color: var(--site-blood);
  border-color: var(--site-blood);
}

.dark .gift-reset:hover {
  color: var(--site-gold);
  border-color: var(--site-gold);
}

.gift-search-index {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  white-space: nowrap;
  border: 0;
  clip-path: inset(50%);
}

@media (max-width: 1100px) {
  .magic-tile-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 800px) {
  .magic-tile-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 520px) {
  .magic-tile-grid {
    grid-template-columns: 1fr;
  }

  .gift-reset {
    width: 100%;
  }
}
</style>
