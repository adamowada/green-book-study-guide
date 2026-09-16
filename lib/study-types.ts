import type { GreenBookField, GreenBookSection, GreenBookSectionId } from './green-book-content'

export type Mode = 'easy' | 'hard'

export type StudyField = GreenBookField

export type StudySection = GreenBookSection

export type AnswerMap = Record<string, string>

export type StoredStudyState = {
  mode: Mode
  answers: AnswerMap
  isSubmitted: boolean
  selectedSectionIds: GreenBookSectionId[]
  submittedSectionIds: GreenBookSectionId[] | null
}

export const STUDY_STORAGE_KEY = 'green-book-study-guide:v1'
