import { describe, expect, it } from 'vitest'

import {
  ADDITIONAL_SECTION_IDS,
  DEFAULT_SECTION_IDS,
  getFieldPartAnswerId,
  getRankPayGradeFieldId,
  greenBookSections,
  type GreenBookSection,
  type GreenBookSectionId,
} from './green-book-content'
import {
  clearAllAnswers,
  clearSectionAnswers,
  createEmptyStudyState,
  getActiveSectionIds,
  loadStudyState,
  markSubmitted,
  retakeMode,
  saveStudyState,
  setAnswer,
  setSectionIncluded,
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

const canonicalSectionIds = greenBookSections.map((section) => section.id)
const firstDefaultSectionId = DEFAULT_SECTION_IDS[0]
const secondDefaultSectionId = DEFAULT_SECTION_IDS[1]
const firstAdditionalSectionId = ADDITIONAL_SECTION_IDS[0]

function canonicalize(sectionIds: readonly GreenBookSectionId[]): GreenBookSectionId[] {
  const requestedIds = new Set(sectionIds)
  return canonicalSectionIds.filter((sectionId) => requestedIds.has(sectionId))
}

function populatedState(): StoredStudyState {
  return {
    mode: 'hard',
    answers: { alpha: 'shared answer', bravo: 'second answer' },
    isSubmitted: true,
    selectedSectionIds: [...DEFAULT_SECTION_IDS],
    submittedSectionIds: [firstAdditionalSectionId],
  }
}

describe('study state helpers', () => {
  it('creates an empty shared-attempt study state with the legacy sections selected', () => {
    expect(createEmptyStudyState()).toEqual({
      mode: 'easy',
      answers: {},
      isSubmitted: false,
      selectedSectionIds: [...DEFAULT_SECTION_IDS],
      submittedSectionIds: null,
    })
  })

  it('shares one answer map between easy and hard study modes', () => {
    let state = createEmptyStudyState()

    state = setAnswer(state, 'easy', 'rank-pfc', 'PFC')
    state = setAnswer(state, 'hard', 'rank-pfc', 'Private First Class')

    expect(state.mode).toBe('hard')
    expect(state.answers).toEqual({ 'rank-pfc': 'Private First Class' })
  })

  it('includes sections in canonical content order without clearing hidden answers', () => {
    const state = {
      ...createEmptyStudyState(),
      answers: { 'remember-me': 'draft' },
      selectedSectionIds: [secondDefaultSectionId],
    }
    const nextState = setSectionIncluded(state, firstAdditionalSectionId, true)

    expect(nextState.selectedSectionIds).toEqual(
      canonicalize([secondDefaultSectionId, firstAdditionalSectionId]),
    )
    expect(nextState.answers).toEqual({ 'remember-me': 'draft' })
  })

  it('excludes sections without deleting their answers', () => {
    const state = {
      ...createEmptyStudyState(),
      answers: { [`${firstDefaultSectionId}-draft`]: 'answer' },
    }
    const nextState = setSectionIncluded(state, firstDefaultSectionId, false)

    expect(nextState.selectedSectionIds).not.toContain(firstDefaultSectionId)
    expect(nextState.answers).toEqual(state.answers)
  })

  it('does not permit the last selected section to be excluded', () => {
    const state = {
      ...createEmptyStudyState(),
      selectedSectionIds: [firstAdditionalSectionId],
    }

    expect(setSectionIncluded(state, firstAdditionalSectionId, false)).toBe(state)
  })

  it('repairs an invalid empty selection when a section is toggled', () => {
    const invalidState = {
      ...createEmptyStudyState(),
      selectedSectionIds: [],
    }

    expect(setSectionIncluded(invalidState, firstDefaultSectionId, true).selectedSectionIds).toEqual([
      ...DEFAULT_SECTION_IDS,
    ])
  })

  it('ignores unknown section IDs and selection changes after submission', () => {
    const draftState = createEmptyStudyState()
    const unknownSectionId = 'not-a-real-section' as GreenBookSectionId

    expect(setSectionIncluded(draftState, unknownSectionId, true)).toBe(draftState)

    const submittedState = markSubmitted(draftState, 'easy')
    expect(setSectionIncluded(submittedState, firstAdditionalSectionId, true)).toBe(submittedState)
  })

  it('snapshots the customized selection on submit and resets the next selection to defaults', () => {
    let state = createEmptyStudyState('hard')
    state = setSectionIncluded(state, firstAdditionalSectionId, true)
    state = setSectionIncluded(state, firstDefaultSectionId, false)
    state = setAnswer(state, 'hard', 'custom-draft', 'answer')
    const submittedSelection = [...state.selectedSectionIds]

    const submittedState = markSubmitted(state, 'hard')

    expect(submittedState).toMatchObject({
      mode: 'hard',
      answers: { 'custom-draft': 'answer' },
      isSubmitted: true,
      selectedSectionIds: [...DEFAULT_SECTION_IDS],
      submittedSectionIds: submittedSelection,
    })
    expect(getActiveSectionIds(submittedState)).toEqual(submittedSelection)
  })

  it('keeps an existing submission snapshot when submit is invoked again', () => {
    const submittedState = markSubmitted(createEmptyStudyState(), 'easy')

    expect(markSubmitted(submittedState, 'easy')).toBe(submittedState)
    expect(markSubmitted(submittedState, 'hard')).toEqual({ ...submittedState, mode: 'hard' })
  })

  it('uses selected sections for a draft and the snapshot for submitted results', () => {
    const draftState = {
      ...createEmptyStudyState(),
      selectedSectionIds: [firstAdditionalSectionId],
    }
    const submittedState = {
      ...draftState,
      isSubmitted: true,
      selectedSectionIds: [...DEFAULT_SECTION_IDS],
      submittedSectionIds: [firstAdditionalSectionId],
    }

    expect(getActiveSectionIds(draftState)).toEqual([firstAdditionalSectionId])
    expect(getActiveSectionIds(submittedState)).toEqual([firstAdditionalSectionId])
  })

  it('clears answers and submitted selection for retakes while preserving the requested mode', () => {
    const state = retakeMode(populatedState(), 'easy')

    expect(state).toEqual({
      mode: 'easy',
      answers: {},
      isSubmitted: false,
      selectedSectionIds: [...DEFAULT_SECTION_IDS],
      submittedSectionIds: null,
    })
  })

  it('clears all answers and restores default sections while preserving the selected mode', () => {
    const state = clearAllAnswers(populatedState())

    expect(state).toEqual({
      mode: 'hard',
      answers: {},
      isSubmitted: false,
      selectedSectionIds: [...DEFAULT_SECTION_IDS],
      submittedSectionIds: null,
    })
  })

  it('clears top-level, composite-part, and rank pay-grade answer IDs for one section only', () => {
    const partSection = greenBookSections.find((section) =>
      section.fields.some((field) => (field.parts?.length ?? 0) > 0),
    )
    const rankSection = greenBookSections.find((section) => section.fields.some((field) => Boolean(field.payGrade)))

    if (!partSection || !rankSection) {
      throw new Error('Expected both composite-part and rank sections in Green Book content')
    }

    const partField = partSection.fields.find((field) => (field.parts?.length ?? 0) > 0)
    const rankField = rankSection.fields.find((field) => Boolean(field.payGrade))

    if (!partField?.parts || !rankField) {
      throw new Error('Expected composite-part and rank fields in Green Book content')
    }

    const combinedSection: GreenBookSection = {
      ...partSection,
      fields: [partField, rankField],
    }
    const partAnswerIds = partField.parts.map((part) => getFieldPartAnswerId(partField.id, part.id))
    const rankPayGradeId = getRankPayGradeFieldId(rankField.id)
    const state = {
      ...populatedState(),
      answers: {
        keep: 'this answer belongs to another section',
        [partField.id]: 'legacy aggregate answer',
        ...Object.fromEntries(partAnswerIds.map((answerId) => [answerId, 'part answer'])),
        [rankField.id]: 'rank answer',
        [rankPayGradeId]: 'rank pay grade',
      },
    }

    const nextState = clearSectionAnswers(state, combinedSection)

    expect(nextState.answers).toEqual({ keep: 'this answer belongs to another section' })
    expect(nextState.mode).toBe(state.mode)
    expect(nextState.isSubmitted).toBe(state.isSubmitted)
    expect(nextState.selectedSectionIds).toEqual(state.selectedSectionIds)
    expect(nextState.submittedSectionIds).toEqual(state.submittedSectionIds)
  })

  it('loads and canonicalizes persisted section selections', () => {
    const storage = new FakeStorage()

    storage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify({
        mode: 'hard',
        answers: { alpha: 'answer' },
        isSubmitted: true,
        selectedSectionIds: [firstAdditionalSectionId, secondDefaultSectionId, secondDefaultSectionId, 'unknown'],
        submittedSectionIds: [firstAdditionalSectionId, firstDefaultSectionId, firstAdditionalSectionId],
      }),
    )

    expect(loadStudyState(storage)).toEqual({
      mode: 'hard',
      answers: { alpha: 'answer' },
      isSubmitted: true,
      selectedSectionIds: canonicalize([firstAdditionalSectionId, secondDefaultSectionId]),
      submittedSectionIds: canonicalize([firstAdditionalSectionId, firstDefaultSectionId]),
    })
  })

  it('migrates the previous shared-attempt v1 shape to default sections', () => {
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
      selectedSectionIds: [...DEFAULT_SECTION_IDS],
      submittedSectionIds: [...DEFAULT_SECTION_IDS],
    })
  })

  it('migrates legacy separate-mode answers with the selected mode winning conflicts', () => {
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
      selectedSectionIds: [...DEFAULT_SECTION_IDS],
      submittedSectionIds: [...DEFAULT_SECTION_IDS],
    })
  })

  it('repairs empty, unknown, and invalid selection data without permitting zero sections', () => {
    const invalidValues = [[], ['unknown'], null, 'not-an-array']

    for (const selectedSectionIds of invalidValues) {
      const storage = new FakeStorage()
      storage.setItem(
        STUDY_STORAGE_KEY,
        JSON.stringify({
          mode: 'easy',
          answers: {},
          isSubmitted: false,
          selectedSectionIds,
          submittedSectionIds: [firstAdditionalSectionId],
        }),
      )

      expect(loadStudyState(storage)).toEqual({
        mode: 'easy',
        answers: {},
        isSubmitted: false,
        selectedSectionIds: [...DEFAULT_SECTION_IDS],
        submittedSectionIds: null,
      })
    }
  })

  it('falls back to defaults when a submitted snapshot is missing or invalid', () => {
    for (const submittedSectionIds of [null, [], ['unknown']]) {
      const storage = new FakeStorage()
      storage.setItem(
        STUDY_STORAGE_KEY,
        JSON.stringify({
          mode: 'easy',
          answers: {},
          isSubmitted: true,
          selectedSectionIds: [firstAdditionalSectionId],
          submittedSectionIds,
        }),
      )

      expect(getActiveSectionIds(loadStudyState(storage))).toEqual([...DEFAULT_SECTION_IDS])
    }
  })

  it('falls back to an empty default state for malformed JSON, non-objects, or blocked storage', () => {
    for (const serializedState of ['{not-json', 'null', '[]', '"string"']) {
      const storage = new FakeStorage()
      storage.setItem(STUDY_STORAGE_KEY, serializedState)

      expect(loadStudyState(storage)).toEqual(createEmptyStudyState())
    }

    expect(loadStudyState(new ThrowingStorage())).toEqual(createEmptyStudyState())
  })

  it('filters non-string answer values while loading', () => {
    const storage = new FakeStorage()
    storage.setItem(
      STUDY_STORAGE_KEY,
      JSON.stringify({
        mode: 'easy',
        answers: { valid: 'answer', number: 42, object: { value: 'answer' }, empty: '' },
        isSubmitted: false,
      }),
    )

    expect(loadStudyState(storage).answers).toEqual({ valid: 'answer', empty: '' })
  })

  it('round-trips current state through storage and reports blocked saves', () => {
    const storage = new FakeStorage()
    const state = populatedState()

    expect(saveStudyState(state, storage)).toBe(true)
    expect(loadStudyState(storage)).toEqual(state)
    expect(saveStudyState(state, new ThrowingStorage())).toBe(false)
  })
})
