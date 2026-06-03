import clsx from 'clsx'
import React, { forwardRef } from 'react'

const styles = {
  base: [
    'relative isolate inline-flex items-baseline justify-center gap-x-2 rounded-lg border text-base/6 font-semibold',
    'px-[calc(--spacing(3.5)-1px)] py-[calc(--spacing(2.5)-1px)] sm:px-[calc(--spacing(3)-1px)] sm:py-[calc(--spacing(1.5)-1px)] sm:text-sm/6',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:opacity-50',
    '*:data-[slot=icon]:-mx-0.5 *:data-[slot=icon]:my-0.5 *:data-[slot=icon]:size-5 *:data-[slot=icon]:shrink-0 *:data-[slot=icon]:self-center *:data-[slot=icon]:text-(--btn-icon) sm:*:data-[slot=icon]:my-1 sm:*:data-[slot=icon]:size-4 forced-colors:[--btn-icon:ButtonText] forced-colors:hover:[--btn-icon:ButtonText]',
  ],
  solid: [
    'border-transparent bg-(--btn-border) dark:bg-(--btn-bg)',
    'before:absolute before:inset-0 before:-z-10 before:rounded-[calc(var(--radius-lg)-1px)] before:bg-(--btn-bg) before:shadow-sm dark:before:hidden dark:border-white/5',
    'after:absolute after:inset-0 after:-z-10 after:rounded-[calc(var(--radius-lg)-1px)] after:shadow-[inset_0_1px_--theme(--color-white/15%)] hover:after:bg-(--btn-hover-overlay) active:after:bg-(--btn-hover-overlay) dark:after:-inset-px dark:after:rounded-lg disabled:before:shadow-none disabled:after:shadow-none',
  ],
  outline: [
    'border-zinc-950/10 text-zinc-950 hover:bg-zinc-950/2.5 active:bg-zinc-950/2.5',
    'dark:border-white/15 dark:text-white dark:[--btn-bg:transparent] dark:hover:bg-white/5 dark:active:bg-white/5',
    '[--btn-icon:var(--color-zinc-500)] hover:[--btn-icon:var(--color-zinc-700)] active:[--btn-icon:var(--color-zinc-700)] dark:hover:[--btn-icon:var(--color-zinc-400)] dark:active:[--btn-icon:var(--color-zinc-400)]',
  ],
  plain: [
    'border-transparent text-zinc-950 hover:bg-zinc-950/5 active:bg-zinc-950/5',
    'dark:text-white dark:hover:bg-white/10 dark:active:bg-white/10',
    '[--btn-icon:var(--color-zinc-500)] hover:[--btn-icon:var(--color-zinc-700)] active:[--btn-icon:var(--color-zinc-700)] dark:[--btn-icon:var(--color-zinc-500)] dark:hover:[--btn-icon:var(--color-zinc-400)] dark:active:[--btn-icon:var(--color-zinc-400)]',
  ],
  colors: {
    'dark/zinc': [
      'text-white [--btn-bg:var(--color-zinc-900)] [--btn-border:var(--color-zinc-950)]/90 [--btn-hover-overlay:var(--color-white)]/10',
      'dark:text-white dark:[--btn-bg:var(--color-zinc-600)] dark:[--btn-hover-overlay:var(--color-white)]/5',
      '[--btn-icon:var(--color-zinc-400)] hover:[--btn-icon:var(--color-zinc-300)] active:[--btn-icon:var(--color-zinc-300)]',
    ],
    green: [
      'text-white [--btn-hover-overlay:var(--color-white)]/10 [--btn-bg:var(--color-green-800)] [--btn-border:var(--color-green-900)]/90',
      '[--btn-icon:var(--color-white)]/60 hover:[--btn-icon:var(--color-white)]/80 active:[--btn-icon:var(--color-white)]/80',
    ],
  },
}

type ButtonColor = keyof typeof styles.colors
type ButtonOwnProps = {
  color?: ButtonColor
  outline?: boolean
  plain?: boolean
  className?: string
  children: React.ReactNode
}
type AnchorButtonProps = ButtonOwnProps &
  { href: string } & Omit<React.ComponentPropsWithoutRef<'a'>, 'className' | 'color'>
type NativeButtonProps = ButtonOwnProps &
  { href?: never } & Omit<React.ComponentPropsWithoutRef<'button'>, 'className' | 'color'>
type ButtonProps = AnchorButtonProps | NativeButtonProps

export const Button = forwardRef(function Button(
  { color, outline, plain, className, children, ...props }: ButtonProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const classes = clsx(
    className,
    styles.base,
    outline ? styles.outline : plain ? styles.plain : clsx(styles.solid, styles.colors[color ?? 'dark/zinc']),
  )

  if ('href' in props && typeof props.href === 'string') {
    const { href, ...anchorProps } = props

    return (
      <a {...anchorProps} href={href} className={classes} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
        <TouchTarget>{children}</TouchTarget>
      </a>
    )
  }

  return (
    <button
      {...props}
      type={props.type ?? 'button'}
      className={clsx(classes, 'cursor-default')}
      ref={ref as React.ForwardedRef<HTMLButtonElement>}
    >
      <TouchTarget>{children}</TouchTarget>
    </button>
  )
})

export function TouchTarget({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span
        className="absolute top-1/2 left-1/2 size-[max(100%,2.75rem)] -translate-x-1/2 -translate-y-1/2 pointer-fine:hidden"
        aria-hidden="true"
      />
      {children}
    </>
  )
}
