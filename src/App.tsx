import type React from 'react'
import Breather from './components/Breather'
import Contact from './components/Contact'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import PixelWaves from './components/PixelWaves'
import Projects from './components/Projects'
import SocialRail from './components/SocialRail'

export default function App() {
  return (
    <main className="page-bg bg-white transition-colors duration-300">
      <div className="min-h-dvh p-2.5 sm:p-4 lg:h-dvh">
        {/* Hero card: stepped pixel corners, with a hard pixel shadow block behind (clip-path can't carry a box-shadow) */}
        <div className="relative lg:h-full">
          <div
            aria-hidden="true"
            className="pixel-corners absolute inset-0 translate-x-1.5 translate-y-2 bg-accent-900/20 dark:bg-black/55"
            style={{ '--px': '12px' } as React.CSSProperties}
          />
          {/* Light pixel stroke: a frame 2px larger than the card, following the same stepped corners */}
          <div
            aria-hidden="true"
            className="pixel-corners absolute -inset-[2px] bg-accent-300/80 dark:bg-accent-400/45"
            style={{ '--px': '12px' } as React.CSSProperties}
          />
          <div
            className="pixel-corners relative isolate flex min-h-[calc(100dvh-1.25rem)] flex-col overflow-hidden bg-accent-700 dark:bg-accent-900 sm:min-h-[calc(100dvh-2rem)] lg:h-full lg:min-h-0"
            style={{ '--px': '12px' } as React.CSSProperties}
          >
            {/* Background: crimson to vermilion with warm gold glows (deeper, moodier crimson in dark mode) */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-accent-700 to-accent-800 transition-opacity duration-300 dark:opacity-0" />
              <div className="hero-dark-bg absolute inset-0 opacity-0 transition-opacity duration-300 dark:opacity-100" />
              <div className="absolute -top-40 left-1/3 size-[36rem] rounded-full bg-accent-500/50 blur-3xl transition-opacity duration-300 dark:opacity-0" />
              <div className="absolute -right-32 -bottom-56 size-[34rem] rounded-full bg-accent-300/15 blur-3xl transition-opacity duration-300 dark:opacity-0" />
              <div className="bg-grid absolute inset-0" />
            </div>

            <PixelWaves />
            <Navbar />
            <Hero />
            <SocialRail />
          </div>
        </div>
      </div>

      <Breather />
      <Projects />
      <Contact />
    </main>
  )
}
