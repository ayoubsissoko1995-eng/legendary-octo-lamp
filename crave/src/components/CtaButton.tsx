import type { ButtonHTMLAttributes } from 'react'

type CtaButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  soldOut?: boolean
}

export function CtaButton({
  soldOut = false,
  children,
  className = '',
  ...props
}: CtaButtonProps) {
  if (soldOut) {
    return (
      <button
        type="button"
        disabled
        className={`w-full border-2 border-scarce px-8 py-4 text-base font-bold uppercase tracking-widest text-scarce sm:w-auto ${className}`}
        {...props}
      >
        Sold Out
      </button>
    )
  }

  return (
    <button
      type="button"
      className={`w-full border border-ink bg-ink px-8 py-4 text-base font-bold uppercase tracking-widest text-paper transition-colors active:bg-paper active:text-ink sm:w-auto ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
