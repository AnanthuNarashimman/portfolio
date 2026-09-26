import { useEffect, useState } from 'react'
import { m } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import avatar from '../assets/avatar.webp'
import { navLinks, profile } from '../data/profile'
import PixelButton from './PixelButton'
import ThemeToggle from './ThemeToggle'

/*
 * Scroll behaviour: slides up out of view while you scroll down, comes back the moment you scroll up.
 * Over the hero it's the translucent pill; once the page has scrolled it turns solid crimson so it
 * stays readable over the light sections.
 */
function useScrollNav() {
  const [state, setState] = useState({ hidden: false, solid: false })
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const update = () => {
      raf = 0
      const y = window.scrollY
      const delta = y - last
      // Ignore tiny jitters (trackpads, momentum) so it doesn't flicker
      if (Math.abs(delta) < 6 && y > 80) return
      setState((s) => {
        const hidden = y > 120 && delta > 0 ? true : delta < 0 || y <= 120 ? false : s.hidden
        const solid = y > 40
        return hidden === s.hidden && solid === s.solid ? s : { hidden, solid }
      })
      last = y
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])
  return state
}

// One pill: avatar on the left, section links in the middle, "Let's talk" on the right
export default function Navbar() {
  const { hidden, solid } = useScrollNav()
  // Keyboard users tabbing into a hidden navbar get it back. Only real keyboard focus counts: a mouse
  // click (e.g. on the theme toggle) also focuses, and that mustn't pin the navbar in place
  const [focused, setFocused] = useState(false)
  const out = hidden && !focused

  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 px-[30px] pt-[30px] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-12 sm:pt-9 lg:px-[112px] ${
        out ? '-translate-y-[calc(100%+12px)]' : ''
      }`}
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false)
      }}
    >
      <m.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mx-auto flex w-full max-w-7xl justify-center"
      >
        <div
          className={`flex w-full items-center gap-1 rounded-full border p-1.5 transition-[background-color,border-color,box-shadow] duration-300 md:w-auto ${
            solid
              ? 'border-accent-300/30 bg-accent-700 shadow-[0_10px_28px_-10px_rgb(74_11_11/0.55)] dark:border-accent-400/30 dark:bg-accent-900'
              : 'border-accent-200/20 bg-white/[0.07]'
          }`}
        >
          <a href="#" aria-label={`${profile.firstName} ${profile.lastName} — home`} className="shrink-0 rounded-full">
            <img
              src={avatar}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full ring-2 ring-accent-200/40 transition-shadow hover:ring-accent-300"
            />
          </a>

          <nav className="mx-1 mr-auto hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                className="rounded-full px-4 py-1.5 text-sm text-accent-100/75 transition-colors hover:bg-white/10 hover:text-accent-50"
              >
                {link}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex md:ml-0">
            <ThemeToggle />
          </div>
          <PixelButton href={`mailto:${profile.email}`} variant="cream" className="mr-1 ml-2">
            Let's talk
            <ArrowUpRight className="size-4" />
          </PixelButton>
        </div>
      </m.header>
    </div>
  )
}
