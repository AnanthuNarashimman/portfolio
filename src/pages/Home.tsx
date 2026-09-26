import { lazy, Suspense, useEffect, useSyncExternalStore, type CSSProperties } from 'react'
import { useLocation } from 'react-router'
import { useAfterIntro } from '../lib/intro'
import Experience from '../components/Experience'
import Hero from '../components/Hero'
import Navbar from '../components/Navbar'
import PixelWaves from '../components/PixelWaves'
import Projects from '../components/Projects'
import SocialRail from '../components/SocialRail'

// Loaded as its own chunk: the logo paths are heavy and the section sits far down the page
const TechStack = lazy(() => import('../components/TechStack'))
// Desktop-only pixel-art interlude: its art generator is heavy, so it loads after the hero
const Breather = lazy(() => import('../components/Breather'))
const Hackathons = lazy(() => import('../components/Hackathons'))
const Now = lazy(() => import('../components/Now'))

function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = matchMedia(query)
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => matchMedia(query).matches,
  )
}

export default function Home() {
  const { hash } = useLocation()
  // The interlude only shows at lg+, so phones never download its chunk
  const desktop = useMedia('(min-width: 1024px)')
  // Lazy sections below the fold load once the opening animation and hero entrance are done, so their
  // download, parse and first render never compete with those animations (sooner if a #section was asked for)
  const later = useAfterIntro(hash ? 0 : 700)

  // Arriving at /#section (e.g. back from a project page): sections below load lazily, so wait for
  // the target to exist, jump to it, then re-align once the lazy chunks above it have settled
  useEffect(() => {
    if (!hash) return
    let tries = 0
    let raf = 0
    const settle = setTimeout(() => document.querySelector(hash)?.scrollIntoView(), 700)
    const find = () => {
      const el = document.querySelector(hash)
      if (el) el.scrollIntoView()
      else if (tries++ < 360) raf = requestAnimationFrame(find)
    }
    raf = requestAnimationFrame(find)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(settle)
    }
  }, [hash])

  return (
    <main className="page-bg bg-paper transition-colors duration-300">
      <Navbar />
      <div className="min-h-dvh p-2.5 sm:p-4 lg:h-dvh">
        {/* Hero card: stepped pixel corners, with a hard pixel shadow block behind (clip-path can't carry a box-shadow) */}
        <div data-pause className="relative lg:h-full">
          <div
            aria-hidden="true"
            className="pixel-corners absolute inset-0 translate-x-1.5 translate-y-2 bg-accent-900/20 dark:bg-black/55"
            style={{ '--px': '12px' } as CSSProperties}
          />
          {/* Light pixel stroke: a frame 2px larger than the card, following the same stepped corners */}
          <div
            aria-hidden="true"
            className="pixel-corners absolute -inset-[2px] bg-accent-300/80 dark:bg-accent-400/45"
            style={{ '--px': '12px' } as CSSProperties}
          />
          <div
            className="pixel-corners relative isolate flex min-h-[calc(100dvh-1.25rem)] flex-col overflow-hidden bg-accent-700 dark:bg-accent-900 sm:min-h-[calc(100dvh-2rem)] lg:h-full lg:min-h-0"
            style={{ '--px': '12px' } as CSSProperties}
          >
            {/* Background: crimson to vermilion with warm gold glows (deeper, moodier crimson in dark mode) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-accent-700 to-accent-800 transition-opacity duration-300 dark:opacity-0" />
              <div className="hero-dark-bg absolute inset-0 opacity-0 transition-opacity duration-300 dark:opacity-100" />
              {/* Warm glows as radial gradients, not blurred circles: same softness, a fraction of the paint cost */}
              <div className="hero-glow-a absolute -top-48 left-[calc(33%-2rem)] size-[40rem] transition-opacity duration-300 dark:opacity-0" />
              <div className="hero-glow-b absolute -right-36 -bottom-60 size-[38rem] transition-opacity duration-300 dark:opacity-0" />
              <div className="bg-grid absolute inset-0" />
            </div>

            <PixelWaves />
            {/* Holds the navbar's place; the navbar itself is fixed (outside the clipped card) so it can follow the scroll */}
            <div aria-hidden="true" className="h-[74px] shrink-0" />
            <Hero />
            <SocialRail />
          </div>
        </div>
      </div>

      {desktop &&
        (later ? (
          <Suspense fallback={<div aria-hidden="true" className="mt-16 hidden h-[calc(343.5px+min(420px,(100vw-80px)*0.34375))] lg:block" />}>
            <Breather />
          </Suspense>
        ) : (
          <div aria-hidden="true" className="mt-16 hidden h-[calc(343.5px+min(420px,(100vw-80px)*0.34375))] lg:block" />
        ))}
      <Projects />
      {later ? (
        <Suspense fallback={<div className="h-[520px]" />}>
          <TechStack />
        </Suspense>
      ) : (
        <div className="h-[520px]" />
      )}
      <Experience />
      {later ? (
        <Suspense fallback={<div className="h-[640px]" />}>
          <Hackathons />
        </Suspense>
      ) : (
        <div className="h-[640px]" />
      )}
      {later ? (
        <Suspense fallback={<div className="h-[900px]" />}>
          <Now />
        </Suspense>
      ) : (
        <div className="h-[900px]" />
      )}
    </main>
  )
}
