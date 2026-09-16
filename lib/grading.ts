import { getFieldPartAnswerId, getRankPayGradeFieldId } from './green-book-content'
import type { AnswerMap, Mode, StudyField, StudySection } from './study-types'

export type PartGrade = {
  partId: string
  answer: string
  isCorrect: boolean
  correction: string
}

export type FieldTargetedFeedback = {
  closestIncompleteListItem?: {
    submitted: string
    expected: string
  }
  firstWordDifference?: {
    kind: 'missing' | 'different' | 'extra'
    wordIndex: number
    expectedWord?: string
    submittedWord?: string
  }
  unexpectedListItems?: readonly string[]
}

export type FieldGrade = {
  fieldId: string
  answer: string
  isCorrect: boolean
  correction: string
  earnedPoints: number
  possiblePoints: number
  targetedFeedback?: FieldTargetedFeedback
  partGrades?: readonly PartGrade[]
  missingItems?: readonly string[]
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

type AnswerSpec = {
  answer: string
  aliases?: readonly string[]
}

function getAcceptedAnswers(answerSpec: AnswerSpec): readonly string[] {
  return [answerSpec.answer, ...(answerSpec.aliases ?? [])]
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
  return gradeLooseAnswer(field, answer)
}

function gradeLooseAnswer(answerSpec: AnswerSpec, answer: string): boolean {
  const normalizedAnswer = normalizeWithoutWhitespaceOrPunctuation(answer)

  if (!normalizedAnswer) {
    return false
  }

  return getAcceptedAnswers(answerSpec).some((acceptedAnswer) => {
    return normalizeWithoutWhitespaceOrPunctuation(acceptedAnswer) === normalizedAnswer
  })
}

function gradeMilitaryTime(field: StudyField, answer: string): boolean {
  const normalizedAnswer = normalizeTypography(answer).trim().replace(/\s+/gu, ' ').toLocaleLowerCase('en-US')

  return [field.answer, `${field.answer}z`, `${field.answer} hours`, `${field.answer} hrs`].includes(normalizedAnswer)
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

const rankAcceptedAnswersCache = new WeakMap<StudyField, Set<string>>()

function getRankAcceptedAnswers(field: StudyField): Set<string> {
  const cachedAcceptedAnswers = rankAcceptedAnswersCache.get(field)

  if (cachedAcceptedAnswers) {
    return cachedAcceptedAnswers
  }

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

  rankAcceptedAnswersCache.set(field, accepted)

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

function gradeFourDigitYear(answerSpec: AnswerSpec, answer: string): boolean {
  const normalizedAnswer = normalizeTypography(answer).trim()

  if (!/^\d{4}$/u.test(normalizedAnswer)) {
    return false
  }

  return getAcceptedAnswers(answerSpec).some((acceptedAnswer) => acceptedAnswer === normalizedAnswer)
}

function gradeAnswerSpec(answerSpec: AnswerSpec, inputKind: string, answer: string): boolean {
  return inputKind === 'four-digit-year'
    ? gradeFourDigitYear(answerSpec, answer)
    : gradeLooseAnswer(answerSpec, answer)
}

function stripOptionalListPrefix(answer: string): string {
  return answer.replace(/^\s*(?:(?:[-*•])|(?:\(?\d+\)?[.)]))\s*/u, '').trim()
}

type FeedbackWord = {
  normalized: string
  display: string
}

function getFeedbackWords(answer: string): FeedbackWord[] {
  return normalizeTypography(answer)
    .replace(/'/gu, '')
    .split(/[^\p{L}\p{N}]+/gu)
    .filter(Boolean)
    .map((word) => ({
      normalized: word.toLocaleLowerCase('en-US'),
      display: word,
    }))
}

function getWordEditDistances(expected: readonly FeedbackWord[], submitted: readonly FeedbackWord[]): number[][] {
  const distances = Array.from({ length: expected.length + 1 }, () =>
    Array.from({ length: submitted.length + 1 }, () => 0),
  )

  for (let expectedIndex = expected.length; expectedIndex >= 0; expectedIndex -= 1) {
    for (let submittedIndex = submitted.length; submittedIndex >= 0; submittedIndex -= 1) {
      if (expectedIndex === expected.length) {
        distances[expectedIndex]![submittedIndex] = submitted.length - submittedIndex
      } else if (submittedIndex === submitted.length) {
        distances[expectedIndex]![submittedIndex] = expected.length - expectedIndex
      } else if (expected[expectedIndex]?.normalized === submitted[submittedIndex]?.normalized) {
        distances[expectedIndex]![submittedIndex] = distances[expectedIndex + 1]![submittedIndex + 1]!
      } else {
        distances[expectedIndex]![submittedIndex] =
          1 +
          Math.min(
            distances[expectedIndex + 1]![submittedIndex + 1]!,
            distances[expectedIndex + 1]![submittedIndex]!,
            distances[expectedIndex]![submittedIndex + 1]!,
          )
      }
    }
  }

  return distances
}

function getWordEditDistance(expected: string, submitted: string): number {
  const expectedWords = getFeedbackWords(expected)
  const submittedWords = getFeedbackWords(submitted)
  return getWordEditDistances(expectedWords, submittedWords)[0]![0]!
}

function getWordSimilarity(expected: string, submitted: string): number {
  const expectedLength = getFeedbackWords(expected).length
  const submittedLength = getFeedbackWords(submitted).length
  const longestLength = Math.max(expectedLength, submittedLength)

  if (longestLength === 0) {
    return 0
  }

  return 1 - getWordEditDistance(expected, submitted) / longestLength
}

function getFirstWordDifference(answerSpec: AnswerSpec, answer: string) {
  const submittedWords = getFeedbackWords(answer)
  const acceptedCandidates = getAcceptedAnswers(answerSpec).map((acceptedAnswer) => {
    const expectedWords = getFeedbackWords(acceptedAnswer)
    const distances = getWordEditDistances(expectedWords, submittedWords)
    return { expectedWords, distances, distance: distances[0]![0]! }
  })
  const closestCandidate = acceptedCandidates.reduce((closest, candidate) => {
    return candidate.distance < closest.distance ? candidate : closest
  })
  const { expectedWords, distances } = closestCandidate
  let expectedIndex = 0
  let submittedIndex = 0

  while (
    expectedWords[expectedIndex]?.normalized === submittedWords[submittedIndex]?.normalized &&
    expectedIndex < expectedWords.length &&
    submittedIndex < submittedWords.length
  ) {
    expectedIndex += 1
    submittedIndex += 1
  }

  if (expectedIndex === expectedWords.length) {
    return submittedIndex < submittedWords.length
      ? {
          kind: 'extra' as const,
          wordIndex: expectedIndex,
          submittedWord: submittedWords[submittedIndex]?.display,
        }
      : undefined
  }

  if (submittedIndex === submittedWords.length) {
    return {
      kind: 'missing' as const,
      wordIndex: expectedIndex,
      expectedWord: expectedWords[expectedIndex]?.display,
    }
  }

  const substitutionDistance = distances[expectedIndex + 1]![submittedIndex + 1]!
  const missingDistance = distances[expectedIndex + 1]![submittedIndex]!
  const extraDistance = distances[expectedIndex]![submittedIndex + 1]!

  if (substitutionDistance <= missingDistance && substitutionDistance <= extraDistance) {
    return {
      kind: 'different' as const,
      wordIndex: expectedIndex,
      expectedWord: expectedWords[expectedIndex]?.display,
      submittedWord: submittedWords[submittedIndex]?.display,
    }
  }

  if (missingDistance <= extraDistance) {
    return {
      kind: 'missing' as const,
      wordIndex: expectedIndex,
      expectedWord: expectedWords[expectedIndex]?.display,
    }
  }

  return {
    kind: 'extra' as const,
    wordIndex: expectedIndex,
    submittedWord: submittedWords[submittedIndex]?.display,
  }
}

function gradeUnorderedList(field: StudyField, answer: string): FieldGrade {
  const items = field.items ?? []
  const submittedItems = normalizeTypography(answer)
    .split(/\r?\n/u)
    .map(stripOptionalListPrefix)
    .filter(Boolean)
  const unmatchedItemIndexes = new Set(items.map((_, index) => index))
  const matchesByItemIndex = new Map<number, string>()
  const unmatchedSubmittedItems: string[] = []

  for (const submittedItem of submittedItems) {
    const matchingItemIndex = items.findIndex((item, index) => {
      return unmatchedItemIndexes.has(index) && gradeLooseAnswer(item, submittedItem)
    })

    if (matchingItemIndex >= 0) {
      unmatchedItemIndexes.delete(matchingItemIndex)
      matchesByItemIndex.set(matchingItemIndex, submittedItem)
    } else {
      unmatchedSubmittedItems.push(submittedItem)
    }
  }

  const matchedCount = items.length - unmatchedItemIndexes.size
  const exactListMatch = matchedCount === items.length && items.length > 0 && unmatchedSubmittedItems.length === 0
  const earnedPoints =
    field.listScoring === 'all-or-nothing'
      ? exactListMatch
        ? field.points
        : 0
      : Math.min(field.points, matchedCount)
  const partGrades = items.map((item, index) => ({
    partId: `${field.id}:item:${item.id}`,
    answer: matchesByItemIndex.get(index) ?? '',
    isCorrect: !unmatchedItemIndexes.has(index),
    correction: item.answer,
  }))
  const missingItems = items.filter((_, index) => unmatchedItemIndexes.has(index)).map((item) => item.answer)
  const incompleteSubmittedItems = unmatchedSubmittedItems.filter((submittedItem) => {
    return !items.some((item) => gradeLooseAnswer(item, submittedItem))
  })
  const closestIncompleteListItem =
    field.listScoring === 'per-item' && incompleteSubmittedItems.length > 0 && missingItems.length > 0
      ? incompleteSubmittedItems
          .flatMap((submitted) => {
            return missingItems.map((expected) => ({
              submitted,
              expected,
              similarity: getWordSimilarity(expected, submitted),
            }))
          })
          .reduce((closest, candidate) => (candidate.similarity > closest.similarity ? candidate : closest))
      : undefined
  const shouldShowClosestIncompleteItem = Boolean(closestIncompleteListItem && closestIncompleteListItem.similarity >= 0.5)
  const unexpectedListItems = field.listScoring === 'all-or-nothing' ? unmatchedSubmittedItems : []
  const hasTargetedFeedback = shouldShowClosestIncompleteItem || unexpectedListItems.length > 0

  return {
    fieldId: field.id,
    answer,
    isCorrect: field.listScoring === 'all-or-nothing' ? exactListMatch : earnedPoints === field.points,
    correction: field.answer,
    earnedPoints,
    possiblePoints: field.points,
    targetedFeedback: hasTargetedFeedback
      ? {
          closestIncompleteListItem:
            shouldShowClosestIncompleteItem && closestIncompleteListItem
              ? {
                  submitted: closestIncompleteListItem.submitted,
                  expected: closestIncompleteListItem.expected,
                }
              : undefined,
          unexpectedListItems: unexpectedListItems.length > 0 ? unexpectedListItems : undefined,
        }
      : undefined,
    partGrades,
    missingItems,
  }
}

function gradeComposite(field: StudyField, answer: string, answers: AnswerMap): FieldGrade {
  const parts = field.parts ?? []
  const hasPartAnswers = parts.some((part) => {
    return Object.prototype.hasOwnProperty.call(answers, getFieldPartAnswerId(field.id, part.id))
  })

  if (!hasPartAnswers) {
    const isCorrect = gradeLooseText(field, answer)

    return {
      fieldId: field.id,
      answer,
      isCorrect,
      correction: field.answer,
      earnedPoints: isCorrect ? field.points : 0,
      possiblePoints: field.points,
      partGrades: parts.map((part) => ({
        partId: getFieldPartAnswerId(field.id, part.id),
        answer: '',
        isCorrect,
        correction: part.answer,
      })),
    }
  }

  const partGrades = parts.map((part) => {
    const partId = getFieldPartAnswerId(field.id, part.id)
    const partAnswer = answers[partId] ?? ''

    return {
      partId,
      answer: partAnswer,
      isCorrect: gradeAnswerSpec(part, part.inputKind, partAnswer),
      correction: part.answer,
    }
  })
  const isCorrect = partGrades.length > 0 && partGrades.every((part) => part.isCorrect)

  return {
    fieldId: field.id,
    answer,
    isCorrect,
    correction: field.answer,
    earnedPoints: isCorrect ? field.points : 0,
    possiblePoints: field.points,
    partGrades,
  }
}

const CODE_ARTICLE_LABEL_PATTERN =
  /^\s*(?:([a-f])\s*[.)]|([1-6])(?:\s*[.)])?|article\s+(vi|iv|v|iii|ii|i)(?:\s*[.:)])?)\s+/iu

