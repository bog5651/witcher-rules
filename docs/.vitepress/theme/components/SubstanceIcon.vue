<script setup lang="ts">
import { computed } from 'vue'
import { useTermTooltip } from '../composables/useTermTooltip'
import vitriol from '../assets/substances/vitriol.svg?raw'
import rebis from '../assets/substances/rebis.svg?raw'
import aether from '../assets/substances/aether.svg?raw'
import quebrith from '../assets/substances/quebrith.svg?raw'
import hydragenum from '../assets/substances/hydragenum.svg?raw'
import vermilion from '../assets/substances/vermilion.svg?raw'
import sol from '../assets/substances/sol.svg?raw'
import caelum from '../assets/substances/caelum.svg?raw'
import fulgur from '../assets/substances/fulgur.svg?raw'

const icons = {
  vitriol,
  rebis,
  aether,
  quebrith,
  hydragenum,
  vermilion,
  sol,
  caelum,
  fulgur
}

const labels = {
  vitriol: 'Купорос',
  rebis: 'Ребис',
  aether: 'Эфир',
  quebrith: 'Квебрит',
  hydragenum: 'Гидраген',
  vermilion: 'Киноварь',
  sol: 'Солнце',
  caelum: 'Аер',
  fulgur: 'Фульгор'
}

const props = withDefaults(
  defineProps<{
    name: keyof typeof icons
    size?: number
  }>(),
  { size: 18 }
)

const svg = computed(() => icons[props.name])
const label = computed(() => labels[props.name])
const { show, hide } = useTermTooltip()
</script>

<template>
  <span
    class="substance-icon"
    :style="{ width: `${size}px`, height: `${size}px` }"
    :aria-label="label"
    role="img"
    tabindex="0"
    @mouseenter="show($event, { title: label })"
    @mouseleave="hide"
    @focus="show($event, { title: label })"
    @blur="hide"
    @click.stop="show($event, { title: label })"
    v-html="svg"
  />
</template>

<style scoped>
.substance-icon {
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: -0.18em;
}

.substance-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
