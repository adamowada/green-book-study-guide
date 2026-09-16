import { describe, expect, it } from 'vitest'

import {
  ADDITIONAL_SECTION_IDS,
  DEFAULT_SECTION_IDS,
  getFieldPartAnswerId,
  greenBookSections,
  type GreenBookSectionId,
} from './green-book-content'

function findSection(sectionId: GreenBookSectionId) {
  const section = greenBookSections.find((candidate) => candidate.id === sectionId)

  if (!section) {
    throw new Error(`Missing test section: ${sectionId}`)
  }

  return section
}

function expectUnique(values: readonly string[], label: string) {
  expect(new Set(values).size, label).toBe(values.length)
}

describe('greenBookSections', () => {
  it('defines the seven default sections and five additional sections in display order', () => {
    expect(DEFAULT_SECTION_IDS).toEqual([
      'army-values',
      'soldiers-creed',
      'military-time',
      'general-orders',
      'special-orders',
      'phonetic-alphabet',
      'rank-structure',
    ])
    expect(ADDITIONAL_SECTION_IDS).toEqual([
      'battle-buddy-system',
      'golden-rules',
      'improper-relationships',
      'national-anthem-army-song',
      'code-of-conduct',
    ])
    expect(greenBookSections.map((section) => section.id)).toEqual([
      ...DEFAULT_SECTION_IDS,
      ...ADDITIONAL_SECTION_IDS,
    ])
    expect(greenBookSections.filter((section) => section.defaultIncluded).map((section) => section.id)).toEqual(
      DEFAULT_SECTION_IDS,
    )
  })

  it('keeps section, field, nested answer, and context identifiers unique', () => {
    const sectionIds = greenBookSections.map((section) => section.id)
    const fieldIds = greenBookSections.flatMap((section) => section.fields.map((field) => field.id))
    const partAnswerIds = greenBookSections.flatMap((section) => {
      return section.fields.flatMap((field) => {
        const partIds = (field.parts ?? []).map((part) => part.id)
        const itemIds = (field.items ?? []).map((item) => item.id)

        expectUnique(partIds, `${field.id} part IDs`)
        expectUnique(itemIds, `${field.id} item IDs`)

        return [
          ...partIds.map((partId) => getFieldPartAnswerId(field.id, partId)),
          ...itemIds.map((itemId) => `${field.id}:item:${itemId}`),
        ]
      })
    })
    const contextIds = greenBookSections.flatMap((section) => section.context?.map((context) => context.id) ?? [])

    expectUnique(sectionIds, 'section IDs')
    expectUnique(fieldIds, 'field IDs')
    expectUnique(partAnswerIds, 'derived nested answer IDs')
    expectUnique(contextIds, 'context IDs')
  })

  it('defines the exact new-section card and point inventory', () => {
    const expectedInventory: ReadonlyArray<[GreenBookSectionId, number, number]> = [
      ['battle-buddy-system', 1, 8],
      ['golden-rules', 5, 5],
      ['improper-relationships', 3, 3],
      ['national-anthem-army-song', 23, 23],
      ['code-of-conduct', 6, 6],
    ]

    for (const [sectionId, fieldCount, pointCount] of expectedInventory) {
      const section = findSection(sectionId)

      expect(section.fields, `${sectionId} cards`).toHaveLength(fieldCount)
      expect(
        section.fields.reduce((total, field) => total + field.points, 0),
        `${sectionId} points`,
      ).toBe(pointCount)
      expect(section.defaultIncluded, `${sectionId} default selection`).toBe(false)
    }

    const additionalSections = ADDITIONAL_SECTION_IDS.map(findSection)
    expect(additionalSections.flatMap((section) => section.fields)).toHaveLength(38)
    expect(
      additionalSections.flatMap((section) => section.fields).reduce((total, field) => total + field.points, 0),
    ).toBe(45)
    expect(
      greenBookSections.flatMap((section) => section.fields).reduce((total, field) => total + field.points, 0),
    ).toBe(149)
  })

  it('inherits declarative legacy field profiles through the section helper', () => {
    const expectedProfiles = {
      'army-values': ['text', 'army-value'],
      'soldiers-creed': ['textarea', 'recitation'],
      'military-time': ['text', 'formatted-value'],
      'general-orders': ['textarea', 'recitation'],
      'special-orders': ['textarea', 'recitation'],
      'phonetic-alphabet': ['text', 'phonetic'],
      'rank-structure': ['composite', 'rank-identification'],
    } as const

    for (const sectionId of DEFAULT_SECTION_IDS) {
      const [inputKind, gradingProfile] = expectedProfiles[sectionId]

      for (const field of findSection(sectionId).fields) {
        expect(field.inputKind, field.id).toBe(inputKind)
        expect(field.gradingProfile, field.id).toBe(gradingProfile)
        expect(field.points, field.id).toBe(1)
      }
    }
  })

  it('models the Battle Buddy responsibilities as an eight-point unordered list', () => {
    const [field] = findSection('battle-buddy-system').fields

    expect(field).toMatchObject({
      id: 'battle-buddy-responsibilities',
      inputKind: 'unordered-list',
      gradingProfile: 'unordered-recitation',
      points: 8,
      rowCount: 8,
      listScoring: 'per-item',
    })
    expect(field.items).toHaveLength(8)
    expect(field.items?.[1]?.answer).toContain('(If it happens, report it)')
  })

  it('models each Golden Rule as a paired all-or-nothing card', () => {
    const fields = findSection('golden-rules').fields

    for (const [index, field] of fields.entries()) {
      expect(field.id).toBe(`golden-rule-${index + 1}`)
      expect(field.inputKind).toBe('composite')
      expect(field.gradingProfile).toBe('all-or-nothing-composite')
      expect(field.points).toBe(1)
      expect(field.parts?.map((part) => part.id)).toEqual(['do-not', 'do'])
      expect(field.parts?.map((part) => part.label)).toEqual(['DO NOT', 'DO'])
    }
  })

  it('keeps administrative form details out of graded Improper Relationships content', () => {
    const section = findSection('improper-relationships')
    const gradedContent = section.fields.flatMap((field) => [
      field.id,
      field.prompt,
      field.answer,
      ...(field.aliases ?? []),
      ...(field.parts ?? []).flatMap((part) => [part.id, part.label, part.answer, ...(part.aliases ?? [])]),
      ...(field.items ?? []).flatMap((item) => [item.id, item.answer, ...(item.aliases ?? [])]),
    ])

    expect(section.fields).toHaveLength(3)
    expect(gradedContent.join(' ')).not.toMatch(/dd\s*form/iu)
    expect(section.context).toEqual([
      {
        id: 'improper-relationships-awareness-note',
        title: 'For awareness',
        text: 'Trainees sign a written acknowledgment of these rules; trainers complete a separate acknowledgment.',
      },
    ])
  })

  it('keeps all Anthem and Army Song fields inside the four approved groups', () => {
    const section = findSection('national-anthem-army-song')
    const groupCounts = Object.fromEntries(
      section.groups?.map((group) => [
        group.id,
        section.fields.filter((field) => field.group === group.id).length,
      ]) ?? [],
    )

    expect(groupCounts).toEqual({
      'national-anthem-background': 5,
      'national-anthem-lyrics': 6,
      'army-song-background': 5,
      'army-song-lyrics': 7,
    })
    expect(section.fields.every((field) => Boolean(field.group))).toBe(true)
    expect(
      section.fields.filter((field) => field.inputKind === 'four-digit-year').map((field) => field.answer),
    ).toEqual(['1814', '1908', '1952'])
  })

  it('defines six independently scored Code of Conduct articles with matching label sets', () => {
    const fields = findSection('code-of-conduct').fields
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI']

    expect(fields).toHaveLength(6)
    for (const [index, field] of fields.entries()) {
      expect(field.id).toBe(`code-of-conduct-article-${index + 1}`)
      expect(field.prompt).toBe(`Article ${romanNumerals[index]}`)
      expect(field.inputKind).toBe('textarea')
      expect(field.gradingProfile).toBe('code-article')
      expect(field.points).toBe(1)
      expect(field.acceptedLeadingLabels).toEqual([
        `${String.fromCharCode(97 + index)}.`,
        `${index + 1}`,
        `Article ${romanNumerals[index]}`,
      ])
    }
  })

  it('keeps the exact General Order 3 canonical answer, alias, and neutral grading note', () => {
    const field = findSection('general-orders').fields.find((candidate) => candidate.id === 'general-order-3')

    expect(field).toMatchObject({
      answer:
        'I will report violations of my special orders, emergencies, and anything not covered in my instructions to the commander of relief.',
      aliases: [
        'I will report violations of my special orders, emergencies, and anything not covered in my instructions to the commander of the relief.',
      ],
      postGradeNote:
        'Wording note: Official Army publications use both “commander of relief” and “commander of the relief.” Both are accepted here; use the version your cadre teaches.',
    })
  })
})