function parseCodeArticleLabel(answer: string): { label: string; body: string } | undefined {
  const normalizedAnswer = normalizeTypography(answer)
  const match = normalizedAnswer.match(CODE_ARTICLE_LABEL_PATTERN)

  if (!match) {
    return undefined
  }

  const label = match[1] ? match[1] : match[2] ? match[2] : `article${match[3]}`

  return {
    label: normalizeWithoutWhitespaceOrPunctuation(label),
    body: normalizedAnswer.slice(match[0].length),
  }
}

function gradeCodeArticle(field: StudyField, answer: string): boolean {
  const parsedLabel = parseCodeArticleLabel(answer)

  if (!parsedLabel) {
    return gradeLooseText(field, answer)
  }

  const acceptedLabels = (field.acceptedLeadingLabels ?? []).map(normalizeWithoutWhitespaceOrPunctuation)

  return acceptedLabels.includes(parsedLabel.label) && gradeLooseText(field, parsedLabel.body)
}

function shouldProvideWordDifference(field: StudyField): boolean {
  return (
    field.group === 'national-anthem-lyrics' ||
    field.group === 'army-song-lyrics' ||
    field.id === 'code-of-conduct-article-4' ||
    field.id === 'code-of-conduct-article-5'
  )
}

function getWordFeedbackAnswer(field: StudyField, answer: string): string | undefined {
  if (field.gradingProfile !== 'code-article') {
    return answer
  }

  const parsedLabel = parseCodeArticleLabel(answer)

  if (!parsedLabel) {
    return answer
  }

  const acceptedLabels = (field.acceptedLeadingLabels ?? []).map(normalizeWithoutWhitespaceOrPunctuation)
  return acceptedLabels.includes(parsedLabel.label) ? parsedLabel.body : undefined
}

