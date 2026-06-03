import clsx from 'clsx'
import React, { forwardRef } from 'react'

import { TouchTarget } from './button'

const colors = {
  red: 'bg-red-500/15 text-red-700 hover:bg-red-500/25 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20',
  amber:
    'bg-amber-400/20 text-amber-700 hover:bg-amber-400/30 dark:bg-amber-400/10 dark:text-amber-400 dark:hover:bg-amber-400/15',
  green:
    'bg-green-500/15 text-green-700 hover:bg-green-500/25 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20',
  zinc: 'bg-zinc-600/10 text-zinc-700 hover:bg-zinc-600/20 dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10',
}

type BadgeProps = { color?: keyof typeof colors }

export function Badge({ color = 'zinc', className, ...props }: BadgeProps & React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span
      {...props}
      className={clsx(
        className,
        'inline-flex items-center gap-x-1.5 rounded-md px-1.5 py-0.5 text-sm/5 font-medium sm:text-xs/5 forced-colors:outline',
        colors[color],
      )}
    />
  )
}

type BadgeButtonProps = BadgeProps &
  { className?: string; children: React.ReactNode } & (
    | ({ href?: never } & Omit<React.ComponentPropsWithoutRef<'button'>, 'className'>)
    | ({ href: string } & Omit<React.ComponentPropsWithoutRef<'a'>, 'className'>)
  )

export const BadgeButton = forwardRef(function BadgeButton(
  { color = 'zinc', className, children, ...props }: BadgeButtonProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const classes = clsx(
    className,
    'group relative inline-flex rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
  )

  if ('href' in props && typeof props.href === 'string') {
    const { href, ...anchorProps } = props

    return (
      <a {...anchorProps} href={href} className={classes} ref={ref as React.ForwardedRef<HTMLAnchorElement>}>
        <TouchTarget>
          <Badge color={color}>{children}</Badge>
        </TouchTarget>
      </a>
    )
  }

  return (
    <button {...props} type={props.type ?? 'button'} className={classes} ref={ref as React.ForwardedRef<HTMLButtonElement>}>
      <TouchTarget>
        <Badge color={color}>{children}</Badge>
      </TouchTarget>
    </button>
  )
})
