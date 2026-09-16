'use client'

import * as Headless from '@headlessui/react'
import clsx from 'clsx'
import { Check, ClipboardCheck, EllipsisVertical, Shuffle, Trash2, X } from 'lucide-react'
import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react'

import { TouchTarget } from './button'

export type SectionActionsProps = {
  title: string
  randomized: boolean
  gradeActive: boolean
  randomizeDisabled?: boolean
  randomizeDisabledReason?: string
  gradeDisabled?: boolean
  gradeDisabledReason?: string
  canClear: boolean
  onToggleRandomize: () => void
  onToggleGrade: () => void
  onConfirmClear: () => void
}

type IconActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'title'> & {
  children: ReactNode
  title: string
  active?: boolean
  destructive?: boolean
  destructiveFilled?: boolean
}

const iconButtonBase = [
  'relative inline-flex size-10 shrink-0 items-center justify-center rounded-lg border shadow-sm transition',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-800',
  'disabled:pointer-events-none disabled:opacity-45',
  'forced-colors:border-[ButtonText] forced-colors:focus-visible:outline-[Highlight]',
]

const IconActionButton = forwardRef<HTMLButtonElement, IconActionButtonProps>(function IconActionButton(
  {
    active = false,
    children,
    className,
    destructive = false,
    destructiveFilled = false,
    disabled,
    title,
    ...props
  },
  ref,
) {
  return (
    <span className="relative inline-flex" title={title}>
      <button
        {...props}
        ref={ref}
        type="button"
        title={title}
        disabled={disabled}
        aria-label={props['aria-label'] ?? title}
        className={clsx(
          iconButtonBase,
          active &&
            'border-green-900 bg-green-800 text-white hover:bg-green-700 active:bg-green-900 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
          !active &&
            !destructiveFilled &&
            'border-zinc-200 bg-white text-zinc-700 hover:border-green-800/30 hover:bg-green-50 hover:text-green-900 active:bg-green-100',
          destructive &&
            !destructiveFilled &&
            'hover:border-red-300 hover:bg-red-50 hover:text-red-700 active:bg-red-100',
          destructiveFilled &&
            'border-red-800 bg-red-700 text-white hover:bg-red-600 active:bg-red-800 focus-visible:outline-red-700 forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
          className,
        )}
      >
        <TouchTarget>{children}</TouchTarget>
      </button>
    </span>
  )
})