export function gradeField(
  field: StudyField,
  answer: string,
  payGradeAnswer = '',
  answers: AnswerMap = {},
): FieldGrade {
  if (field.gradingProfile === 'rank-identification') {
    const rankNameIsCorrect = gradeRank(field, answer)
    const payGradeIsCorrect = gradePayGrade(field, payGradeAnswer)
    const payGradeCorrection = field.payGrade ?? ''
    const isCorrect = rankNameIsCorrect && payGradeIsCorrect

    return {
      fieldId: field.id,
      answer,
      isCorrect,
      correction: `${field.answer}, Pay Grade: ${payGradeCorrection}`,
      earnedPoints: isCorrect ? field.points : 0,
      possiblePoints: field.points,
      rankNameIsCorrect,
      payGradeAnswer,
      payGradeIsCorrect,
      payGradeCorrection,
    }
  }

  if (field.gradingProfile === 'unordered-recitation') {
    return gradeUnorderedList(field, answer)
  }

  if (field.gradingProfile === 'all-or-nothing-composite') {
    return gradeComposite(field, answer, answers)
  }

  const isCorrect =
    field.inputKind === 'four-digit-year'
      ? gradeFourDigitYear(field, answer)
      : field.gradingProfile === 'army-value'
        ? gradeArmyValue(field, answer)
        : field.gradingProfile === 'recitation'
          ? gradeLooseText(field, answer)
          : field.gradingProfile === 'formatted-value'
            ? gradeMilitaryTime(field, answer)
            : field.gradingProfile === 'phonetic'
              ? gradePhoneticAlphabet(field, answer)
              : field.gradingProfile === 'code-article'
                ? gradeCodeArticle(field, answer)
                : field.gradingProfile === 'short-text'
                  ? gradeLooseText(field, answer)
                  : gradeText(field, answer)
  const wordFeedbackAnswer = getWordFeedbackAnswer(field, answer)
  const firstWordDifference =
    !isCorrect && shouldProvideWordDifference(field) && wordFeedbackAnswer !== undefined
      ? getFirstWordDifference(field, wordFeedbackAnswer)
      : undefined

  return {
    fieldId: field.id,
    answer,
    isCorrect,
    correction: field.answer,
    earnedPoints: isCorrect ? field.points : 0,
    possiblePoints: field.points,
    targetedFeedback: firstWordDifference ? { firstWordDifference } : undefined,
  }
}

export function gradeSections(sections: readonly StudySection[], answers: AnswerMap): SectionGrade[] {
  return sections.map((section) => {
    const fields = section.fields.map((field) => {
      return gradeField(
        field,
        answers[field.id] ?? '',
        answers[getRankPayGradeFieldId(field.id)] ?? '',
        answers,
      )
    })
    const correctCount = fields.reduce((count, field) => count + field.earnedPoints, 0)
    const totalCount = fields.reduce((count, field) => count + field.possiblePoints, 0)

    return {
      sectionId: section.id,
      title: section.title,
      fields,
      correctCount,
      totalCount,
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
