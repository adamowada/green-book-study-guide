import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { greenBookSections } from './green-book-content'

const ranksDirectory = new URL('../public/ranks/', import.meta.url)
const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

type PngMetadata = {
  colorType: number
  chunks: string[]
}

function getRankPngFiles(): string[] {
  return readdirSync(ranksDirectory)
    .filter((filename) => filename.endsWith('.png'))
    .sort((left, right) => left.localeCompare(right))
}

function readPngMetadata(filename: string): PngMetadata {
  const buffer = readFileSync(new URL(filename, ranksDirectory))

  expect(buffer.subarray(0, pngSignature.length).equals(pngSignature)).toBe(true)

  let offset = pngSignature.length
  let colorType: number | null = null
  const chunks: string[] = []

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const chunkType = buffer.toString('ascii', offset + 4, offset + 8)
    const dataOffset = offset + 8

    chunks.push(chunkType)

    if (chunkType === 'IHDR') {
      colorType = buffer[dataOffset + 9]
    }

    offset = dataOffset + length + 4
  }

  if (colorType === null) {
    throw new Error(`PNG is missing IHDR chunk: ${filename}`)
  }

  return { colorType, chunks }
}

describe('rank assets', () => {
  it('has exactly 27 PNG rank files', () => {
    expect(getRankPngFiles()).toHaveLength(27)
  })

  it('stores rank PNGs without an alpha channel or transparency chunk', () => {
    for (const filename of getRankPngFiles()) {
      const metadata = readPngMetadata(filename)

      expect(metadata.colorType, filename).not.toBe(4)
      expect(metadata.colorType, filename).not.toBe(6)
      expect(metadata.chunks, filename).not.toContain('tRNS')
    }
  })

  it('has an on-disk file for every referenced rank image source', () => {
    const rankSection = greenBookSections.find((section) => section.id === 'rank-structure')

    if (!rankSection) {
      throw new Error('Missing rank structure section')
    }

    const imageSources = rankSection.fields.flatMap((field) => (field.imageSrc ? [field.imageSrc] : []))

    for (const imageSrc of imageSources) {
      expect(existsSync(new URL(`../public${imageSrc}`, import.meta.url)), imageSrc).toBe(true)
    }
  })

  it('has pay grades and visual descriptions for every rank field', () => {
    const rankSection = greenBookSections.find((section) => section.id === 'rank-structure')

    if (!rankSection) {
      throw new Error('Missing rank structure section')
    }

    expect(rankSection.fields).toHaveLength(28)

    for (const field of rankSection.fields) {
      expect(field.payGrade, field.id).toMatch(/^[EWO]-\d{1,2}$/)
      expect(field.prompt, field.id).toBeTruthy()
      expect(field.prompt, field.id).not.toBe('Identify this rank.')
    }
  })
})
