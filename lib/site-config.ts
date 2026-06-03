export const siteName = 'Green Book Study Guide'
export const siteShortName = 'Green Book'
export const siteDescription =
  "A local-first Army Green Book study guide for Army Values, the Soldier's Creed, military time, orders, phonetic alphabet, and rank structure."
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://green-book-study-guide.vercel.app'
export const siteTopics = [
  'Army Values',
  "Soldier's Creed",
  'Military Time',
  'General Orders',
  'Special Orders',
  'Phonetic Alphabet',
  'Army Rank Structure',
] as const

export function getSiteUrl(path = '/'): string {
  return new URL(path, siteUrl).toString()
}
