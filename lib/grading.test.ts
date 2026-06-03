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
  const loyalty = findField('army-values-loyalty')
  const selflessService = findField('army-values-selfless-service')
  const soldiersCreedLine1 = findField('soldiers-creed-1')
  const generalOrder2 = findField('general-order-2')
  const specialOrders = findField('special-orders-definition')
  const fourteenHundred = findField('military-time-1400')
  const alpha = findField('phonetic-a')
  const xray = findField('phonetic-x')
  const pfcRank = findField('rank-pfc')

  it('grades Army Values case-insensitively with no whitespace and only an optional final period', () => {
    expect(gradeField(loyalty, 'loyalty').isCorrect).toBe(true)
    expect(gradeField(loyalty, 'LOYALTY.').isCorrect).toBe(true)
    expect(gradeField(selflessService, 'SelflessService').isCorrect).toBe(true)
    expect(gradeField(selflessService, 'SelflessService.').isCorrect).toBe(true)
    expect(gradeField(selflessService, 'Selfless Service').isCorrect).toBe(false)
    expect(gradeField(loyalty, 'Loyalty ').isCorrect).toBe(false)
    expect(gradeField(loyalty, 'Loyalty!').isCorrect).toBe(false)
    expect(gradeField(loyalty, 'Loyal.ty').isCorrect).toBe(false)
  })

  it("grades Soldier's Creed case-insensitively, whitespace-insensitively, and punctuation-insensitively", () => {
    expect(gradeField(soldiersCreedLine1, 'i am an american soldier').isCorrect).toBe(true)
    expect(gradeField(soldiersCreedLine1, 'I AM AN AMERICAN SOLDIER!!!').isCorrect).toBe(true)
    expect(gradeField(soldiersCreedLine1, 'IamanAmericanSoldier').isCorrect).toBe(true)
    expect(gradeField(soldiersCreedLine1, 'I am an American sailor').isCorrect).toBe(false)
  })

  it('grades General Orders and Special Orders without case, whitespace, or punctuation sensitivity', () => {
    expect(
      gradeField(generalOrder2, 'iwillobeymyspecialordersandperformallmydutiesinamilitarymanner').isCorrect,
    ).toBe(true)
    expect(
      gradeField(generalOrder2, 'I WILL obey my special orders, and perform all my duties in a military manner!!!')
        .isCorrect,
    ).toBe(true)
    expect(
      gradeField(specialOrders, 'additional requirements or instructions that augment the general orders').isCorrect,
    ).toBe(true)
    expect(gradeField(specialOrders, 'additional requirements that augment the general orders').isCorrect).toBe(false)
  })

  it('accepts only the allowed military time answer forms', () => {
    expect(gradeField(fourteenHundred, '1400').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400Z').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400 hours').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400 hrs').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400z').isCorrect).toBe(false)
    expect(gradeField(fourteenHundred, '1400 HOURS').isCorrect).toBe(false)
    expect(gradeField(fourteenHundred, ' 1400').isCorrect).toBe(false)
    expect(gradeField(fourteenHundred, '14:00').isCorrect).toBe(false)
  })

  it('grades the phonetic alphabet case-insensitively while rejecting whitespace and punctuation', () => {
    expect(gradeField(alpha, 'alpha').isCorrect).toBe(true)
    expect(gradeField(alpha, 'ALPHA').isCorrect).toBe(true)
    expect(gradeField(xray, 'xray').isCorrect).toBe(true)
    expect(gradeField(xray, 'x-ray').isCorrect).toBe(false)
    expect(gradeField(xray, 'x ray').isCorrect).toBe(false)
    expect(gradeField(alpha, 'alpha.').isCorrect).toBe(false)
  })

  it('grades rank answers without case, whitespace, or punctuation sensitivity', () => {
    expect(gradeField(pfcRank, 'privatefirstclasspfc').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'PRIVATE, FIRST-CLASS!! (PFC)').isCorrect).toBe(true)
  })

  it('accepts any rank combination of written rank and abbreviation', () => {
    expect(gradeField(pfcRank, 'PFC').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'Private First Class').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'Private First Class PFC').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'PFC Private First Class').isCorrect).toBe(true)
  })

  it('grades empty answers as incorrect', () => {
    expect(gradeField(loyalty, '').isCorrect).toBe(false)
    expect(gradeField(soldiersCreedLine1, '').isCorrect).toBe(false)
    expect(gradeField(fourteenHundred, '').isCorrect).toBe(false)
    expect(gradeField(alpha, '').isCorrect).toBe(false)
    expect(gradeField(pfcRank, '').isCorrect).toBe(false)
  })

  it('returns the canonical answer as the correction', () => {
    const grade = gradeField(pfcRank, 'pfc')

    expect(grade.isCorrect).toBe(true)
    expect(grade.correction).toBe('Private First Class (PFC)')
  })
})
