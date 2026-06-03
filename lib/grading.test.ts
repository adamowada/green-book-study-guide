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

function gradeWithCanonicalPayGrade(field: GreenBookField, answer: string) {
  return gradeField(field, answer, field.payGrade ?? '')
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
  const pvtRank = findField('rank-pvt')
  const pv2Rank = findField('rank-pv2')
  const pfcRank = findField('rank-pfc')

  it('accepts every canonical answer in the content data', () => {
    for (const section of greenBookSections) {
      for (const field of section.fields as readonly GreenBookField[]) {
        expect(gradeWithCanonicalPayGrade(field, field.answer).isCorrect, field.id).toBe(true)
      }
    }
  })

  it('accepts every declared alias in the content data', () => {
    for (const section of greenBookSections) {
      for (const field of section.fields as readonly GreenBookField[]) {
        for (const alias of field.aliases ?? []) {
          expect(gradeWithCanonicalPayGrade(field, alias).isCorrect, `${field.id}: ${alias}`).toBe(true)
        }
      }
    }
  })

  it('grades Army Values case-insensitively, whitespace-insensitively, and with only an optional final period', () => {
    expect(gradeField(loyalty, 'loyalty').isCorrect).toBe(true)
    expect(gradeField(loyalty, ' LOYALTY. ').isCorrect).toBe(true)
    expect(gradeField(selflessService, 'SelflessService').isCorrect).toBe(true)
    expect(gradeField(selflessService, 'Selfless Service').isCorrect).toBe(true)
    expect(gradeField(selflessService, ' Selfless   Service. ').isCorrect).toBe(true)
    expect(gradeField(loyalty, 'Loyalty!').isCorrect).toBe(false)
    expect(gradeField(loyalty, 'Loyal.ty').isCorrect).toBe(false)
    expect(gradeField(selflessService, 'Selfless-Service').isCorrect).toBe(false)
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

  it('grades phonetic alphabet answers case-insensitively while rejecting internal whitespace', () => {
    expect(gradeField(alpha, 'alpha').isCorrect).toBe(true)
    expect(gradeField(alpha, ' ALPHA ').isCorrect).toBe(true)
    expect(gradeField(alpha, 'a lpha').isCorrect).toBe(false)
    expect(gradeField(alpha, 'alpha.').isCorrect).toBe(false)
  })

  it('accepts X-RAY with or without its official hyphen and rejects other X punctuation', () => {
    expect(gradeField(xray, 'xray').isCorrect).toBe(true)
    expect(gradeField(xray, 'x-ray').isCorrect).toBe(true)
    expect(gradeField(xray, ' X-RAY ').isCorrect).toBe(true)
    expect(gradeField(xray, 'x ray').isCorrect).toBe(false)
    expect(gradeField(xray, 'x.ray').isCorrect).toBe(false)
  })

  it('grades rank names without case, whitespace, or punctuation sensitivity when pay grade is correct', () => {
    expect(gradeField(pfcRank, 'privatefirstclasspfc', 'E-3').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'PRIVATE, FIRST-CLASS!! (PFC)', 'e3').isCorrect).toBe(true)
  })

  it('accepts any rank combination of written rank and abbreviation with the matching pay grade', () => {
    expect(gradeField(pfcRank, 'PFC', 'E-3').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'Private First Class', 'E3').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'Private First Class PFC', 'e-3').isCorrect).toBe(true)
    expect(gradeField(pfcRank, 'PFC Private First Class', 'e3').isCorrect).toBe(true)
  })

  it('uses pay grade to disambiguate duplicate Private rank names', () => {
    expect(gradeField(pvtRank, 'Private', 'E-1').isCorrect).toBe(true)
    expect(gradeField(pv2Rank, 'Private', 'E-2').isCorrect).toBe(true)
    expect(gradeField(pvtRank, 'PVT', 'E1').isCorrect).toBe(true)
    expect(gradeField(pv2Rank, 'PV2', 'E2').isCorrect).toBe(true)
    expect(gradeField(pvtRank, 'Private', 'E-2').isCorrect).toBe(false)
    expect(gradeField(pv2Rank, 'Private', 'E-1').isCorrect).toBe(false)
  })

  it('rejects rank answers with missing, wrong, whitespace, or extra-punctuation pay grades', () => {
    expect(gradeField(pfcRank, 'PFC', '').isCorrect).toBe(false)
    expect(gradeField(pfcRank, 'PFC', 'E-4').isCorrect).toBe(false)
    expect(gradeField(pfcRank, 'PFC', 'E 3').isCorrect).toBe(false)
    expect(gradeField(pfcRank, 'PFC', 'E--3').isCorrect).toBe(false)
  })

  it('grades empty answers as incorrect', () => {
    expect(gradeField(loyalty, '').isCorrect).toBe(false)
    expect(gradeField(soldiersCreedLine1, '').isCorrect).toBe(false)
    expect(gradeField(fourteenHundred, '').isCorrect).toBe(false)
    expect(gradeField(alpha, '').isCorrect).toBe(false)
    expect(gradeField(pfcRank, '', '').isCorrect).toBe(false)
  })

  it('returns the canonical answer and pay grade as the rank correction', () => {
    const grade = gradeField(pfcRank, 'pfc', 'E-4')

    expect(grade.isCorrect).toBe(false)
    expect(grade.rankNameIsCorrect).toBe(true)
    expect(grade.payGradeIsCorrect).toBe(false)
    expect(grade.correction).toBe('Private First Class (PFC), Pay Grade: E-3')
  })
})
