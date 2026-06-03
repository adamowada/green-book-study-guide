import { STUDY_STORAGE_KEY, type AnswerMap, type Mode, type StoredStudyState } from './study-types'

const MODES: readonly Mode[] = ['easy', 'hard']

function isMode(value: unknown): value is Mode {
  return value === 'easy' || value === 'hard'
}

function createEmptyAnswerMaps(): StoredStudyState['answersByMode'] {
  return {
    easy: {},
    hard: {},
  }
}

function createEmptySubmittedMap(): StoredStudyState['submittedByMode'] {
  return {
    easy: false,
    hard: false,
  }
}

function getOtherMode(mode: Mode): Mode {
  return mode === 'easy' ? 'hard' : 'easy'
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  return window.localStorage
}

function readAnswerMap(value: unknown): AnswerMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function readStoredState(value: unknown): StoredStudyState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return createEmptyStudyState()
  }

  const state = value as Partial<StoredStudyState>
  const emptyState = createEmptyStudyState()
  const mode = isMode(state.mode) ? state.mode : emptyState.mode
  const answersByMode = {
    easy: readAnswerMap(state.answersByMode?.easy),
    hard: readAnswerMap(state.answersByMode?.hard),
  }
  const submittedByMode = {
    easy:
      typeof state.submittedByMode?.easy === 'boolean' ? state.submittedByMode.easy : emptyState.submittedByMode.easy,
    hard:
      typeof state.submittedByMode?.hard === 'boolean' ? state.submittedByMode.hard : emptyState.submittedByMode.hard,
  }
  const sharedAnswers = {
    ...answersByMode[getOtherMode(mode)],
    ...answersByMode[mode],
  }
  const isSubmitted = submittedByMode.easy || submittedByMode.hard

  return {
    mode,
    answersByMode: {
      easy: sharedAnswers,
      hard: { ...sharedAnswers },
    },
    submittedByMode: {
      easy: isSubmitted,
      hard: isSubmitted,
    },
  }
}

export function createEmptyStudyState(mode: Mode = 'easy'): StoredStudyState {
  return {
    mode,
    answersByMode: createEmptyAnswerMaps(),
    submittedByMode: createEmptySubmittedMap(),
  }
}

export function loadStudyState(storage: Storage | undefined = getBrowserStorage()): StoredStudyState {
  if (!storage) {
    return createEmptyStudyState()
  }

  try {
    const serializedState = storage.getItem(STUDY_STORAGE_KEY)

    if (!serializedState) {
      return createEmptyStudyState()
    }

    return readStoredState(JSON.parse(serializedState))
  } catch {
    return createEmptyStudyState()
  }
}

export function saveStudyState(state: StoredStudyState, storage: Storage | undefined = getBrowserStorage()): void {
  if (!storage) {
    return
  }

  storage.setItem(STUDY_STORAGE_KEY, JSON.stringify(state))
}

export function setAnswer(state: StoredStudyState, mode: Mode, fieldId: string, value: string): StoredStudyState {
  const sharedAnswers = {
    ...getModeAnswers(state, mode),
    [fieldId]: value,
  }

  return {
    ...state,
    mode,
    answersByMode: {
      easy: sharedAnswers,
      hard: { ...sharedAnswers },
    },
  }
}

export function markSubmitted(state: StoredStudyState, mode: Mode): StoredStudyState {
  return {
    ...state,
    mode,
    submittedByMode: {
      easy: true,
      hard: true,
    },
  }
}

export function retakeMode(state: StoredStudyState, mode: Mode): StoredStudyState {
  return {
    ...state,
    mode,
    answersByMode: createEmptyAnswerMaps(),
    submittedByMode: createEmptySubmittedMap(),
  }
}

export function clearAllAnswers(state: StoredStudyState): StoredStudyState {
  return {
    ...state,
    answersByMode: createEmptyAnswerMaps(),
    submittedByMode: createEmptySubmittedMap(),
  }
}

export function getModeAnswers(state: StoredStudyState, mode: Mode): AnswerMap {
  return {
    ...state.answersByMode[getOtherMode(mode)],
    ...state.answersByMode[mode],
  }
}

export function isModeSubmitted(state: StoredStudyState, mode: Mode): boolean {
  return state.submittedByMode[mode] || state.submittedByMode[getOtherMode(mode)]
}

export { MODES as STUDY_MODES }
