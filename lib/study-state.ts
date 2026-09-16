import {
  DEFAULT_SECTION_IDS,
  getFieldPartAnswerId,
  getRankPayGradeFieldId,
  greenBookSections,
  type GreenBookSection,
  type GreenBookSectionId,
} from './green-book-content'
import { STUDY_STORAGE_KEY, type AnswerMap, type Mode, type StoredStudyState } from './study-types'

const MODES: readonly Mode[] = ['easy', 'hard']
const CANONICAL_SECTION_IDS = greenBookSections.map((section) => section.id)
const KNOWN_SECTION_IDS = new Set<GreenBookSectionId>(CANONICAL_SECTION_IDS)
const CONFIGURED_DEFAULT_SECTION_IDS = new Set<GreenBookSectionId>(DEFAULT_SECTION_IDS)
const NORMALIZED_DEFAULT_SECTION_IDS = CANONICAL_SECTION_IDS.filter((sectionId) =>
  CONFIGURED_DEFAULT_SECTION_IDS.has(sectionId),
)

function getDefaultSectionIds(): GreenBookSectionId[] {
  if (NORMALIZED_DEFAULT_SECTION_IDS.length > 0) {
    return [...NORMALIZED_DEFAULT_SECTION_IDS]
  }

  // Keep the state usable even if a future content edit accidentally exports an empty default list.
  return CANONICAL_SECTION_IDS.slice(0, 1)
}

function readSectionIds(value: unknown): GreenBookSectionId[] {
  if (!Array.isArray(value)) {
    return getDefaultSectionIds()
  }

  const requestedSectionIds = new Set(
    value.filter(
      (sectionId): sectionId is GreenBookSectionId =>
        typeof sectionId === 'string' && KNOWN_SECTION_IDS.has(sectionId as GreenBookSectionId),
    ),
  )
  const sectionIds = CANONICAL_SECTION_IDS.filter((sectionId) => requestedSectionIds.has(sectionId))

  return sectionIds.length > 0 ? sectionIds : getDefaultSectionIds()
}

function sectionIdsMatch(left: readonly GreenBookSectionId[], right: readonly GreenBookSectionId[]): boolean {
  return left.length === right.length && left.every((sectionId, index) => sectionId === right[index])
}

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
  const isSubmitted = typeof state.isSubmitted === 'boolean' ? state.isSubmitted : readLegacySubmitted(value)

  return {
    mode,
    answers: Object.keys(answers).length > 0 ? answers : readLegacySharedAnswers(value, mode),
    isSubmitted,
    selectedSectionIds: readSectionIds(state.selectedSectionIds),
    submittedSectionIds: isSubmitted ? readSectionIds(state.submittedSectionIds) : null,
  }
}

export function createEmptyStudyState(mode: Mode = 'easy'): StoredStudyState {
  return {
    mode,
    answers: {},
    isSubmitted: false,
    selectedSectionIds: getDefaultSectionIds(),
    submittedSectionIds: null,
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

export function setSectionIncluded(
  state: StoredStudyState,
  sectionId: GreenBookSectionId,
  included: boolean,
): StoredStudyState {
  if (state.isSubmitted || !KNOWN_SECTION_IDS.has(sectionId)) {
    return state
  }

  const selectedSectionIds = readSectionIds(state.selectedSectionIds)
  const isCurrentlyIncluded = selectedSectionIds.includes(sectionId)

  if (included === isCurrentlyIncluded) {
    return sectionIdsMatch(state.selectedSectionIds, selectedSectionIds)
      ? state
      : { ...state, selectedSectionIds }
  }

  if (!included && selectedSectionIds.length === 1) {
    return state
  }

  const nextSectionIds = included
    ? [...selectedSectionIds, sectionId]
    : selectedSectionIds.filter((selectedSectionId) => selectedSectionId !== sectionId)

  return {
    ...state,
    selectedSectionIds: readSectionIds(nextSectionIds),
  }
}

export function markSubmitted(state: StoredStudyState, mode: Mode): StoredStudyState {
  if (state.isSubmitted) {
    return state.mode === mode ? state : { ...state, mode }
  }

  return {
    ...state,
    mode,
    isSubmitted: true,
    selectedSectionIds: getDefaultSectionIds(),
    submittedSectionIds: readSectionIds(state.selectedSectionIds),
  }
}

export function retakeMode(state: StoredStudyState, mode: Mode): StoredStudyState {
  return {
    ...state,
    mode,
    answers: {},
    isSubmitted: false,
    selectedSectionIds: getDefaultSectionIds(),
    submittedSectionIds: null,
  }
}

export function clearAllAnswers(state: StoredStudyState): StoredStudyState {
  return {
    ...state,
    answers: {},
    isSubmitted: false,
    selectedSectionIds: getDefaultSectionIds(),
    submittedSectionIds: null,
  }
}

export function clearSectionAnswers(state: StoredStudyState, section: GreenBookSection): StoredStudyState {
  const answers = { ...state.answers }

  for (const field of section.fields) {
    delete answers[field.id]
    delete answers[getRankPayGradeFieldId(field.id)]

    for (const part of field.parts ?? []) {
      delete answers[getFieldPartAnswerId(field.id, part.id)]
    }
  }

  return {
    ...state,
    answers,
  }
}

export function getAttemptAnswers(state: StoredStudyState): AnswerMap {
  return state.answers
}

export function isAttemptSubmitted(state: StoredStudyState): boolean {
  return state.isSubmitted
}

export function getActiveSectionIds(state: StoredStudyState): GreenBookSectionId[] {
  return state.isSubmitted ? readSectionIds(state.submittedSectionIds) : readSectionIds(state.selectedSectionIds)
}

export { MODES as STUDY_MODES }
