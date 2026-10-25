import type MarkdownIt from 'markdown-it'
import { DICE_SOURCE } from '../rulesText'

export function diceRollsPlugin(md: MarkdownIt) {
  md.core.ruler.push('dice_rolls', (state) => {
    const source = String(state.env?.relativePath ?? '').replace(/\\/g, '/')
    if (source.endsWith('combat/injuries.md')) return

    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue

      const children: NonNullable<typeof token.children> = []
      let changed = false

      for (const child of token.children) {
        if (child.type !== 'text') {
          children.push(child)
          continue
        }

        const text = child.content
        const pattern = new RegExp(DICE_SOURCE, 'giu')
        let lastIndex = 0

        for (const match of text.matchAll(pattern)) {
          const index = match.index ?? 0
          if (index > lastIndex) {
            const plain = new state.Token('text', '', 0)
            plain.content = text.slice(lastIndex, index)
            plain.level = child.level
            children.push(plain)
          }

          const code = new state.Token('code_inline', '', 0)
          code.content = match[0]
          code.markup = '`'
          code.info = ''
          code.level = child.level
          children.push(code)
          lastIndex = index + match[0].length
          changed = true
        }

        if (lastIndex === 0) {
          children.push(child)
        } else if (lastIndex < text.length) {
          const plain = new state.Token('text', '', 0)
          plain.content = text.slice(lastIndex)
          plain.level = child.level
          children.push(plain)
        }
      }

      if (changed) token.children = children
    }
  })
}
