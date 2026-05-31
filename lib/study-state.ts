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

  return {
    mode: isMode(state.mode) ? state.mode : emptyState.mode,
    answersByMode: {
      easy: readAnswerMap(state.answersByMode?.easy),
      hard: readAnswerMap(state.answersByMode?.hard),
    },
    submittedByMode: {
      easy:
        typeof state.submittedByMode?.easy === 'boolean'
          ? state.submittedByMode.easy
          : emptyState.submittedByMode.easy,
      hard:
        typeof state.submittedByMode?.hard === 'boolean'
          ? state.submittedByMode.hard
          : emptyState.submittedByMode.hard,
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
  return {
    ...state,
    mode,
    answersByMode: {
      ...state.answersByMode,
      [mode]: {
        ...state.answersByMode[mode],
        [fieldId]: value,
      },
    },
  }
}

export function markSubmitted(state: StoredStudyState, mode: Mode): StoredStudyState {
  return {
    ...state,
    mode,
    submittedByMode: {
      ...state.submittedByMode,
      [mode]: true,
    },
  }
}

export function retakeMode(state: StoredStudyState, mode: Mode): StoredStudyState {
  return {
    ...state,
    mode,
    answersByMode: {
      ...state.answersByMode,
      [mode]: {},
    },
    submittedByMode: {
      ...state.submittedByMode,
      [mode]: false,
    },
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
  return state.answersByMode[mode]
}

export function isModeSubmitted(state: StoredStudyState, mode: Mode): boolean {
  return state.submittedByMode[mode]
}

export { MODES as STUDY_MODES }

