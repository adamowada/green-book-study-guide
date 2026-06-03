'use client'

import type canvasConfetti from 'canvas-confetti'
import clsx from 'clsx'
import {
  BookOpen,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
  Clock3,
  ListChecks,
  Medal,
  Menu,
  PenLine,
  RotateCcw,
  Send,
  ShieldCheck,
  Star,
  Target,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'
import { Textarea } from '@/components/textarea'
import { getPerfectScoreCelebrationMode, type CelebrationMode } from '@/lib/celebration'
import { getFieldPlaceholder, getPayGradePlaceholder } from '@/lib/cloze'
import { gradeModeAnswers, type FieldGrade, type ModeGrade } from '@/lib/grading'
import { getRankPayGradeFieldId, greenBookSections, type GreenBookSectionId } from '@/lib/green-book-content'
import {
  clearAllAnswers,
  createEmptyStudyState,
  getAttemptAnswers,
  isAttemptSubmitted,
  loadStudyState,
  markSubmitted,
  retakeMode,
  saveStudyState,
  setAnswer,
  STUDY_MODES,
} from '@/lib/study-state'
import { STUDY_STORAGE_KEY, type AnswerMap, type Mode, type StoredStudyState, type StudyField, type StudySection } from '@/lib/study-types'

const sectionIcons: Record<GreenBookSectionId, LucideIcon> = {
  'army-values': ShieldCheck,
  'soldiers-creed': BookOpen,
  'military-time': Clock3,
  'general-orders': ListChecks,
  'special-orders': ClipboardCheck,
  'phonetic-alphabet': PenLine,
  'rank-structure': Medal,
}

const modeLabels: Record<Mode, string> = {
  easy: 'Easy',
  hard: 'Hard',
}

const studySections: readonly StudySection[] = greenBookSections
const allFields = studySections.flatMap((section) => section.fields)
const totalFieldCount = allFields.length
const currentYear = new Date().getFullYear()
const CELEBRATION_DURATION_MS = 5000
const CELEBRATION_CONFETTI_Z_INDEX = 100
const CELEBRATION_COLORS = ['#c084fc', '#fb7185', '#60a5fa', '#facc15', '#fb923c']
const storageSubscribers = new Set<() => void>()
let inMemoryStudyState: StoredStudyState = createEmptyStudyState()
let isUsingInMemoryStudyState = false
let loadedConfetti: ConfettiFunction | null = null
let confettiLoadPromise: Promise<ConfettiFunction> | null = null

type CelebrationState = {
  id: number
  mode: CelebrationMode
}

type ConfettiFunction = typeof canvasConfetti
type ConfettiOptions = NonNullable<Parameters<ConfettiFunction>[0]>

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.58 7.58 0 0 1 8 3.86c.68.01 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function loadConfetti(): Promise<ConfettiFunction> {
  confettiLoadPromise ??= import('canvas-confetti').then((module) => {
    loadedConfetti = module.default
    return module.default
  })

  return confettiLoadPromise
}

function getConfettiRainOptions(): ConfettiOptions {
  return {
    angle: 270,
    colors: CELEBRATION_COLORS,
    decay: 0.91,
    disableForReducedMotion: true,
    drift: (Math.random() - 0.5) * 0.7,
    gravity: 0.85,
    origin: { x: Math.random(), y: -0.08 },
    particleCount: 10,
    scalar: 0.8 + Math.random() * 0.35,
    shapes: ['square', 'circle'],
    spread: 80,
    startVelocity: 16 + Math.random() * 8,
    ticks: 240,
    zIndex: CELEBRATION_CONFETTI_Z_INDEX,
  }
}

function FacetedGoldStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} aria-hidden="true">
      <path
        fill="#f8b51d"
        stroke="#a66a24"
        strokeLinejoin="round"
        strokeWidth="10"
        d="M200 24 239 145h128L263 221l40 126-103-76L97 347l40-126L33 145h128L200 24Z"
      />
      <path fill="#ffd84a" d="M200 24 200 197 239 145Z" />
      <path fill="#fff2a3" d="M200 197 239 145h128Z" />
      <path fill="#ffe070" d="M200 197 263 221l104-76Z" />
      <path fill="#f7a91a" d="M200 197 263 221l40 126Z" />
      <path fill="#ffc533" d="M200 197 200 271l103 76Z" />
      <path fill="#f4a91b" d="M200 197 97 347l103-76Z" />
      <path fill="#f8b51d" d="M200 197 137 221 97 347Z" />
      <path fill="#ffe58a" d="M200 197 33 145l104 76Z" />
      <path fill="#fff3af" d="M200 197 161 145H33Z" />
      <path fill="#f6b11f" d="M200 24 161 145l39 52Z" />
      <path
        fill="none"
        stroke="#a66a24"
        strokeLinejoin="round"
        strokeWidth="4"
        d="M200 24v247M33 145l167 52 167-52M97 347l103-150 103 150M161 145l39 52 39-52M137 221l63-24 63 24"
      />
      <path
        fill="none"
        stroke="#ffffff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.75"
        strokeWidth="4"
        d="M52 153 137 221M182 55 163 141M220 153 203 191M292 335 263 224"
      />
    </svg>
  )
}

