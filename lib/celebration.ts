import type { Mode } from './study-types'

export type CelebrationMode = Mode

export type CelebrationGrade = {
  mode: Mode
  correctCount: number
  totalCount: number
}

export function getPerfectScoreCelebrationMode(grade: CelebrationGrade): CelebrationMode | undefined {
  if (grade.totalCount === 0 || grade.correctCount !== grade.totalCount) {
    return undefined
  }

  return grade.mode
}
