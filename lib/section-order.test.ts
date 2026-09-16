import { describe, expect, it } from 'vitest'

import { getSectionOrder, shuffleNonIdentity, type SectionOrderItem } from './section-order'

describe('shuffleNonIdentity', () => {
  it('uses Fisher-Yates with an injectable random source', () => {
    const values = [0, 0, 0]
    const random = () => values.shift() ?? 0

    expect(shuffleNonIdentity(['alpha', 'bravo', 'charlie', 'delta'], random)).toEqual([
      'bravo',
      'charlie',
      'delta',
      'alpha',
    ])
    expect(values).toHaveLength(0)
  })

  it('does not mutate its input and returns each item exactly once', () => {
    const items = Object.freeze(['alpha', 'bravo', 'charlie', 'delta'])
    const original = [...items]
    const shuffled = shuffleNonIdentity(items, () => 0)

    expect(items).toEqual(original)
    expect(shuffled).not.toBe(items)
    expect(new Set(shuffled)).toEqual(new Set(items))
    expect(shuffled).toHaveLength(items.length)
  })

  it('guarantees a non-identity result for collections with more than one item', () => {
    const items = ['alpha', 'bravo', 'charlie']

    // A value near one makes every Fisher-Yates swap target itself.
    expect(shuffleNonIdentity(items, () => 0.999999)).toEqual(['bravo', 'alpha', 'charlie'])
  })

  it('leaves empty and single-item collections unchanged', () => {
    expect(shuffleNonIdentity([], () => 0)).toEqual([])
    expect(shuffleNonIdentity(['alpha'], () => 0)).toEqual(['alpha'])
  })

  it('rejects invalid random-source values', () => {
    expect(() => shuffleNonIdentity(['alpha', 'bravo'], () => 1)).toThrow(RangeError)
    expect(() => shuffleNonIdentity(['alpha', 'bravo'], () => Number.NaN)).toThrow(RangeError)
  })
})

describe('getSectionOrder', () => {
  const canonicalItems: readonly SectionOrderItem[] = Object.freeze([
    Object.freeze({ id: 'alpha' }),
    Object.freeze({ id: 'bravo' }),
    Object.freeze({ id: 'charlie' }),
  ])

  it('returns a fresh canonical order when randomization is off', () => {
    const first = getSectionOrder(canonicalItems, false, () => 0)
    const second = getSectionOrder(canonicalItems, false, () => 0.5)

    expect(first).toEqual(['alpha', 'bravo', 'charlie'])
    expect(second).toEqual(first)
    expect(second).not.toBe(first)
    expect(canonicalItems.map((item) => item.id)).toEqual(['alpha', 'bravo', 'charlie'])
  })

  it('returns a unique, non-identity permutation for an ungrouped section', () => {
    const order = getSectionOrder(canonicalItems, true, () => 0.999999)

    expect(order).toEqual(['bravo', 'alpha', 'charlie'])
    expect(new Set(order)).toEqual(new Set(['alpha', 'bravo', 'charlie']))
  })

  it('shuffles within groups while preserving canonical group order', () => {
    const groupedItems: readonly SectionOrderItem[] = Object.freeze([
      Object.freeze({ id: 'background-1', group: 'background' }),
      Object.freeze({ id: 'background-2', group: 'background' }),
      Object.freeze({ id: 'lyrics-1', group: 'lyrics' }),
      Object.freeze({ id: 'lyrics-2', group: 'lyrics' }),
      Object.freeze({ id: 'lyrics-3', group: 'lyrics' }),
    ])

    const order = getSectionOrder(groupedItems, true, () => 0.999999)

    expect(order).toEqual(['background-2', 'background-1', 'lyrics-2', 'lyrics-1', 'lyrics-3'])
    expect(order.slice(0, 2).every((id) => id.startsWith('background-'))).toBe(true)
    expect(order.slice(2).every((id) => id.startsWith('lyrics-'))).toBe(true)
    expect(new Set(order)).toEqual(new Set(groupedItems.map((item) => item.id)))
  })

  it('uses first appearance as canonical group order even when group members are non-contiguous', () => {
    const groupedItems: readonly SectionOrderItem[] = [
      { id: 'lyrics-1', groupId: 'lyrics' },
      { id: 'background-1', groupId: 'background' },
      { id: 'lyrics-2', groupId: 'lyrics' },
      { id: 'background-2', groupId: 'background' },
    ]

    expect(getSectionOrder(groupedItems, true, () => 0.999999)).toEqual([
      'lyrics-2',
      'lyrics-1',
      'background-2',
      'background-1',
    ])
  })

  it('returns the only boundary-preserving order when every group is a singleton', () => {
    const groupedItems: readonly SectionOrderItem[] = [
      { id: 'alpha', groupId: 'one' },
      { id: 'bravo', groupId: 'two' },
    ]

    expect(getSectionOrder(groupedItems, true, () => 0)).toEqual(['alpha', 'bravo'])
  })

  it('rejects duplicate field IDs rather than returning a non-unique order', () => {
    const duplicateItems: readonly SectionOrderItem[] = [{ id: 'alpha' }, { id: 'alpha' }]

    expect(() => getSectionOrder(duplicateItems, true, () => 0)).toThrow('Duplicate ID: alpha')
  })
})
