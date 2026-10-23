import { computed, ref } from 'vue'

export interface DrawerStat {
  label: string
  value: string
}

export interface DrawerItem {
  title: string
  subtitle?: string
  stats: DrawerStat[]
  description?: string
  descriptionTitle?: string
  sourcePage?: number
}

const item = ref<DrawerItem | null>(null)
const isOpen = computed(() => item.value !== null)

export function useItemDrawer() {
  const open = (value: DrawerItem) => {
    item.value = value
  }

  const close = () => {
    item.value = null
  }

  return { item, isOpen, open, close }
}
