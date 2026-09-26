import { useEffect, useState, type CSSProperties } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import NpmPackages from '../components/NpmPackages'
import { PixelDivider, PixelRain, ProjectCard } from '../components/Projects'
import ThemeToggle from '../components/ThemeToggle'
import { categories, projects, type Category } from '../data/projects'

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

type Filter = 'All' | Category

/** /projects — every project, filterable by category, plus the published npm packages */
export default function AllProjects() {
  const [filter, setFilter] = useState<Filter>('All')
  const shown = filter === 'All' ? projects : projects.filter((p) => p.category === filter)
  const count = (f: Filter) => (f === 'All' ? projects.length : projects.filter((p) => p.category === f).length)

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'All projects · Ananthu Narashimman'
    return () => {
      document.title = 'Ananthu Narashimman — Agentic AI, Developer Tools, Full-Stack'
    }
  }, [])

  return (
    <main className="page-bg min-h-dvh bg-paper transition-colors duration-300">
      <section className="relative isolate mx-auto w-full max-w-7xl px-5 sm:px-8">
        <PixelRain />

        <div className="flex items-center justify-between py-6">
          <Link
            to="/#projects"
            className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-ink/70 uppercase hover:text-accent-700 dark:text-accent-100/70 dark:hover:text-accent-300"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Home
          </Link>
          <ThemeToggle />
        </div>

        <header className="pt-8 lg:px-16">
          <p className="font-mono text-xs tracking-[0.2em] text-accent-700 uppercase dark:text-accent-300">All projects · {projects.length}</p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-[-0.035em] text-ink sm:text-6xl dark:text-accent-50">Some things I’ve shipped.</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted dark:text-accent-100/75">
            Products, experiments and hackathon builds, some live, some retired. Filter by what you’re curious about.
          </p>

          {/* Category filter */}
          <div className="mt-8 flex flex-wrap gap-3" role="tablist" aria-label="Filter projects by category">
            {(['All', ...categories] as Filter[]).map((f) => {
              const active = f === filter
              return (
                <button key={f} type="button" role="tab" aria-selected={active} onClick={() => setFilter(f)} className="group relative inline-flex">
                  <span
                    aria-hidden="true"
                    className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/40 dark:bg-black/60"
                    style={px(3)}
                  />
                  <span
                    className={`pixel-corners relative inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-[translate,background-color] duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 ${
                      active
                        ? 'translate-x-0.5 translate-y-0.5 bg-accent-600 text-accent-50 dark:bg-accent-600'
                        : 'bg-white text-ink ring-1 ring-accent-200 ring-inset dark:bg-[#241412] dark:text-accent-100 dark:ring-white/10'
                    }`}
                    style={px(3)}
                  >
                    {f}
                    <span className={`font-mono text-xs ${active ? 'text-accent-200' : 'text-accent-700 dark:text-accent-300'}`}>{count(f)}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </header>

        <div className="mx-auto mt-12 grid max-w-6xl gap-9 md:grid-cols-2">
          {shown.map((p) => (
            <ProjectCard key={p.slug} project={p} index={projects.indexOf(p)} />
          ))}
        </div>

        <NpmPackages />

        <PixelDivider />
      </section>
      <div className="h-24" />
    </main>
  )
}