function CelebrationOverlay({ celebration }: { celebration: CelebrationState | null }) {
  if (celebration?.mode !== 'hard') {
    return null
  }

  return (
    <div
      key={celebration.id}
      className="pointer-events-none absolute inset-x-0 top-1/2 z-[80] flex -translate-y-1/2 justify-center"
      aria-hidden="true"
    >
      <div className="flex items-center justify-center">
        <div className="z-0 -mr-3 size-[4.5rem] translate-x-2 translate-y-3 -rotate-12 sm:-mr-5 sm:size-[6rem] sm:translate-x-4 sm:translate-y-4">
          <FacetedGoldStar className="size-full" />
        </div>
        <div className="z-10 size-[6rem] sm:size-[8rem]">
          <FacetedGoldStar className="size-full" />
        </div>
        <div className="z-0 -ml-3 size-[4.5rem] -translate-x-2 translate-y-3 rotate-12 sm:-ml-5 sm:size-[6rem] sm:-translate-x-4 sm:translate-y-4">
          <FacetedGoldStar className="size-full" />
        </div>
      </div>
    </div>
  )
}

function serializeStudyState(state: StoredStudyState): string {
  return JSON.stringify(state)
}

function getStudyStateSnapshot(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  if (isUsingInMemoryStudyState) {
    return serializeStudyState(inMemoryStudyState)
  }

  try {
    return window.localStorage.getItem(STUDY_STORAGE_KEY) ?? ''
  } catch {
    isUsingInMemoryStudyState = true
    return serializeStudyState(inMemoryStudyState)
  }
}

function subscribeToStudyStorage(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {}
  }

  function handleStorage(event: StorageEvent) {
    if (event.key === STUDY_STORAGE_KEY) {
      listener()
    }
  }

  storageSubscribers.add(listener)
  window.addEventListener('storage', handleStorage)

  return () => {
    storageSubscribers.delete(listener)
    window.removeEventListener('storage', handleStorage)
  }
}

function emitStudyStorageChange() {
  storageSubscribers.forEach((listener) => listener())
}

function createSnapshotStorage(snapshot: string): Storage {
  return {
    get length() {
      return snapshot ? 1 : 0
    },
    clear: () => undefined,
    getItem: (key: string) => (key === STUDY_STORAGE_KEY && snapshot ? snapshot : null),
    key: () => null,
    removeItem: () => undefined,
    setItem: () => undefined,
  }
}

function useStoredStudyState(): [StoredStudyState, (updater: (currentState: StoredStudyState) => StoredStudyState) => void] {
  const snapshot = useSyncExternalStore(subscribeToStudyStorage, getStudyStateSnapshot, () => '')
  const state = useMemo(() => loadStudyState(createSnapshotStorage(snapshot)), [snapshot])

  useEffect(() => {
    inMemoryStudyState = state
  }, [state])

  const updateState = useCallback((updater: (currentState: StoredStudyState) => StoredStudyState) => {
    const nextState = updater(state)

    inMemoryStudyState = nextState

    if (!isUsingInMemoryStudyState && !saveStudyState(nextState)) {
      isUsingInMemoryStudyState = true
    }

    emitStudyStorageChange()
  }, [state])

  return [state, updateState]
}

