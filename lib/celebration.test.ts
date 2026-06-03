import { describe, expect, it } from 'vitest'

import { getPerfectScoreCelebrationMode } from './celebration'

describe('getPerfectScoreCelebrationMode', () => {
  it('returns the current mode for a perfect score', () => {
    expect(getPerfectScoreCelebrationMode({ mode: 'easy', correctCount: 3, totalCount: 3 })).toBe('easy')
    expect(getPerfectScoreCelebrationMode({ mode: 'hard', correctCount: 3, totalCount: 3 })).toBe('hard')
  })

  it('does not return a celebration for an incomplete score', () => {
    expect(getPerfectScoreCelebrationMode({ mode: 'easy', correctCount: 2, totalCount: 3 })).toBeUndefined()
  })

  it('does not return a celebration when there is nothing to grade', () => {
    expect(getPerfectScoreCelebrationMode({ mode: 'hard', correctCount: 0, totalCount: 0 })).toBeUndefined()
  })
})
