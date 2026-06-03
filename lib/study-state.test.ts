import { describe, expect, it } from 'vitest'

import {
  clearAllAnswers,
  createEmptyStudyState,
  loadStudyState,
  markSubmitted,
  retakeMode,
  setAnswer,
} from './study-state'
import { STUDY_STORAGE_KEY, type StoredStudyState } from './study-types'

class FakeStorage implements Storage {
  private values = new Map<string, string>()

  get length(): number {
    return this.values.size
  }

  clear(): void {
    this.values.clear()
  }

  getItem(key: string): string | null {
    return this.values.get(key) ?? null
  }

  key(index: number): string | null {
    return Array.from(this.values.keys())[index] ?? null
  }

  removeItem(key: string): void {
    this.values.delete(key)
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value)
  }
}

function populatedState(): StoredStudyState {
  return {
    mode: 'hard',
    answersByMode: {
      easy: { alpha: 'easy answer' },
      hard: { alpha: 'hard answer', bravo: 'second hard answer' },
    },
    submittedByMode: {
      easy: true,
      hard: true,
    },
  }
}

describe('study state helpers', () => {
  it('creates an empty study state', () => {
    expect(createEmptyStudyState()).toEqual({
      mode: 'easy',
      answersByMode: {
        easy: {},
        hard: {},
      },
      submittedByMode: {
        easy: false,
        hard: false,
      },
    })
  })

  it('shares answers between easy and hard modes when setting answers', () => {
    let state = createEmptyStudyState()

    state = setAnswer(state, 'easy', 'rank-pfc', 'PFC')
    state = setAnswer(state, 'hard', 'rank-pfc', 'Private First Class')

    expect(state.mode).toBe('hard')
    expect(state.answersByMode.easy).toEqual({ 'rank-pfc': 'Private First Class' })
    expect(state.answersByMode.hard).toEqual({ 'rank-pfc': 'Private First Class' })
  })

  it('marks both modes as submitted', () => {
    const state = markSubmitted(createEmptyStudyState(), 'hard')

    expect(state.submittedByMode).toEqual({
      easy: true,
      hard: true,
    })
  })

  it('clears all answers and submitted state for retakes while preserving the selected mode', () => {
    const state = retakeMode(populatedState(), 'easy')

    expect(state.mode).toBe('easy')
    expect(state.answersByMode.easy).toEqual({})
    expect(state.answersByMode.hard).toEqual({})
    expect(state.submittedByMode).toEqual({
      easy: false,
      hard: false,
    })
  })

  it('clears all answers and submissions while preserving the selected mode', () => {
    const state = clearAllAnswers(populatedState())

    expect(state.mode).toBe('hard')
    expect(state.answersByMode).toEqual({
      easy: {},
      hard: {},
    })
    expect(state.submittedByMode).toEqual({
      easy: false,
      hard: false,
    })
  })

  it('loads legacy separate mode answers as one shared answer map with the selected mode winning conflicts', () => {
    const storage = new FakeStorage()

    storage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify({
        mode: 'hard',
        answersByMode: {
          easy: { alpha: 'easy answer', charlie: 'easy only' },
          hard: { alpha: 'hard answer', bravo: 'hard only' },
        },
        submittedByMode: {
          easy: false,
          hard: true,
        },
      }),
    )

    expect(loadStudyState(storage)).toEqual({
      mode: 'hard',
      answersByMode: {
        easy: { alpha: 'hard answer', charlie: 'easy only', bravo: 'hard only' },
        hard: { alpha: 'hard answer', charlie: 'easy only', bravo: 'hard only' },
      },
      submittedByMode: {
        easy: true,
        hard: true,
      },
    })
  })

  it('falls back to an empty state when storage contains malformed data', () => {
    const storage = new FakeStorage()

    storage.setItem(STUDY_STORAGE_KEY, '{not-json')

    expect(loadStudyState(storage)).toEqual(createEmptyStudyState())
  })
})
