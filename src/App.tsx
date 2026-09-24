import Hero from './components/Hero'
import Navbar from './components/Navbar'
import PixelWaves from './components/PixelWaves'

export default function App() {
  return (
    <main className="min-h-dvh bg-white p-2.5 sm:p-4 lg:h-dvh">
      {/* Hero card */}
      <div className="relative isolate flex min-h-[calc(100dvh-1.25rem)] flex-col overflow-hidden rounded-[1.75rem] bg-accent-700 shadow-2xl shadow-accent-800/30 sm:min-h-[calc(100dvh-2rem)] sm:rounded-[2rem] lg:h-full lg:min-h-0">
        {/* Background: crimson to vermilion with warm gold glows */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-accent-700 to-accent-800" />
          <div className="absolute -top-40 left-1/3 size-[36rem] rounded-full bg-accent-500/50 blur-3xl" />
          <div className="absolute -right-32 -bottom-56 size-[34rem] rounded-full bg-accent-300/15 blur-3xl" />
          <div className="bg-grid absolute inset-0" />
        </div>

        <PixelWaves />
        <Navbar />
        <Hero />
      </div>
    </main>
  )
}
