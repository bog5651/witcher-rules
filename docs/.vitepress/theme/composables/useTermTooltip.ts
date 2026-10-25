import { ref } from 'vue'

export interface TooltipContent {
  title: string
  definition?: string
  sourcePage?: number
  sourceBook?: string
}

export interface TermTooltipState extends TooltipContent {
  top: number
  left: number
  width: number
  height: number
}

const active = ref<TermTooltipState | null>(null)

export function useTermTooltip() {
  const show = (event: Event, content: TooltipContent) => {
    const target = event.currentTarget
    if (!(target instanceof HTMLElement)) return

    const rect = target.getBoundingClientRect()
    active.value = {
      ...content,
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  }

  const hide = () => {
    active.value = null
  }

  return { active, show, hide }
}
