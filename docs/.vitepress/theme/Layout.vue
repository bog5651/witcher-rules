<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import ItemDrawer from './components/ItemDrawer.vue'
import TermTooltip from './components/TermTooltip.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout />
  <ItemDrawer />
  <TermTooltip />
</template>
