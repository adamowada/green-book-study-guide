import { describe, expect, it } from 'vitest'

import {
  clearAllAnswers,
  createEmptyStudyState,
  loadStudyState,
  markSubmitted,
  retakeMode,
  saveStudyState,
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

class ThrowingStorage implements Storage {
  get length(): number {
    throw new Error('Storage is blocked')
  }

  clear(): void {
    throw new Error('Storage is blocked')
  }

  getItem(): string | null {
    throw new Error('Storage is blocked')
  }

  key(): string | null {
    throw new Error('Storage is blocked')
  }

  removeItem(): void {
    throw new Error('Storage is blocked')
  }

  setItem(): void {
    throw new Error('Storage is blocked')
  }
}

function populatedState(): StoredStudyState {
  return {
    mode: 'hard',
    answers: { alpha: 'shared answer', bravo: 'second answer' },
    isSubmitted: true,
  }
}

describe('study state helpers', () => {
  it('creates an empty shared-attempt study state', () => {
    expect(createEmptyStudyState()).toEqual({
      mode: 'easy',
      answers: {},
      isSubmitted: false,
    })
  })

  it('shares one answer map between easy and hard study modes', () => {
    let state = createEmptyStudyState()

    state = setAnswer(state, 'easy', 'rank-pfc', 'PFC')
    state = setAnswer(state, 'hard', 'rank-pfc', 'Private First Class')

    expect(state.mode).toBe('hard')
    expect(state.answers).toEqual({ 'rank-pfc': 'Private First Class' })
  })

  it('marks the shared attempt as submitted', () => {
    const state = markSubmitted(createEmptyStudyState(), 'hard')

    expect(state).toMatchObject({
      mode: 'hard',
      isSubmitted: true,
    })
  })

  it('clears answers and submitted state for retakes while preserving the selected study mode', () => {
    const state = retakeMode(populatedState(), 'easy')

    expect(state).toEqual({
      mode: 'easy',
      answers: {},
      isSubmitted: false,
    })
  })

  it('clears all answers and submission state while preserving the selected study mode', () => {
    const state = clearAllAnswers(populatedState())

    expect(state).toEqual({
      mode: 'hard',
      answers: {},
      isSubmitted: false,
    })
  })

  it('loads the shared-attempt state from storage', () => {
    const storage = new FakeStorage()

    storage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify({
        mode: 'hard',
        answers: { alpha: 'answer' },
        isSubmitted: true,
      }),
    )

    expect(loadStudyState(storage)).toEqual({
      mode: 'hard',
      answers: { alpha: 'answer' },
      isSubmitted: true,
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
      answers: { alpha: 'hard answer', charlie: 'easy only', bravo: 'hard only' },
      isSubmitted: true,
    })
  })

  it('falls back to an empty state when storage contains malformed data', () => {
    const storage = new FakeStorage()

    storage.setItem(STUDY_STORAGE_KEY, '{not-json')

    expect(loadStudyState(storage)).toEqual(createEmptyStudyState())
  })

  it('falls back to an empty state when storage reads are blocked', () => {
    expect(loadStudyState(new ThrowingStorage())).toEqual(createEmptyStudyState())
  })

  it('reports whether saves reached storage', () => {
    const storage = new FakeStorage()
    const state = populatedState()

    expect(saveStudyState(state, storage)).toBe(true)
    expect(loadStudyState(storage)).toEqual(state)
    expect(saveStudyState(state, new ThrowingStorage())).toBe(false)
  })
})
