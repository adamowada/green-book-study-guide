import { describe, expect, it } from 'vitest'

import { gradeField } from './grading'
import { greenBookSections, type GreenBookField } from './green-book-content'

function findField(fieldId: string): GreenBookField {
  for (const section of greenBookSections) {
    const field = section.fields.find((candidate) => candidate.id === fieldId)

    if (field) {
      return field
    }
  }

  throw new Error(`Missing test field: ${fieldId}`)
}

describe('gradeField', () => {
  const pfcRank = findField('rank-pfc')
  const nineHundred = findField('military-time-0900')

  it('grades rank answers case-insensitively and punctuation-insensitively', () => {
    expect(gradeField(pfcRank, 'private first class pfc').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'PRIVATE, FIRST-CLASS!! (PFC)').isCorrect).toBe(true)
  })

  it('accepts rank aliases', () => {
    expect(gradeField(pfcRank, 'PFC').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'Private First Class PFC').isCorrect).toBe(true)
  })

  it('requires military time answers to be exact four digits', () => {
    expect(gradeField(nineHundred, '0900').isCorrect).toBe(true)
    expect(gradeField(nineHundred, '900').isCorrect).toBe(false)
    expect(gradeField(nineHundred, '09:00').isCorrect).toBe(false)
    expect(gradeField(nineHundred, '0900 hours').isCorrect).toBe(false)
  })

  it('grades empty answers as incorrect', () => {
    expect(gradeField(pfcRank, '').isCorrect).toBe(false)
    expect(gradeField(nineHundred, '').isCorrect).toBe(false)
  })

  it('returns the canonical answer as the correction', () => {
    const grade = gradeField(pfcRank, 'pfc')

    expect(grade.isCorrect).toBe(true)
    expect(grade.correction).toBe('Private First Class (PFC)')
  })
})
