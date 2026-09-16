import { describe, expect, it } from 'vitest'

import { gradeField, gradeModeAnswers, gradeSections } from './grading'
import {
  ADDITIONAL_SECTION_IDS,
  getFieldPartAnswerId,
  greenBookSections,
  type GreenBookField,
  type GreenBookSection,
  type GreenBookSectionId,
} from './green-book-content'
import type { AnswerMap } from './study-types'

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

function findSection(sectionId: GreenBookSectionId): GreenBookSection {
  const section = greenBookSections.find((candidate) => candidate.id === sectionId)

  if (!section) {
    throw new Error(`Missing test section: ${sectionId}`)
  }

  return section
}

function canonicalPartAnswers(field: GreenBookField): AnswerMap {
  return Object.fromEntries(
    (field.parts ?? []).map((part) => [getFieldPartAnswerId(field.id, part.id), part.answer]),
  )
}

function gradeWithParts(field: GreenBookField, answers: AnswerMap) {
  return gradeField(field, '', '', answers)
}

describe('gradeField', () => {
  const loyalty = findField('army-values-loyalty')
  const selflessService = findField('army-values-selfless-service')
  const soldiersCreedLine1 = findField('soldiers-creed-1')
  const generalOrder2 = findField('general-order-2')
  const generalOrder3 = findField('general-order-3')
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

  it('accepts both official endings for General Order 3', () => {
    expect(gradeField(generalOrder3, generalOrder3.answer).isCorrect).toBe(true)
    expect(
      gradeField(
        generalOrder3,
        'I will report violations of my special orders, emergencies, and anything not covered in my instructions to the commander of the relief.',
      ).isCorrect,
    ).toBe(true)
    expect(
      gradeField(
        generalOrder3,
        'I will report violations of my special orders, emergencies, and anything not covered in my instructions to the commander.',
      ).isCorrect,
    ).toBe(false)
  })

  it('accepts documented military-time suffixes without case or surrounding-whitespace sensitivity', () => {
    expect(gradeField(fourteenHundred, '1400').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400Z').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400 hours').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400 hrs').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400z').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400 HOURS').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, ' 1400 ').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '1400 hRs').isCorrect).toBe(true)
    expect(gradeField(fourteenHundred, '14:00').isCorrect).toBe(false)
    expect(gradeField(fourteenHundred, '1400 UTC').isCorrect).toBe(false)
    expect(gradeField(fourteenHundred, '1400 Z').isCorrect).toBe(false)
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

describe('declarative grading profiles', () => {
  it('grades every canonical nested part and unordered-list item', () => {
    for (const section of greenBookSections) {
      for (const field of section.fields) {
        const grade = field.parts?.length
          ? gradeWithParts(field, canonicalPartAnswers(field))
          : gradeWithCanonicalPayGrade(field, field.answer)

        expect(grade.isCorrect, field.id).toBe(true)
        expect(grade.earnedPoints, field.id).toBe(field.points)
        expect(grade.possiblePoints, field.id).toBe(field.points)
      }
    }
  })

  it('accepts every nested part and unordered-list item alias', () => {
    for (const section of greenBookSections) {
      for (const field of section.fields) {
        for (const part of field.parts ?? []) {
          for (const alias of part.aliases ?? []) {
            const answers = canonicalPartAnswers(field)
            answers[getFieldPartAnswerId(field.id, part.id)] = alias

            expect(gradeWithParts(field, answers).isCorrect, `${field.id}:${part.id}: ${alias}`).toBe(true)
          }
        }

        for (const [itemIndex, item] of (field.items ?? []).entries()) {
          for (const alias of item.aliases ?? []) {
            const answers = (field.items ?? []).map((candidate, index) => {
              return index === itemIndex ? alias : candidate.answer
            })

            expect(gradeField(field, answers.join('\n')).isCorrect, `${field.id}:${item.id}: ${alias}`).toBe(true)
          }
        }
      }
    }
  })

  it('uses strict four-digit-year grading for standalone and composite year inputs', () => {
    const standaloneYear = findField('army-song-written-year')
    const composite = findField('national-anthem-military-occasions')
    const yearPartId = getFieldPartAnswerId(composite.id, 'year')
    const answers = canonicalPartAnswers(composite)

    expect(gradeField(standaloneYear, ' 1908 ').isCorrect).toBe(true)
    expect(gradeField(standaloneYear, '08').isCorrect).toBe(false)
    expect(gradeField(standaloneYear, '1,908').isCorrect).toBe(false)
    expect(gradeField(standaloneYear, '1908 AD').isCorrect).toBe(false)
    expect(gradeField(standaloneYear, '1918').isCorrect).toBe(false)

    answers[yearPartId] = ' 1916 '
    expect(gradeWithParts(composite, answers).isCorrect).toBe(true)
    answers[yearPartId] = '1,916'
    expect(gradeWithParts(composite, answers).isCorrect).toBe(false)
  })
})

describe('new memorization sections', () => {
  it('grades Battle Buddy responsibilities as distinct unordered items', () => {
    const field = findField('battle-buddy-responsibilities')
    const items = field.items ?? []
    const reversedWithPrefixes = [...items]
      .reverse()
      .map((item, index) => `${index + 1}. ${item.answer}`)
      .join('\n')
    const completeGrade = gradeField(field, reversedWithPrefixes)

    expect(completeGrade).toMatchObject({
      isCorrect: true,
      earnedPoints: 8,
      possiblePoints: 8,
      missingItems: [],
    })
    expect(completeGrade.partGrades?.every((part) => part.isCorrect)).toBe(true)

    const withExtraDuplicate = `${field.answer}\n- ${items[0]?.answer ?? ''}`
    expect(gradeField(field, withExtraDuplicate)).toMatchObject({
      isCorrect: true,
      earnedPoints: 8,
    })

    const withUnrelatedExtra = `${field.answer}\n- This is not a responsibility.`
    expect(gradeField(field, withUnrelatedExtra)).toMatchObject({
      isCorrect: true,
      earnedPoints: 8,
    })

    const duplicateReplacingLast = [...items.slice(0, -1), items[0]].map((item) => item?.answer ?? '').join('\n')
    const duplicateGrade = gradeField(field, duplicateReplacingLast)
    expect(duplicateGrade.earnedPoints).toBe(7)
    expect(duplicateGrade.missingItems).toEqual([items.at(-1)?.answer])
    expect(duplicateGrade.targetedFeedback).toBeUndefined()

    const missingReportingInstruction = field.answer.replace(' (If it happens, report it)', '')
    const incompleteGrade = gradeField(field, missingReportingInstruction)
    expect(incompleteGrade.earnedPoints).toBe(7)
    expect(incompleteGrade.missingItems).toContain(items[1]?.answer)
    expect(incompleteGrade.targetedFeedback?.closestIncompleteListItem).toEqual({
      submitted: items[1]?.answer.replace(' (If it happens, report it)', ''),
      expected: items[1]?.answer,
    })

    const unrelatedGrade = gradeField(field, 'Stay with your buddy.')
    expect(unrelatedGrade.earnedPoints).toBe(0)
    expect(unrelatedGrade.targetedFeedback).toBeUndefined()
  })

  it('grades each Golden Rule pair all-or-nothing while retaining per-part feedback', () => {
    const rule1 = findField('golden-rule-1')
    const rule2 = findField('golden-rule-2')
    const completeAnswers = canonicalPartAnswers(rule1)
    const completeGrade = gradeWithParts(rule1, completeAnswers)

    expect(completeGrade).toMatchObject({ isCorrect: true, earnedPoints: 1, possiblePoints: 1 })
    expect(completeGrade.partGrades?.map((part) => part.isCorrect)).toEqual([true, true])

    const partialAnswers = { ...completeAnswers, [getFieldPartAnswerId(rule1.id, 'do')]: '' }
    const partialGrade = gradeWithParts(rule1, partialAnswers)
    expect(partialGrade).toMatchObject({ isCorrect: false, earnedPoints: 0, possiblePoints: 1 })
    expect(partialGrade.partGrades?.map((part) => part.isCorrect)).toEqual([true, false])

    const swappedAnswers = {
      ...completeAnswers,
      [getFieldPartAnswerId(rule1.id, 'do')]: rule2.parts?.find((part) => part.id === 'do')?.answer ?? '',
    }
    expect(gradeWithParts(rule1, swappedAnswers).isCorrect).toBe(false)
  })

  it('grades the three Improper Relationships concepts without vague substitutions', () => {
    const categories = findField('improper-relationships-categories')
    const mission = findField('improper-relationships-training-mission')
    const consent = findField('improper-relationships-no-consensual')

    expect(gradeField(categories, 'Trainee/Trainee\nCadre Trainee').isCorrect).toBe(true)

    const extraCategory = gradeField(categories, 'Trainee/Trainee\nCadre Trainee\nOfficer-Enlisted')
    expect(extraCategory).toMatchObject({ isCorrect: false, earnedPoints: 0, possiblePoints: 1 })
    expect(extraCategory.targetedFeedback?.unexpectedListItems).toEqual(['Officer-Enlisted'])

    const repeatedCategory = gradeField(categories, 'Trainee/Trainee\nCadre Trainee\nCadre-Trainee')
    expect(repeatedCategory).toMatchObject({ isCorrect: false, earnedPoints: 0, possiblePoints: 1 })
    expect(repeatedCategory.targetedFeedback?.unexpectedListItems).toEqual(['Cadre-Trainee'])

    const oneCategory = gradeField(categories, 'Cadre-Trainee')
    expect(oneCategory).toMatchObject({ isCorrect: false, earnedPoints: 0, possiblePoints: 1 })
    expect(oneCategory.partGrades?.map((part) => part.isCorrect)).toEqual([true, false])

    expect(gradeField(mission, mission.answer).isCorrect).toBe(true)
    expect(gradeField(mission, 'official business').isCorrect).toBe(false)
    expect(gradeField(consent, consent.answer).isCorrect).toBe(true)
    expect(gradeField(consent, consent.answer.replace('no consensual', 'consensual')).isCorrect).toBe(false)
    expect(gradeField(consent, consent.answer.replace(' or between Trainee-Trainee', '')).isCorrect).toBe(false)
    expect(
      gradeField(consent, consent.answer.replace('cadre/permanent party - Trainee', 'Trainee - cadre/permanent party'))
        .isCorrect,
    ).toBe(false)
  })

  it('accepts only the documented anthem and song lyric variants', () => {
    const anthem3 = findField('national-anthem-lyrics-3')
    const anthem4 = findField('national-anthem-lyrics-4')
    const anthem6 = findField('national-anthem-lyrics-6')
    const army7 = findField('army-song-lyrics-7')

    expect(gradeField(anthem3, anthem3.aliases?.[0] ?? '').isCorrect).toBe(true)
    expect(gradeField(anthem4, anthem4.aliases?.[0] ?? '').isCorrect).toBe(true)
    expect(gradeField(anthem6, anthem6.aliases?.[0] ?? '').isCorrect).toBe(true)
    expect(gradeField(army7, army7.aliases?.[0] ?? '').isCorrect).toBe(true)

    expect(gradeField(anthem3, anthem3.answer.replace("thro'", 'thru')).isCorrect).toBe(false)
    expect(gradeField(army7, army7.answer.replace("where e'er", 'wherever')).isCorrect).toBe(false)
    expect(gradeField(anthem4, anthem4.answer.replace('gallantly streaming', 'streaming gallantly')).isCorrect).toBe(
      false,
    )
  })

  it('identifies the first lyric or long-article word that needs attention', () => {
    const anthemLine1 = findField('national-anthem-lyrics-1')
    const anthemLine2 = findField('national-anthem-lyrics-2')
    const anthemLine4 = findField('national-anthem-lyrics-4')
    const article1 = findField('code-of-conduct-article-1')
    const article4 = findField('code-of-conduct-article-4')

    expect(gradeField(anthemLine1, anthemLine1.answer.replace('you ', '')).targetedFeedback?.firstWordDifference).toEqual(
      {
        kind: 'missing',
        wordIndex: 3,
        expectedWord: 'you',
      },
    )
    expect(gradeField(anthemLine2, anthemLine2.answer.replace('hailed', 'sang')).targetedFeedback?.firstWordDifference).toEqual(
      {
        kind: 'different',
        wordIndex: 4,
        expectedWord: 'hailed',
        submittedWord: 'sang',
      },
    )
    expect(
      gradeField(anthemLine4, 'Over the ramparts we watched were so gallantly flowing.').targetedFeedback
        ?.firstWordDifference,
    ).toEqual({
      kind: 'different',
      wordIndex: 8,
      expectedWord: 'streaming',
      submittedWord: 'flowing',
    })

    expect(
      gradeField(article4, `Article IV ${article4.answer.replace('keep faith', 'keep trust')}`).targetedFeedback
        ?.firstWordDifference,
    ).toEqual({
      kind: 'different',
      wordIndex: 10,
      expectedWord: 'faith',
      submittedWord: 'trust',
    })
    expect(
      gradeField(article4, article4.answer.replace('give no information', 'give information')).targetedFeedback
        ?.firstWordDifference,
    ).toMatchObject({ kind: 'missing', expectedWord: 'no' })
    expect(gradeField(article4, `Article V ${article4.answer}`).targetedFeedback).toBeUndefined()
    expect(gradeField(article1, article1.answer.replace('American', 'citizen')).targetedFeedback).toBeUndefined()
  })

  it('requires every part of anthem and song background composites', () => {
    const author = findField('army-song-author')
    const canonicalAnswers = canonicalPartAnswers(author)
    const authorPartId = getFieldPartAnswerId(author.id, 'author')
    const branchPartId = getFieldPartAnswerId(author.id, 'branch')

    canonicalAnswers[authorPartId] = '1LT Edmund L. Gruber'
    expect(gradeWithParts(author, canonicalAnswers).isCorrect).toBe(true)

    canonicalAnswers[branchPartId] = ''
    const partialGrade = gradeWithParts(author, canonicalAnswers)
    expect(partialGrade.earnedPoints).toBe(0)
    expect(partialGrade.partGrades?.map((part) => part.isCorrect)).toEqual([true, false])

    canonicalAnswers[authorPartId] = 'Lieutenant Gruber'
    canonicalAnswers[branchPartId] = 'Field Artillery'
    expect(gradeWithParts(author, canonicalAnswers).isCorrect).toBe(false)
  })

  it('handles optional matching Code Article labels and rejects mismatched labels', () => {
    const fields = findSection('code-of-conduct').fields

    for (const [index, field] of fields.entries()) {
      expect(gradeField(field, field.answer).isCorrect, `${field.id}: unlabeled`).toBe(true)

      for (const label of field.acceptedLeadingLabels ?? []) {
        expect(gradeField(field, `${label} ${field.answer}`).isCorrect, `${field.id}: ${label}`).toBe(true)
      }

      const mismatchedLabel = fields[(index + 1) % fields.length]?.acceptedLeadingLabels?.[2] ?? ''
      expect(gradeField(field, `${mismatchedLabel} ${field.answer}`).isCorrect, `${field.id}: mismatched`).toBe(
        false,
      )
    }

    const article1 = findField('code-of-conduct-article-1')
    const article3 = findField('code-of-conduct-article-3')
    expect(gradeField(article1, article1.answer).isCorrect).toBe(true)
    expect(gradeField(article3, article3.aliases?.[0] ?? '').isCorrect).toBe(true)
    expect(gradeField(article1, article1.answer.replace('prepared to give', 'prepared give')).isCorrect).toBe(false)
  })
})

describe('weighted grading aggregation', () => {
  it('uses points rather than card count for section and overall totals', () => {
    const battleSection = findSection('battle-buddy-system')
    const goldenRule = findField('golden-rule-1')
    const combinedSection: GreenBookSection = {
      ...battleSection,
      title: 'Weighted test section',
      fields: [battleSection.fields[0]!, goldenRule],
    }
    const battleField = battleSection.fields[0]!
    const answers: AnswerMap = {
      [battleField.id]: (battleField.items ?? [])
        .slice(0, -1)
        .map((item) => item.answer)
        .join('\n'),
      [getFieldPartAnswerId(goldenRule.id, 'do-not')]: goldenRule.parts?.[0]?.answer ?? '',
      [getFieldPartAnswerId(goldenRule.id, 'do')]: '',
    }
    const [grade] = gradeSections([combinedSection], answers)

    expect(grade).toMatchObject({ correctCount: 7, totalCount: 9 })
    expect(grade?.fields.map((field) => [field.earnedPoints, field.possiblePoints])).toEqual([
      [7, 8],
      [0, 1],
    ])
  })

  it('grades all five additional sections as a 45-point quiz', () => {
    const sections = ADDITIONAL_SECTION_IDS.map(findSection)
    const answers: AnswerMap = {}

    for (const section of sections) {
      for (const field of section.fields) {
        if (field.parts?.length) {
          Object.assign(answers, canonicalPartAnswers(field))
        } else {
          answers[field.id] = field.answer
        }
      }
    }

    const grade = gradeModeAnswers(sections, answers, 'hard')
    expect(grade).toMatchObject({ correctCount: 45, totalCount: 45 })
    expect(grade.sections.map((section) => section.sectionId)).toEqual(ADDITIONAL_SECTION_IDS)
  })

  it('keeps grades associated with stable field IDs when field order changes', () => {
    const section = findSection('golden-rules')
    const reversedSection: GreenBookSection = { ...section, fields: [...section.fields].reverse() }
    const answers = Object.fromEntries(
      section.fields.flatMap((field) => {
        return (field.parts ?? []).map((part) => [getFieldPartAnswerId(field.id, part.id), part.answer])
      }),
    )
    const grade = gradeModeAnswers([reversedSection], answers, 'easy')

    expect(grade).toMatchObject({ correctCount: 5, totalCount: 5 })
    expect(Object.keys(grade.fieldsById).sort()).toEqual(section.fields.map((field) => field.id).sort())
  })
})
