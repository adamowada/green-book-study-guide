import type { GreenBookField, GreenBookSection } from './green-book-content'

export type Mode = 'easy' | 'hard'

export type StudyField = GreenBookField

export type StudySection = GreenBookSection

export type AnswerMap = Record<string, string>

export type ModeAnswerMap = Record<Mode, AnswerMap>

export type SubmittedByMode = Record<Mode, boolean>

export type StoredStudyState = {
  mode: Mode
  answersByMode: ModeAnswerMap
  submittedByMode: SubmittedByMode
}

export const STUDY_STORAGE_KEY = 'green-book-memorizer:v1'