function isFieldAnswered(field: StudyField, answers: AnswerMap): boolean {
  if (field.id.startsWith('rank-')) {
    return Boolean(answers[field.id]?.trim() || answers[getRankPayGradeFieldId(field.id)]?.trim())
  }

  return Boolean(answers[field.id]?.trim())
}

function countAnsweredFields(fields: readonly StudyField[], answers: AnswerMap): number {
  return fields.filter((field) => isFieldAnswered(field, answers)).length
}

function getSectionGrade(grade: ModeGrade, sectionId: GreenBookSectionId) {
  return grade.sections.find((section) => section.sectionId === sectionId)
}

function getPercent(value: number, total: number): number {
  if (total === 0) {
    return 0
  }

  return Math.round((value / total) * 100)
}

function shouldUseTextarea(section: StudySection, field: StudyField): boolean {
  return (
    section.id === 'soldiers-creed' ||
    section.id === 'general-orders' ||
    section.id === 'special-orders' ||
    field.answer.length > 60
  )
}

function isCompactSection(section: StudySection): boolean {
  return section.id === 'military-time' || section.id === 'phonetic-alphabet'
}

function getFieldsLayout(section: StudySection): string {
  if (section.id === 'rank-structure') {
    return 'grid gap-4 sm:grid-cols-2'
  }

  if (isCompactSection(section)) {
    return 'grid gap-3 sm:grid-cols-2 xl:grid-cols-3'
  }

  return 'space-y-3'
}

function getRankImageAlt(field: StudyField, isSubmitted: boolean): string {
  if (isSubmitted) {
    return `${field.answer} insignia`
  }

  return field.payGrade ? `Army rank insignia for pay grade ${field.payGrade}` : 'Army rank insignia'
}

function FieldStatus({ grade }: { grade?: FieldGrade }) {
  if (!grade) {
    return null
  }

  if (grade.isCorrect) {
    return (
      <Badge color="green" className="shrink-0">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Correct
      </Badge>
    )
  }

  return (
    <Badge color="red" className="shrink-0">
      <CircleX className="size-3.5" aria-hidden="true" />
      Review
    </Badge>
  )
}

function ModeControl({ mode, onModeChange }: { mode: Mode; onModeChange: (mode: Mode) => void }) {
  const radioRefs = useRef<Record<Mode, HTMLButtonElement | null>>({ easy: null, hard: null })

  function selectMode(nextMode: Mode) {
    onModeChange(nextMode)
    window.requestAnimationFrame(() => radioRefs.current[nextMode]?.focus())
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, studyMode: Mode) {
    const currentIndex = STUDY_MODES.indexOf(studyMode)
    const lastIndex = STUDY_MODES.length - 1
    const nextMode =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? STUDY_MODES[currentIndex === lastIndex ? 0 : currentIndex + 1]
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? STUDY_MODES[currentIndex === 0 ? lastIndex : currentIndex - 1]
          : event.key === 'Home'
            ? STUDY_MODES[0]
            : event.key === 'End'
              ? STUDY_MODES[lastIndex]
              : undefined

    if (!nextMode) {
      return
    }

    event.preventDefault()
    selectMode(nextMode)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Study mode"
      className="inline-grid grid-cols-2 rounded-lg border border-zinc-200 bg-white p-1 shadow-sm"
    >
      {STUDY_MODES.map((studyMode) => {
        const isSelected = mode === studyMode

        return (
          <button
            key={studyMode}
            type="button"
            role="radio"
            aria-checked={isSelected}
            ref={(node) => {
              radioRefs.current[studyMode] = node
            }}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onModeChange(studyMode)}
            onKeyDown={(event) => handleKeyDown(event, studyMode)}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm/6 font-semibold transition',
              isSelected ? 'bg-green-800 text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950',
            )}
          >
            {modeLabels[studyMode]}
          </button>
        )
      })}
    </div>
  )
}

