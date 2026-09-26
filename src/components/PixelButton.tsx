import type { ReactNode } from 'react'

const faces = {
  gold: 'bg-accent-300 text-accent-800 group-hover:bg-accent-200',
  cream: 'bg-accent-50 text-accent-800 group-hover:bg-accent-200',
}

/*
 * Pixel-art button: stepped corners and a hard offset "8-bit" shadow block behind it.
 * On hover the face shifts toward the shadow, on press it lands on it, like a pushed key.
 */
export default function PixelButton({
  href,
  onClick,
  children,
  variant = 'gold',
  className = '',
}: {
  href?: string
  onClick?: () => void
  children: ReactNode
  variant?: keyof typeof faces
  className?: string
}) {
  const cls = `group relative inline-flex shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-300 ${className}`
  const inner = (
    <>
      <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/60" />
      <span
        className={`pixel-corners relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-[translate,background-color] duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-active:translate-x-1 group-active:translate-y-1 ${faces[variant]}`}
      >
        {children}
      </span>
    </>
  )
  // A link when there's somewhere to go, a button when it triggers something on the page
  return href ? (
    <a href={href} onClick={onClick} className={cls}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}
