import clsx from 'clsx'
import React, { forwardRef } from 'react'

type TextareaProps = {
  className?: string
  invalid?: boolean
  resizable?: boolean
} & Omit<React.ComponentPropsWithoutRef<'textarea'>, 'className'>

export const Textarea = forwardRef(function Textarea(
  { className, invalid, resizable = true, disabled, ...props }: TextareaProps,
  ref: React.ForwardedRef<HTMLTextAreaElement>,
) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        'relative block w-full',
        'before:absolute before:inset-px before:rounded-[calc(var(--radius-lg)-1px)] before:bg-white before:shadow-sm dark:before:hidden',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-transparent after:ring-inset focus-within:after:ring-2 focus-within:after:ring-blue-500',
        'has-disabled:opacity-50 has-disabled:before:bg-zinc-950/5 has-disabled:before:shadow-none',
      ])}
    >
      <textarea
        ref={ref}
        {...props}
        disabled={disabled}
        data-invalid={invalid ? true : undefined}
        aria-invalid={invalid || undefined}
        className={clsx([
          'relative block h-full w-full appearance-none rounded-lg px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)]',
          'text-base/6 text-zinc-950 placeholder:text-zinc-500 sm:text-sm/6 dark:text-white',
          'border border-zinc-950/10 hover:border-zinc-950/20 dark:border-white/10 dark:hover:border-white/20',
          'bg-transparent dark:bg-white/5 focus:outline-hidden',
          'data-invalid:border-red-500 hover:data-invalid:border-red-500 dark:data-invalid:border-red-600 dark:hover:data-invalid:border-red-600',
          'disabled:border-zinc-950/20 dark:disabled:border-white/15 dark:disabled:bg-white/2.5 dark:hover:disabled:border-white/15',
          resizable ? 'resize-y' : 'resize-none',
        ])}
      />
    </span>
  )
})