function ProgressBar({
  value,
  total,
  submitted,
  compact = false,
}: {
  value: number
  total: number
  submitted: boolean
  compact?: boolean
}) {
  const width = getPercent(value, total)

  return (
    <div className={clsx('overflow-hidden rounded-full bg-zinc-200', compact ? 'h-1.5' : 'h-2')}>
      <div
        className={clsx('h-full rounded-full transition-all', submitted ? 'bg-green-800' : 'bg-amber-500')}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

function SectionNav({
  answers,
  grade,
  submitted,
  onNavigate,
}: {
  answers: AnswerMap
  grade: ModeGrade
  submitted: boolean
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Green Book sections">
      <div className="space-y-2">
        {studySections.map((section) => {
          const Icon = sectionIcons[section.id]
          const sectionGrade = getSectionGrade(grade, section.id)
          const value = submitted ? (sectionGrade?.correctCount ?? 0) : countAnsweredFields(section.fields, answers)
          const total = section.fields.length

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={onNavigate}
              className={clsx(
                'group rounded-lg border border-zinc-200 bg-white text-left shadow-sm transition hover:border-green-800/30 hover:bg-green-50',
                'block p-3',
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <Icon className="size-4 shrink-0 text-green-800" aria-hidden="true" />
                  <span className="truncate text-sm/6 font-semibold text-zinc-950">{section.title}</span>
                </span>
                <Badge color={submitted ? 'green' : 'amber'} className="shrink-0">
                  {value}/{total}
                </Badge>
              </div>
              <div className="mt-3">
                <ProgressBar value={value} total={total} submitted={submitted} compact />
              </div>
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function RankTile({ field, submitted }: { field: StudyField; submitted: boolean }) {
  return (
    <div className="flex h-28 w-32 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white p-3 shadow-sm">
      {field.imageSrc ? (
        // Plain img keeps these fixed static assets frontend-only without adding server image optimization concerns.
        <img
          src={field.imageSrc}
          alt={getRankImageAlt(field, submitted)}
          loading="lazy"
          className="max-h-20 max-w-24 object-contain"
        />
      ) : (
        <span className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-center text-sm/5 font-semibold text-zinc-600">
          {field.visualLabel ?? 'No Chevron'}
        </span>
      )}
    </div>
  )
}

function Correction({ id, grade }: { id: string; grade?: FieldGrade }) {
  if (!grade || grade.isCorrect) {
    return null
  }

  return (
    <p id={id} className="mt-3 flex gap-2 text-sm/6 font-medium text-red-700">
      <CircleX className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        Correct answer: <span className="font-semibold">{grade.correction}</span>
      </span>
    </p>
  )
}

function StudyFieldCard({
  section,
  field,
  answer,
  payGradeAnswer,
  grade,
  mode,
  submitted,
  onAnswerChange,
}: {
  section: StudySection
  field: StudyField
  answer: string
  payGradeAnswer?: string
  grade?: FieldGrade
  mode: Mode
  submitted: boolean
  onAnswerChange: (fieldId: string, value: string) => void
}) {
  const fieldId = `field-${field.id}`
  const correctionId = `${fieldId}-correction`
  const describedBy = grade && !grade.isCorrect ? correctionId : undefined
  const isWrong = Boolean(grade && !grade.isCorrect)
  const isCorrect = Boolean(grade?.isCorrect)
  const placeholder = getFieldPlaceholder(field.answer, mode)

  if (section.id === 'rank-structure') {
    const payGradeFieldId = getRankPayGradeFieldId(field.id)
    const payGradeInputId = `field-${payGradeFieldId}`
    const isRankNameWrong = Boolean(grade && !grade.rankNameIsCorrect)
    const isRankNameCorrect = Boolean(grade?.rankNameIsCorrect)
    const isPayGradeWrong = Boolean(grade && !grade.payGradeIsCorrect)
    const payGradePlaceholder = getPayGradePlaceholder(field.payGrade, mode)

    return (
      <div
        className={clsx(
          'rounded-lg border bg-white p-4 shadow-sm',
          isWrong && 'border-red-200 bg-red-50/60',
          isCorrect && 'border-green-200',
          !grade && 'border-zinc-200',
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <RankTile field={field} submitted={submitted} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <label htmlFor={fieldId} className="text-sm/6 font-semibold text-zinc-950">
                {field.prompt}
              </label>
              <FieldStatus grade={grade} />
            </div>
            <Input
              id={fieldId}
              type="text"
              value={answer}
              placeholder={placeholder}
              readOnly={submitted}
              invalid={isRankNameWrong}
              aria-describedby={describedBy}
              onChange={(event) => onAnswerChange(field.id, event.target.value)}
              className="mt-3"
              autoComplete="off"
            />
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex w-full items-center gap-2">
                <label htmlFor={payGradeInputId} className="shrink-0 text-sm/6 font-semibold text-zinc-700">
                  Pay Grade:
                </label>
                <div className="min-w-0 flex-1">
                  <Input
                    id={payGradeInputId}
                    type="text"
                    value={payGradeAnswer ?? ''}
                    placeholder={payGradePlaceholder}
                    readOnly={submitted}
                    invalid={isPayGradeWrong}
                    aria-describedby={describedBy}
                    onChange={(event) => onAnswerChange(payGradeFieldId, event.target.value)}
                    autoComplete="off"
                  />
                </div>
              </div>
              {isRankNameCorrect && grade && !grade.isCorrect ? (
                <Badge color="green" className="shrink-0">
                  Rank correct
                </Badge>
              ) : null}
            </div>
            <Correction id={correctionId} grade={grade} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={clsx(
        'rounded-lg border bg-white p-4 shadow-sm',
        isCompactSection(section) && 'p-3',
        isWrong && 'border-red-200 bg-red-50/60',
        isCorrect && 'border-green-200',
        !grade && 'border-zinc-200',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <label htmlFor={fieldId} className="text-sm/6 font-semibold text-zinc-950">
          {field.prompt}
        </label>
        <FieldStatus grade={grade} />
      </div>

      {shouldUseTextarea(section, field) ? (
        <Textarea
          id={fieldId}
          value={answer}
          placeholder={placeholder}
          readOnly={submitted}
          invalid={isWrong}
          aria-describedby={describedBy}
          onChange={(event) => onAnswerChange(field.id, event.target.value)}
          className="mt-3"
          rows={section.id === 'general-orders' ? 3 : 2}
          resizable={false}
        />
      ) : (
        <Input
          id={fieldId}
          type="text"
          value={answer}
          placeholder={placeholder}
          readOnly={submitted}
          invalid={isWrong}
          aria-describedby={describedBy}
          onChange={(event) => onAnswerChange(field.id, event.target.value)}
          className="mt-3"
          autoComplete="off"
        />
      )}

      <Correction id={correctionId} grade={grade} />
    </div>
  )
}

function StudySectionPanel({
  section,
  answers,
  grade,
  mode,
  submitted,
  onAnswerChange,
}: {
  section: StudySection
  answers: AnswerMap
  grade: ModeGrade
  mode: Mode
  submitted: boolean
  onAnswerChange: (fieldId: string, value: string) => void
}) {
  const Icon = sectionIcons[section.id]
  const sectionGrade = getSectionGrade(grade, section.id)
  const answeredCount = countAnsweredFields(section.fields, answers)
  const value = submitted ? (sectionGrade?.correctCount ?? 0) : answeredCount

  return (
    <section id={section.id} className="scroll-mt-40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-green-800/15 bg-green-800/10 text-green-900">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <Subheading level={2} className="text-zinc-950">
              {section.title}
            </Subheading>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge color={submitted ? 'green' : 'amber'}>
            {submitted ? 'Score' : 'Answered'} {value}/{section.fields.length}
          </Badge>
        </div>
      </div>

      <Divider className="my-4" />

      <div className={getFieldsLayout(section)}>
        {section.fields.map((field) => (
          <StudyFieldCard
            key={field.id}
            section={section}
            field={field}
            answer={answers[field.id] ?? ''}
            payGradeAnswer={answers[getRankPayGradeFieldId(field.id)] ?? ''}
            grade={submitted ? grade.fieldsById[field.id] : undefined}
            mode={mode}
            submitted={submitted}
            onAnswerChange={onAnswerChange}
          />
        ))}
      </div>
    </section>
  )
}

export function StudyApp() {
  const [state, setState] = useStoredStudyState()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [celebration, setCelebration] = useState<CelebrationState | null>(null)
  const celebrationIntervalRef = useRef<number | null>(null)
  const celebrationTimeoutRef = useRef<number | null>(null)
  const celebrationIdRef = useRef(0)

  const mode = state.mode
  const answers = getAttemptAnswers(state)
  const submitted = isAttemptSubmitted(state)
  const grade = useMemo(
    () => gradeModeAnswers(studySections, answers, mode),
    [answers, mode],
  )
  const answeredCount = useMemo(() => countAnsweredFields(allFields, answers), [answers])
  const headerValue = submitted ? grade.correctCount : answeredCount
  const headerTotal = submitted ? grade.totalCount : totalFieldCount
  const mobileMenuId = 'green-book-mobile-menu'

  const clearCelebrationTimers = useCallback(() => {
    celebrationIdRef.current += 1

    if (celebrationIntervalRef.current !== null) {
      window.clearInterval(celebrationIntervalRef.current)
      celebrationIntervalRef.current = null
    }

    if (celebrationTimeoutRef.current !== null) {
      window.clearTimeout(celebrationTimeoutRef.current)
      celebrationTimeoutRef.current = null
    }

    loadedConfetti?.reset()
  }, [])

  const playCelebration = useCallback(
    (celebrationMode: CelebrationMode) => {
      clearCelebrationTimers()
      const celebrationId = celebrationIdRef.current + 1
      celebrationIdRef.current = celebrationId
      setCelebration(celebrationMode === 'hard' ? { id: celebrationId, mode: celebrationMode } : null)

      function fireRain() {
        void loadConfetti().then((confetti) => {
          if (celebrationIdRef.current !== celebrationId) {
            return
          }

          confetti(getConfettiRainOptions())
        })
      }

      fireRain()
      celebrationIntervalRef.current = window.setInterval(fireRain, 90)

      celebrationTimeoutRef.current = window.setTimeout(() => {
        clearCelebrationTimers()
        setCelebration(null)
      }, CELEBRATION_DURATION_MS)
    },
    [clearCelebrationTimers],
  )

  useEffect(() => {
    return () => clearCelebrationTimers()
  }, [clearCelebrationTimers])

  function handleModeChange(nextMode: Mode) {
    setState((currentState) => ({ ...currentState, mode: nextMode }))
  }

  function handleAnswerChange(fieldId: string, value: string) {
    setState((currentState) => {
      if (isAttemptSubmitted(currentState)) {
        return currentState
      }

      return setAnswer(currentState, currentState.mode, fieldId, value)
    })
  }

  function handleSubmit() {
    const celebrationMode = getPerfectScoreCelebrationMode(grade)

    if (celebrationMode) {
      playCelebration(celebrationMode)
    }

    setState((currentState) => markSubmitted(currentState, currentState.mode))
  }

  function handlePreviewCelebration() {
    playCelebration(mode)
  }

  function handleRetake() {
    setState((currentState) => retakeMode(currentState, currentState.mode))
  }

  function handleClearAll() {
    setState((currentState) => clearAllAnswers(currentState))
  }

  return (
    <main className="min-h-screen scroll-smooth bg-zinc-100 text-zinc-950">
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-50/95 backdrop-blur">
        <CelebrationOverlay celebration={celebration} />
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 lg:py-4">
          <div className="flex items-center justify-between gap-4 lg:hidden">
            <div className="min-w-0">
              <h1 className="truncate text-lg/7 font-semibold text-zinc-950 sm:text-xl/8">Green Book Study Guide</h1>
              <p className="mt-0.5 text-sm/6 font-medium text-zinc-600" aria-live="polite">
                {submitted ? 'Score' : 'Progress'} {headerValue}/{headerTotal}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-label={`Preview ${modeLabels[mode]} mode celebration`}
                onClick={handlePreviewCelebration}
                className="inline-flex size-11 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100 hover:text-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
              >
                <Star className={clsx('size-5', mode === 'hard' && 'fill-amber-300 text-amber-500')} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={isMobileMenuOpen ? 'Close section navigation' : 'Open section navigation'}
                aria-controls={mobileMenuId}
                aria-expanded={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen((currentValue) => !currentValue)}
                className="inline-flex size-11 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-100 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
              >
                {isMobileMenuOpen ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div
            id={mobileMenuId}
            className={clsx(
              'lg:hidden',
              isMobileMenuOpen ? 'mt-3 max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-zinc-200 pt-3 pb-2' : 'hidden',
            )}
          >
            <div className="space-y-4">
              <ModeControl mode={mode} onModeChange={handleModeChange} />

              <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm" aria-live="polite">
                <div className="flex items-center justify-between gap-4 text-sm/6">
                  <span className="font-semibold text-zinc-700">{submitted ? 'Score' : 'Progress'}</span>
                  <span className="font-semibold text-zinc-950">
                    {headerValue}/{headerTotal}
                  </span>
                </div>
                <div className="mt-2 w-full">
                  <ProgressBar value={headerValue} total={headerTotal} submitted={submitted} />
                </div>
              </div>

              <div className={clsx('grid gap-2', !submitted && 'sm:grid-cols-2')}>
                {submitted ? (
                  <Button outline onClick={handleRetake}>
                    <RotateCcw data-slot="icon" aria-hidden="true" />
                    Retake
                  </Button>
                ) : (
                  <>
                    <Button color="green" onClick={handleSubmit}>
                      <Send data-slot="icon" aria-hidden="true" />
                      Submit
                    </Button>
                    <Button outline onClick={handleClearAll}>
                      <Trash2 data-slot="icon" aria-hidden="true" />
                      Clear all
                    </Button>
                  </>
                )}
              </div>

              <SectionNav
                answers={answers}
                grade={grade}
                submitted={submitted}
                onNavigate={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </div>

          <div className="hidden lg:flex lg:items-center lg:justify-between lg:gap-4">
            <div className="min-w-0">
              <Heading>Green Book Study Guide</Heading>
              <Text className="mt-1 max-w-2xl">
                Army Values, Soldier&apos;s Creed, Military Time, Orders, Phonetic Alphabet, and Rank Structure.
              </Text>
            </div>

            <div className="flex flex-col gap-3 lg:min-w-[36rem]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <ModeControl mode={mode} onModeChange={handleModeChange} />
                <div className="rounded-lg border border-zinc-200 bg-white px-3 py-2 shadow-sm" aria-live="polite">
                  <div className="flex items-center justify-between gap-4 text-sm/6">
                    <span className="font-semibold text-zinc-700">{submitted ? 'Score' : 'Progress'}</span>
                    <span className="font-semibold text-zinc-950">
                      {headerValue}/{headerTotal}
                    </span>
                  </div>
                  <div className="mt-2 w-full min-w-40">
                    <ProgressBar value={headerValue} total={headerTotal} submitted={submitted} />
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button outline onClick={handlePreviewCelebration}>
                  <Star data-slot="icon" aria-hidden="true" />
                  Celebrate
                </Button>
                {submitted ? (
                  <Button outline onClick={handleRetake}>
                    <RotateCcw data-slot="icon" aria-hidden="true" />
                    Retake
                  </Button>
                ) : (
                  <>
                    <Button color="green" onClick={handleSubmit}>
                      <Send data-slot="icon" aria-hidden="true" />
                      Submit
                    </Button>
                    <Button outline onClick={handleClearAll}>
                      <Trash2 data-slot="icon" aria-hidden="true" />
                      Clear all
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-8 lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-36 space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Target className="size-5 text-green-800" aria-hidden="true" />
                <Subheading>Sections</Subheading>
              </div>
            </div>
            <SectionNav answers={answers} grade={grade} submitted={submitted} />
            <div className="rounded-lg border border-amber-500/25 bg-amber-50 p-3 text-sm/6 text-amber-900">
              <div className="flex items-center gap-2 font-semibold">
                <Star className="size-4" aria-hidden="true" />
                {modeLabels[mode]} mode
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="space-y-12">
            {studySections.map((section) => (
              <StudySectionPanel
                key={section.id}
                section={section}
                answers={answers}
                grade={grade}
                mode={mode}
                submitted={submitted}
                onAnswerChange={handleAnswerChange}
              />
            ))}
          </div>
        </div>
      </div>
      <footer className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-sm/6 text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {currentYear} Adam Owada. Not affiliated with or endorsed by the United States Army.</p>
          <a
            href="https://github.com/adamowada/green-book-study-guide"
            target="_blank"
            rel="noreferrer"
            aria-label="Green Book Study Guide on GitHub"
            className="inline-flex size-10 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-zinc-100 hover:text-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800"
          >
            <GitHubIcon className="size-5" />
          </a>
        </div>
      </footer>
    </main>
  )
}
