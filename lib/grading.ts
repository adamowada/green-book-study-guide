import type { AnswerMap, Mode, StudyField, StudySection } from './study-types'

export type FieldGrade = {
  fieldId: string
  answer: string
  isCorrect: boolean
  correction: string
}

export type SectionGrade = {
  sectionId: string
  title: string
  fields: FieldGrade[]
  correctCount: number
  totalCount: number
}

export type ModeGrade = {
  mode: Mode
  sections: SectionGrade[]
  fieldsById: Record<string, FieldGrade>
  correctCount: number
  totalCount: number
}

const TYPOGRAPHIC_REPLACEMENTS: ReadonlyArray<[RegExp, string]> = [
  [/[\u2018\u2019\u201A\u201B]/g, "'"],
  [/[\u201C\u201D\u201E\u201F]/g, '"'],
  [/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-'],
  [/\u00A0/g, ' '],
]

function normalizeTypography(value: string): string {
  return TYPOGRAPHIC_REPLACEMENTS.reduce((normalized, [pattern, replacement]) => {
    return normalized.replace(pattern, replacement)
  }, value.normalize('NFKC'))
}

export function normalizeAnswer(answer: string): string {
  return normalizeTypography(answer).trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
}

function normalizeRankAnswer(answer: string): string {
  return normalizeAnswer(answer).replace(/[^\p{L}\p{N}]+/gu, '')
}

function isMilitaryTimeField(field: StudyField): boolean {
  return field.id.startsWith('military-time-')
}

function isRankField(field: StudyField): boolean {
  return field.id.startsWith('rank-')
}

function getAcceptedAnswers(field: StudyField): readonly string[] {
  return [field.answer, ...(field.aliases ?? [])]
}

function gradeMilitaryTime(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeAnswer(answer)

  return /^\d{4}$/.test(normalizedAnswer) && normalizedAnswer === field.answer
}

function gradeRank(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeRankAnswer(answer)

  if (!normalizedAnswer) {
    return false
  }

  return getAcceptedAnswers(field).some((acceptedAnswer) => normalizeRankAnswer(acceptedAnswer) === normalizedAnswer)
}

function gradeText(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeAnswer(answer)

  if (!normalizedAnswer) {
    return false
  }

  return getAcceptedAnswers(field).some((acceptedAnswer) => normalizeAnswer(acceptedAnswer) === normalizedAnswer)
}

export function gradeField(field: StudyField, answer: string): FieldGrade {
  const isCorrect = isMilitaryTimeField(field)
    ? gradeMilitaryTime(field, answer)
    : isRankField(field)
      ? gradeRank(field, answer)
      : gradeText(field, answer)

  return {
    fieldId: field.id,
    answer,
    isCorrect,
    correction: field.answer,
  }
}

export function gradeSections(sections: readonly StudySection[], answers: AnswerMap): SectionGrade[] {
  return sections.map((section) => {
    const fields = section.fields.map((field) => gradeField(field, answers[field.id] ?? ''))
    const correctCount = fields.filter((field) => field.isCorrect).length

    return {
      sectionId: section.id,
      title: section.title,
      fields,
      correctCount,
      totalCount: fields.length,
    }
  })
}

export function gradeModeAnswers(
  sections: readonly StudySection[],
  answersByMode: Record<Mode, AnswerMap>,
  mode: Mode,
): ModeGrade {
  const sectionsWithGrades = gradeSections(sections, answersByMode[mode])
  const fieldsById = Object.fromEntries(
    sectionsWithGrades.flatMap((section) => section.fields.map((field) => [field.fieldId, field])),
  )
  const correctCount = sectionsWithGrades.reduce((count, section) => count + section.correctCount, 0)
  const totalCount = sectionsWithGrades.reduce((count, section) => count + section.totalCount, 0)

  return {
    mode,
    sections: sectionsWithGrades,
    fieldsById,
    correctCount,
    totalCount,
  }
}

