import { useEffect, useState } from 'react'
import PixelIcon from './PixelIcon'

type Theme = 'light' | 'dark'

function readSaved(): Theme | null {
  try {
    const t = localStorage.getItem('theme')
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function apply(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/*
 * Pixel toggle switch: a track showing both a sun and a moon, with a cream pixel knob that
 * slides over the active one. Starts from whatever index.html applied before paint (saved
 * choice, else the system setting), follows system changes until the visitor picks one,
 * then remembers that choice.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  )
  const dark = theme === 'dark'

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => {
      if (readSaved()) return
      const next = e.matches ? 'dark' : 'light'
      apply(next)
      setTheme(next)
    }
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  function toggle() {
    const next = dark ? 'light' : 'dark'
    apply(next)
    setTheme(next)
    try {
      localStorage.setItem('theme', next)
    } catch {
      // storage unavailable — the choice still applies for this visit
    }
  }

  const icon = (active: boolean) =>
    `relative z-10 grid size-8 place-items-center transition-colors duration-300 ${active ? 'text-accent-800' : 'text-accent-100/70 group-hover:text-accent-50'}`

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Dark theme"
      title={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggle}
      className="group relative inline-flex shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-300"
    >
      {/* Hard offset pixel shadow, like the other pixel buttons */}
      <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/60" />
      {/* Track */}
      <span className="pixel-corners relative flex h-10 w-[76px] items-center bg-accent-900/45 p-1">
        {/* Knob slides over the active icon */}
        <span
          aria-hidden="true"
          className={`pixel-corners absolute top-1 left-1 size-8 bg-accent-50 transition-transform duration-300 ease-out group-hover:bg-accent-200 ${dark ? 'translate-x-9' : ''}`}
        />
        <span className={icon(!dark)}>
          <PixelIcon name="sun" className="size-[18px]" />
        </span>
        <span className={`${icon(dark)} ml-auto`}>
          <PixelIcon name="moon" className="size-[18px]" />
        </span>
      </span>
    </button>
  )
}
