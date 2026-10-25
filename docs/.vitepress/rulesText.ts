export const DICE_SOURCE = String.raw`(?<![\p{L}\p{N}])(?:\d+)?d\d+(?:\s*[+\-−/×x]\s*\d+)?(?![\p{L}\p{N}])`

export interface RulesSegment {
  type: 'text' | 'dice'
  value: string
}

export function splitRulesText(text: string): RulesSegment[] {
  if (!text) return []

  const pattern = new RegExp(DICE_SOURCE, 'giu')
  const segments: RulesSegment[] = []
  let lastIndex = 0

  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0
    if (index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, index) })
    }
    segments.push({ type: 'dice', value: match[0] })
    lastIndex = index + match[0].length
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) })
  }

  return segments
}
