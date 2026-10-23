import { useItemDrawer, type DrawerStat } from './useItemDrawer'

export interface MagicDrawerData {
  title: string
  subtitle: string
  stats: DrawerStat[]
  effect: string
  sourcePage: number
}

export function useMagicDrawer() {
  const { open } = useItemDrawer()

  const openMagic = (data: MagicDrawerData) => {
    open({
      title: data.title,
      subtitle: data.subtitle,
      stats: data.stats,
      description: data.effect,
      descriptionTitle: 'Эффект',
      sourcePage: data.sourcePage
    })
  }

  return { openMagic }
}
