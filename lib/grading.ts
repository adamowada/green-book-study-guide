import { getRankPayGradeFieldId } from './green-book-content'
import type { AnswerMap, Mode, StudyField, StudySection } from './study-types'

export type FieldGrade = {
  fieldId: string
  answer: string
  isCorrect: boolean
  correction: string
  rankNameIsCorrect?: boolean
  payGradeAnswer?: string
  payGradeIsCorrect?: boolean
  payGradeCorrection?: string
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

function normalizeCase(answer: string): string {
  return normalizeTypography(answer).toLocaleLowerCase('en-US')
}

function normalizeWithoutWhitespaceOrPunctuation(answer: string): string {
  return normalizeCase(answer).replace(/[^\p{L}\p{N}]+/gu, '')
}

function normalizeWithoutWhitespace(answer: string): string {
  return normalizeCase(answer).trim().replace(/\s+/gu, '')
}

function hasWhitespace(answer: string): boolean {
  return /\s/u.test(answer)
}

function hasPunctuation(answer: string): boolean {
  return /[^\p{L}\p{N}]/u.test(answer)
}

function hasNonWhitespacePunctuation(answer: string): boolean {
  return /[^\p{L}\p{N}\s]/u.test(answer)
}

function isArmyValuesField(field: StudyField): boolean {
  return field.id.startsWith('army-values-')
}

function isSoldiersCreedField(field: StudyField): boolean {
  return field.id.startsWith('soldiers-creed-')
}

function isMilitaryTimeField(field: StudyField): boolean {
  return field.id.startsWith('military-time-')
}

function isGeneralOrdersField(field: StudyField): boolean {
  return field.id.startsWith('general-order-')
}

function isSpecialOrdersField(field: StudyField): boolean {
  return field.id.startsWith('special-orders-')
}

function isPhoneticAlphabetField(field: StudyField): boolean {
  return field.id.startsWith('phonetic-')
}

function isRankField(field: StudyField): boolean {
  return field.id.startsWith('rank-')
}

function getAcceptedAnswers(field: StudyField): readonly string[] {
  return [field.answer, ...(field.aliases ?? [])]
}

function gradeArmyValue(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeCase(answer).trim()

  if (!normalizedAnswer) {
    return false
  }

  const withoutOptionalPeriod = normalizedAnswer.endsWith('.') ? normalizedAnswer.slice(0, -1) : normalizedAnswer

  if (!withoutOptionalPeriod.trim() || hasNonWhitespacePunctuation(withoutOptionalPeriod)) {
    return false
  }

  const withoutWhitespace = withoutOptionalPeriod.replace(/\s+/gu, '')

  return getAcceptedAnswers(field).some((acceptedAnswer) => {
    return normalizeWithoutWhitespace(acceptedAnswer) === withoutWhitespace
  })
}

function gradeLooseText(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeWithoutWhitespaceOrPunctuation(answer)

  if (!normalizedAnswer) {
    return false
  }

  return getAcceptedAnswers(field).some((acceptedAnswer) => {
    return normalizeWithoutWhitespaceOrPunctuation(acceptedAnswer) === normalizedAnswer
  })
}

function gradeMilitaryTime(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeTypography(answer)

  return [field.answer, `${field.answer}Z`, `${field.answer} hours`, `${field.answer} hrs`].includes(normalizedAnswer)
}

function gradePhoneticAlphabet(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeCase(answer).trim()

  if (!normalizedAnswer || hasWhitespace(normalizedAnswer)) {
    return false
  }

  if (field.id === 'phonetic-x') {
    return normalizedAnswer === 'xray' || normalizedAnswer === 'x-ray'
  }

  if (hasPunctuation(normalizedAnswer)) {
    return false
  }

  return getAcceptedAnswers(field).some((acceptedAnswer) => {
    return normalizeWithoutWhitespaceOrPunctuation(acceptedAnswer) === normalizedAnswer
  })
}

function isRankAbbreviation(answer: string): boolean {
  return /^[A-Z0-9]{2,4}$/.test(answer)
}

function addRankPart(parts: Set<string>, value: string): void {
  const normalizedValue = normalizeWithoutWhitespaceOrPunctuation(value)

  if (normalizedValue) {
    parts.add(normalizedValue)
  }
}

function getRankAcceptedAnswers(field: StudyField): Set<string> {
  const acceptedAnswers = getAcceptedAnswers(field)
  const accepted = new Set<string>()
  const fullRanks = new Set<string>()
  const abbreviations = new Set<string>()

  for (const acceptedAnswer of acceptedAnswers) {
    addRankPart(accepted, acceptedAnswer)

    const parentheticalMatch = acceptedAnswer.match(/^\s*(.*?)\s*\(([^)]+)\)\s*$/)

    if (parentheticalMatch) {
      addRankPart(fullRanks, parentheticalMatch[1])
      addRankPart(abbreviations, parentheticalMatch[2])
    }

    const withoutParenthetical = acceptedAnswer.replace(/\([^)]*\)/g, ' ').trim()

    if (isRankAbbreviation(withoutParenthetical)) {
      addRankPart(abbreviations, withoutParenthetical)
    }
  }

  const normalizedAbbreviations = new Set(abbreviations)

  for (const acceptedAnswer of acceptedAnswers) {
    const withoutParenthetical = acceptedAnswer.replace(/\([^)]*\)/g, ' ').trim()
    const tokens = withoutParenthetical.split(/\s+/).filter(Boolean)
    const firstToken = tokens[0]
    const lastToken = tokens.at(-1)

    if (firstToken && normalizedAbbreviations.has(normalizeWithoutWhitespaceOrPunctuation(firstToken))) {
      tokens.shift()
    }

    if (lastToken && normalizedAbbreviations.has(normalizeWithoutWhitespaceOrPunctuation(lastToken))) {
      tokens.pop()
    }

    const fullRank = tokens.join(' ')

    if (fullRank && !isRankAbbreviation(fullRank)) {
      addRankPart(fullRanks, fullRank)
    }
  }

  for (const fullRank of fullRanks) {
    accepted.add(fullRank)

    for (const abbreviation of abbreviations) {
      accepted.add(`${fullRank}${abbreviation}`)
      accepted.add(`${abbreviation}${fullRank}`)
    }
  }

  for (const abbreviation of abbreviations) {
    accepted.add(abbreviation)
  }

  return accepted
}

