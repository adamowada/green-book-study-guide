import type { Mode } from './study-types'

export function makeEasyHint(answer: string): string {
  return answer.replace(/[\p{L}\p{N}]+/gu, (token) => {
    const characters = Array.from(token)

    return `${characters[0]}${'_'.repeat(Math.max(0, characters.length - 1))}`
  })
}

export function getFieldPlaceholder(answer: string, mode: Mode): string {
  if (mode === 'easy') {
    return makeEasyHint(answer)
  }

  return 'Type the full answer'
}

