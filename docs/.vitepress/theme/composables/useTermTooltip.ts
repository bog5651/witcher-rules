import { ref } from 'vue'
import type { EffectGlossaryEntry } from '../effectGlossary'

export interface TermTooltipState {
  entry: EffectGlossaryEntry
  top: number
  left: number
  width: number
  height: number
}

const active = ref<TermTooltipState | null>(null)

export function useTermTooltip() {
  const show = (event: Event, entry: EffectGlossaryEntry) => {
    const target = event.currentTarget
    if (!(target instanceof HTMLElement)) return

    const rect = target.getBoundingClientRect()
    active.value = {
      entry,
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
