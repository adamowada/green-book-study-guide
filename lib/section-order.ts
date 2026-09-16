export type RandomSource = () => number

export type SectionOrderItem = Readonly<{
  id: string
  group?: string | null
  groupId?: string | null
}>

const UNGROUPED = Symbol('ungrouped')

function getRandomIndex(random: RandomSource, upperBound: number): number {
  const value = random()

  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('The random source must return a finite number in the range [0, 1).')
  }

  return Math.floor(value * upperBound)
}

function isIdentityPermutation<T>(canonical: readonly T[], shuffled: readonly T[]): boolean {
  return canonical.every((item, index) => item === shuffled[index])
}

/**
 * Returns a Fisher-Yates permutation without mutating the input.
 *
 * For collections with more than one item, the result is guaranteed to differ
 * from the input order. This prevents a successful randomize action from
 * appearing to do nothing when Fisher-Yates happens to produce the identity
 * permutation.
 */
export function shuffleNonIdentity<T>(items: readonly T[], random: RandomSource = Math.random): T[] {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = getRandomIndex(random, index + 1)
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  if (shuffled.length > 1 && isIdentityPermutation(items, shuffled)) {
    ;[shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]]
  }

  return shuffled
}

function assertUniqueIds(items: readonly SectionOrderItem[]): void {
  const seenIds = new Set<string>()

  for (const item of items) {
    if (seenIds.has(item.id)) {
      throw new Error(`Section order item IDs must be unique. Duplicate ID: ${item.id}`)
    }

    seenIds.add(item.id)
  }
}

function groupItems(items: readonly SectionOrderItem[]): SectionOrderItem[][] {
  const groups = new Map<string | typeof UNGROUPED, SectionOrderItem[]>()

  for (const item of items) {
    const groupKey = item.group ?? item.groupId ?? UNGROUPED
    const group = groups.get(groupKey)

    if (group) {
      group.push(item)
    } else {
      groups.set(groupKey, [item])
    }
  }

  return [...groups.values()]
}

/**
 * Returns the field IDs in either canonical or randomized display order.
 *
 * Items with the same `group` are shuffled only among themselves. `groupId` is
 * accepted as an alias for callers whose model uses that spelling. Groups
 * retain the order in which they first appear in the canonical input. Items
 * without a group share one default group, which keeps the common ungrouped
 * case fully randomizable.
 *
 * When grouping leaves every group with one item, canonical order is the only
 * order that can preserve those group boundaries.
 */
export function getSectionOrder(
  items: readonly SectionOrderItem[],
  randomized: boolean,
  random: RandomSource = Math.random,
): string[] {
  assertUniqueIds(items)

  if (!randomized) {
    return items.map((item) => item.id)
  }

  return groupItems(items).flatMap((group) => shuffleNonIdentity(group, random).map((item) => item.id))
}