function SectionActionPanel({
  title,
  randomized,
  gradeActive,
  randomizeDisabled,
  randomizeDisabledReason,
  gradeDisabled,
  gradeDisabledReason,
  canClear,
  onToggleRandomize,
  onToggleGrade,
  onConfirmClear,
  onAnnounce,
  close,
}: SectionActionsProps & {
  onAnnounce: (message: string) => void
  close: () => void
}) {
  const [confirmingClear, setConfirmingClear] = useState(false)
  const cancelClearRef = useRef<HTMLButtonElement>(null)
  const clearButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (confirmingClear) {
      cancelClearRef.current?.focus()
    }
  }, [confirmingClear])

  function cancelClear() {
    setConfirmingClear(false)
    window.requestAnimationFrame(() => clearButtonRef.current?.focus())
  }

  function confirmClear() {
    onConfirmClear()
    onAnnounce(`${title} answers cleared.`)
    close()
  }

  if (confirmingClear) {
    return (
      <div className="flex flex-col items-center gap-1 sm:flex-row" aria-label={`Confirm clearing ${title}`}>
        <span className="whitespace-nowrap px-2 py-1 text-xs/5 font-semibold text-zinc-700">Clear answers?</span>
        <IconActionButton
          ref={cancelClearRef}
          title={`Cancel clearing answers for ${title}`}
          aria-label={`Cancel clearing answers for ${title}`}
          onClick={cancelClear}
        >
          <X className="size-4" aria-hidden="true" />
        </IconActionButton>
        <IconActionButton
          title={`Confirm clearing answers for ${title}`}
          aria-label={`Confirm clearing answers for ${title}`}
          destructiveFilled
          onClick={confirmClear}
        >
          <Check className="size-4" aria-hidden="true" />
        </IconActionButton>
      </div>
    )
  }

  const randomizeTitle = randomizeDisabled
    ? (randomizeDisabledReason ?? 'Randomizing is unavailable for this section')
    : randomized
      ? `Restore original question order for ${title}`
      : `Randomize question order for ${title}`
  const gradeTitle = gradeDisabled
    ? (gradeDisabledReason ?? 'Section grading is unavailable')
    : gradeActive
      ? `Hide grading for ${title}`
      : `Grade ${title}`
  const clearTitle = canClear ? `Clear answers for ${title}` : `No answers to clear in ${title}`

  return (
    <div className="flex flex-col gap-1 sm:flex-row" aria-label={`${title} section actions`}>
      <IconActionButton
        title={randomizeTitle}
        aria-label={randomizeTitle}
        aria-pressed={randomized}
        active={randomized}
        disabled={randomizeDisabled}
        onClick={() => {
          onToggleRandomize()
          onAnnounce(randomized ? `${title} question order restored.` : `${title} question order randomized.`)
        }}
      >
        <Shuffle className="size-4" aria-hidden="true" />
      </IconActionButton>

      <IconActionButton
        title={gradeTitle}
        aria-label={gradeTitle}
        aria-pressed={gradeActive}
        active={gradeActive}
        disabled={gradeDisabled}
        onClick={() => {
          onToggleGrade()
          onAnnounce(gradeActive ? `${title} grading hidden.` : `${title} grading shown.`)
        }}
      >
        <ClipboardCheck className="size-4" aria-hidden="true" />
      </IconActionButton>

      <IconActionButton
        ref={clearButtonRef}
        title={clearTitle}
        aria-label={clearTitle}
        destructive
        disabled={!canClear}
        onClick={() => setConfirmingClear(true)}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </IconActionButton>
    </div>
  )
}

export function SectionActions(props: SectionActionsProps) {
  const [announcement, setAnnouncement] = useState('')
  const announcementFrameRef = useRef<number | null>(null)
  const triggerTitle = `Actions for ${props.title}`

  useEffect(() => {
    return () => {
      if (announcementFrameRef.current !== null) {
        window.cancelAnimationFrame(announcementFrameRef.current)
      }
    }
  }, [])

  function announce(message: string) {
    if (announcementFrameRef.current !== null) {
      window.cancelAnimationFrame(announcementFrameRef.current)
    }

    setAnnouncement('')
    announcementFrameRef.current = window.requestAnimationFrame(() => {
      setAnnouncement(message)
      announcementFrameRef.current = null
    })
  }

  return (
    <>
      <Headless.Popover className="relative shrink-0">
        {({ close }) => (
          <>
            <Headless.PopoverButton
              title={triggerTitle}
              aria-label={triggerTitle}
              className={clsx(
                iconButtonBase,
                'border-zinc-200 bg-white text-zinc-700 hover:border-green-800/30 hover:bg-green-50 hover:text-green-900 active:bg-green-100',
                'data-open:border-green-800/40 data-open:bg-green-50 data-open:text-green-900',
              )}
            >
              <TouchTarget>
                <EllipsisVertical className="size-5" aria-hidden="true" />
              </TouchTarget>
            </Headless.PopoverButton>

            <Headless.PopoverPanel
              anchor="bottom end"
              portal
              transition
              modal={false}
              role="group"
              aria-label={`${props.title} section actions`}
              className={clsx(
                'z-40 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg ring-1 ring-zinc-950/5',
                '[--anchor-gap:--spacing(2)] [--anchor-padding:--spacing(2)]',
                'transition duration-150 ease-out data-closed:translate-y-1 data-closed:opacity-0 motion-reduce:transition-none',
              )}
            >
              <SectionActionPanel {...props} close={close} onAnnounce={announce} />
            </Headless.PopoverPanel>
          </>
        )}
      </Headless.Popover>

      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </span>
    </>
  )
}
