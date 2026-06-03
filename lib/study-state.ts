import { STUDY_STORAGE_KEY, type AnswerMap, type Mode, type StoredStudyState } from './study-types'

const MODES: readonly Mode[] = ['easy', 'hard']

function isMode(value: unknown): value is Mode {
  return value === 'easy' || value === 'hard'
}

function getBrowserStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    return window.localStorage
  } catch {
    return undefined
  }
}

function readAnswerMap(value: unknown): AnswerMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function readLegacySharedAnswers(value: unknown, mode: Mode): AnswerMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  const state = value as {
    answersByMode?: {
      easy?: unknown
      hard?: unknown
    }
  }
  const answersByMode = {
    easy: readAnswerMap(state.answersByMode?.easy),
    hard: readAnswerMap(state.answersByMode?.hard),
  }
  const otherMode = mode === 'easy' ? 'hard' : 'easy'

  return {
    ...answersByMode[otherMode],
    ...answersByMode[mode],
  }
}

function readLegacySubmitted(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  const state = value as {
    submittedByMode?: {
      easy?: unknown
      hard?: unknown
    }
  }

  return Boolean(state.submittedByMode?.easy) || Boolean(state.submittedByMode?.hard)
}

function readStoredState(value: unknown): StoredStudyState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return createEmptyStudyState()
  }

  const state = value as Partial<StoredStudyState>
  const mode = isMode(state.mode) ? state.mode : 'easy'
  const answers = readAnswerMap(state.answers)

  return {
    mode,
    answers: Object.keys(answers).length > 0 ? answers : readLegacySharedAnswers(value, mode),
    isSubmitted: typeof state.isSubmitted === 'boolean' ? state.isSubmitted : readLegacySubmitted(value),
  }
}

export function createEmptyStudyState(mode: Mode = 'easy'): StoredStudyState {
  return {
    mode,
    answers: {},
    isSubmitted: false,
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

export function saveStudyState(state: StoredStudyState, storage: Storage | undefined = getBrowserStorage()): boolean {
  if (!storage) {
    return false
  }

  try {
    storage.setItem(STUDY_STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function setAnswer(state: StoredStudyState, mode: Mode, fieldId: string, value: string): StoredStudyState {
  return {
    ...state,
    mode,
    answers: {
      ...state.answers,
      [fieldId]: value,
    },
  }
}

export function markSubmitted(state: StoredStudyState, mode: Mode): StoredStudyState {
  return {
    ...state,
    mode,
    isSubmitted: true,
  }
}

export function retakeMode(state: StoredStudyState, mode: Mode): StoredStudyState {
  return {
    ...state,
    mode,
    answers: {},
    isSubmitted: false,
  }
}

export function clearAllAnswers(state: StoredStudyState): StoredStudyState {
  return {
    ...state,
    answers: {},
    isSubmitted: false,
  }
}

export function getAttemptAnswers(state: StoredStudyState): AnswerMap {
  return state.answers
}

export function isAttemptSubmitted(state: StoredStudyState): boolean {
  return state.isSubmitted
}

export { MODES as STUDY_MODES }