function gradeRank(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeWithoutWhitespaceOrPunctuation(answer)

  if (!normalizedAnswer) {
    return false
  }

  return getRankAcceptedAnswers(field).has(normalizedAnswer)
}

function normalizePayGrade(answer: string): string | undefined {
  const normalizedAnswer = normalizeCase(answer).trim()

  if (hasWhitespace(normalizedAnswer)) {
    return undefined
  }

  const match = normalizedAnswer.match(/^([ewo])-?(\d{1,2})$/i)

  if (!match) {
    return undefined
  }

  return `${match[1].toLocaleUpperCase('en-US')}${match[2]}`
}

function gradePayGrade(field: StudyField, answer: string): boolean {
  if (!field.payGrade) {
    return false
  }

  return normalizePayGrade(answer) === normalizePayGrade(field.payGrade)
}

function gradeText(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeAnswer(answer)

  if (!normalizedAnswer) {
    return false
  }

  return getAcceptedAnswers(field).some((acceptedAnswer) => normalizeAnswer(acceptedAnswer) === normalizedAnswer)
}

export function gradeField(field: StudyField, answer: string, payGradeAnswer = ''): FieldGrade {
  if (isRankField(field)) {
    const rankNameIsCorrect = gradeRank(field, answer)
    const payGradeIsCorrect = gradePayGrade(field, payGradeAnswer)
    const payGradeCorrection = field.payGrade ?? ''

    return {
      fieldId: field.id,
      answer,
      isCorrect: rankNameIsCorrect && payGradeIsCorrect,
      correction: `${field.answer}, Pay Grade: ${payGradeCorrection}`,
      rankNameIsCorrect,
      payGradeAnswer,
      payGradeIsCorrect,
      payGradeCorrection,
    }
  }

  const isCorrect = isArmyValuesField(field)
    ? gradeArmyValue(field, answer)
    : isSoldiersCreedField(field) || isGeneralOrdersField(field) || isSpecialOrdersField(field)
      ? gradeLooseText(field, answer)
      : isMilitaryTimeField(field)
        ? gradeMilitaryTime(field, answer)
        : isPhoneticAlphabetField(field)
          ? gradePhoneticAlphabet(field, answer)
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
    const fields = section.fields.map((field) => {
      return gradeField(field, answers[field.id] ?? '', answers[getRankPayGradeFieldId(field.id)] ?? '')
    })
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
  answers: AnswerMap,
  mode: Mode,
): ModeGrade {
  const sectionsWithGrades = gradeSections(sections, answers)
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
