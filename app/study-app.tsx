'use client'

import clsx from 'clsx'
import {
  BookOpen,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
  Clock3,
  ListChecks,
  Medal,
  PenLine,
  RotateCcw,
  Send,
  ShieldCheck,
  Star,
  Target,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useMemo, useSyncExternalStore } from 'react'

import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Input } from '@/components/input'
import { Text } from '@/components/text'
import { Textarea } from '@/components/textarea'
import { getFieldPlaceholder } from '@/lib/cloze'
import { gradeModeAnswers, type FieldGrade, type ModeGrade } from '@/lib/grading'
import { greenBookSections, type GreenBookSectionId } from '@/lib/green-book-content'
import {
  clearAllAnswers,
  getModeAnswers,
  isModeSubmitted,
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
const storageSubscribers = new Set<() => void>()

function getStudyStateSnapshot(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  return window.localStorage.getItem(STUDY_STORAGE_KEY) ?? ''
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

  const updateState = useCallback((updater: (currentState: StoredStudyState) => StoredStudyState) => {
    const nextState = updater(loadStudyState())

    saveStudyState(nextState)
    emitStudyStorageChange()
  }, [])

  return [state, updateState]
}

function countAnsweredFields(fields: readonly StudyField[], answers: AnswerMap): number {
  return fields.filter((field) => answers[field.id]?.trim()).length
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
    return 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3'
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
            onClick={() => onModeChange(studyMode)}
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
  mobile = false,
}: {
  answers: AnswerMap
  grade: ModeGrade
  submitted: boolean
  mobile?: boolean
}) {
  return (
    <nav aria-label="Green Book sections" className={mobile ? '-mx-4 overflow-x-auto px-4 pb-2 lg:hidden' : ''}>
      <div className={mobile ? 'flex min-w-max gap-2' : 'space-y-2'}>
        {studySections.map((section) => {
          const Icon = sectionIcons[section.id]
          const sectionGrade = getSectionGrade(grade, section.id)
          const value = submitted ? (sectionGrade?.correctCount ?? 0) : countAnsweredFields(section.fields, answers)
          const total = section.fields.length

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={clsx(
                'group rounded-lg border border-zinc-200 bg-white text-left shadow-sm transition hover:border-green-800/30 hover:bg-green-50',
                mobile ? 'flex w-52 shrink-0 flex-col gap-2 p-3' : 'block p-3',
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
              <div className={clsx(mobile ? '' : 'mt-3')}>
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

function Correction({ grade }: { grade?: FieldGrade }) {
  if (!grade || grade.isCorrect) {
    return null
  }

  return (
    <p className="mt-3 flex gap-2 text-sm/6 font-medium text-red-700">
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
  grade,
  mode,
  submitted,
  onAnswerChange,
}: {
  section: StudySection
  field: StudyField
  answer: string
  grade?: FieldGrade
  mode: Mode
  submitted: boolean
  onAnswerChange: (fieldId: string, value: string) => void
}) {
  const fieldId = `field-${field.id}`
  const isWrong = Boolean(grade && !grade.isCorrect)
  const isCorrect = Boolean(grade?.isCorrect)
  const placeholder = getFieldPlaceholder(field.answer, mode)

  if (section.id === 'rank-structure') {
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
              invalid={isWrong}
              onChange={(event) => onAnswerChange(field.id, event.target.value)}
              className="mt-3"
              autoComplete="off"
            />
            <Correction grade={grade} />
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
          onChange={(event) => onAnswerChange(field.id, event.target.value)}
          className="mt-3"
          autoComplete="off"
        />
      )}

      <Correction grade={grade} />
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

  const mode = state.mode
  const answers = getModeAnswers(state, mode)
  const submitted = isModeSubmitted(state, mode)
  const grade = useMemo(() => gradeModeAnswers(studySections, state.answersByMode, mode), [mode, state.answersByMode])
  const answeredCount = useMemo(() => countAnsweredFields(allFields, answers), [answers])
  const headerValue = submitted ? grade.correctCount : answeredCount
  const headerTotal = submitted ? grade.totalCount : totalFieldCount

  function handleModeChange(nextMode: Mode) {
    setState((currentState) => ({ ...currentState, mode: nextMode }))
  }

  function handleAnswerChange(fieldId: string, value: string) {
    setState((currentState) => {
      if (isModeSubmitted(currentState, currentState.mode)) {
        return currentState
      }

      return setAnswer(currentState, currentState.mode, fieldId, value)
    })
  }

  function handleSubmit() {
    setState((currentState) => markSubmitted(currentState, currentState.mode))
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
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge color="green">Green Book</Badge>
                <Badge color={submitted ? 'green' : 'amber'}>{submitted ? 'Submitted' : 'Practice'}</Badge>
              </div>
              <Heading className="mt-2">Green Book Memorizer</Heading>
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
                <Button color="green" onClick={handleSubmit} disabled={submitted}>
                  <Send data-slot="icon" aria-hidden="true" />
                  Submit
                </Button>
                {submitted ? (
                  <Button outline onClick={handleRetake}>
                    <RotateCcw data-slot="icon" aria-hidden="true" />
                    Retake
                  </Button>
                ) : null}
                <Button outline onClick={handleClearAll}>
                  <Trash2 data-slot="icon" aria-hidden="true" />
                  Clear all
                </Button>
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
          <SectionNav answers={answers} grade={grade} submitted={submitted} mobile />
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
    </main>
  )
}
