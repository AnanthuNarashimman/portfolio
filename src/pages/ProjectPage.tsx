import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router'
import { GithubIcon } from '../components/SocialIcons'
import ThemeToggle from '../components/ThemeToggle'
import { projects } from '../data/projects'

/*
 * /projects/:slug — a short, readable breakdown of one project (not a README): the problem,
 * what was built, the few features that matter, how data flows, the stack by layer, and a takeaway.
 */

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs tracking-[0.2em] text-accent-700 uppercase dark:text-accent-300">{children}</p>
}

/** Pixel button (stepped corners + hard offset shadow) as a link */
function PixelLink({ href, children, tone = 'gold', external }: { href: string; children: ReactNode; tone?: 'gold' | 'ink'; external?: boolean }) {
  const face =
    tone === 'gold'
      ? 'bg-accent-300 text-accent-800 group-hover:bg-accent-200'
      : 'bg-ink text-accent-50 group-hover:bg-accent-800 dark:bg-accent-50 dark:text-ink dark:group-hover:bg-accent-200'
  const inner = (
    <>
      <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/50 dark:bg-black/60" style={px(4)} />
      <span
        className={`pixel-corners relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold transition-[translate,background-color] duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-active:translate-x-1 group-active:translate-y-1 ${face}`}
        style={px(4)}
      >
        {children}
      </span>
    </>
  )
  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className="group relative inline-flex">
      {inner}
    </a>
  ) : (
    <Link to={href} className="group relative inline-flex">
      {inner}
    </Link>
  )
}

/** Card with the same crimson pixel frame as the project cards */
function PixelPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent-900/20 dark:bg-black/55" style={px(6)} />
      <div className="pixel-corners relative h-full bg-accent-600 p-[2px] dark:bg-accent-700" style={px(6)}>
        <div className="pixel-corners h-full bg-white dark:bg-[#1f1210]" style={px(6)}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProjectPage() {
  const { slug } = useParams()
  const index = projects.findIndex((p) => p.slug === slug)
  const project = projects[index]

  useEffect(() => {
    window.scrollTo(0, 0)
    if (project) document.title = `${project.title} — how it works · Ananthu Narashimman`
    return () => {
      document.title = 'Ananthu Narashimman — Agentic AI, Developer Tools, Full-Stack'
    }
  }, [project])

  if (!project?.detail) return <Navigate to="/#projects" replace />
  const d = project.detail

  return (
    <main className="page-bg min-h-dvh bg-paper pb-24 transition-colors duration-300">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-6">
          <Link
            to="/#projects"
            className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-ink/70 uppercase hover:text-accent-700 dark:text-accent-100/70 dark:hover:text-accent-300"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            All projects
          </Link>
          <ThemeToggle />
        </div>

        {/* Header */}
        <header className="pt-6 pb-10">
          <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase">
            <span className="text-accent-700 dark:text-accent-300">CH {String(index + 1).padStart(2, '0')}</span>
            <span className="pixel-corners inline-flex items-center gap-1.5 bg-accent-100 px-2 py-0.5 text-accent-800 dark:bg-white/5 dark:text-accent-200" style={px(2)}>
              <span aria-hidden="true" className="size-1.5 bg-[#3fae4f]" />
              {project.status}
            </span>
          </div>
          <h1 className="mt-4 font-display text-5xl font-semibold tracking-[-0.035em] text-ink sm:text-6xl dark:text-accent-50">{project.title}</h1>
          <p className="mt-3 text-xl font-medium text-accent-700 dark:text-accent-300">{project.tagline}</p>
          <div className="mt-7 flex flex-wrap gap-4">
            {project.demo && (
              <PixelLink href={project.demo} external>
                Live demo <ArrowUpRight className="size-4" />
              </PixelLink>
            )}
            {project.github && (
              <PixelLink href={project.github} tone="ink" external>
                <GithubIcon className="size-4" /> Source code
              </PixelLink>
            )}
          </div>
        </header>

        {/* Screenshot */}
        {project.image && (
          <PixelPanel>
            <img src={project.image} alt={`${project.title} screenshot`} className="pixel-corners block w-full" style={px(6)} />
          </PixelPanel>
        )}

        {/* Problem → build */}
        <section className="mt-20 grid gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>The problem</Eyebrow>
            <p className="mt-3 text-lg leading-relaxed text-ink/80 dark:text-accent-100/80">{d.problem}</p>
          </div>
          <div>
            <Eyebrow>What I built</Eyebrow>
            <p className="mt-3 text-lg leading-relaxed text-ink/80 dark:text-accent-100/80">{d.build}</p>
          </div>
        </section>

        {/* Highlights */}
        <section className="mt-20">
          <Eyebrow>What makes it work</Eyebrow>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {d.highlights.map((h, i) => (
              <PixelPanel key={h.title}>
                <div className="p-6">
                  <span className="font-mono text-xs text-accent-700 dark:text-accent-300">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-1 font-display text-xl font-semibold text-ink dark:text-accent-50">{h.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted dark:text-accent-100/70">{h.text}</p>
                </div>
              </PixelPanel>
            ))}
          </div>
        </section>

        {/* Flow */}
        <section className="mt-20">
          <Eyebrow>{d.flowTitle ?? 'How it flows'}</Eyebrow>
          <ol className="mt-6 grid gap-4 md:grid-cols-5">
            {d.flow.map((s, i) => (
              <li key={s.title} className="relative">
                <div className="pixel-corners h-full bg-accent-100 p-5 dark:bg-white/5" style={px(4)}>
                  <span className="pixel-corners inline-grid size-7 place-items-center bg-accent-600 font-mono text-xs font-bold text-white" style={px(2)}>
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink dark:text-accent-50">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted dark:text-accent-100/70">{s.text}</p>
                </div>
                {i < d.flow.length - 1 && (
                  <ArrowRight aria-hidden="true" className="absolute top-1/2 -right-4 z-10 hidden size-4 -translate-y-1/2 text-accent-600 md:block dark:text-accent-400" />
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* Stack */}
        <section className="mt-20">
          <Eyebrow>Tech stack</Eyebrow>
          <PixelPanel className="mt-6">
            <dl className="divide-y-2 divide-accent-100 dark:divide-white/10">
              {d.stack.map((g) => (
                <div key={g.group} className="grid gap-3 px-6 py-4 sm:grid-cols-[10rem_1fr] sm:items-center">
                  <dt className="font-mono text-xs tracking-[0.16em] text-accent-700 uppercase dark:text-accent-300">{g.group}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {g.items.map((t) => (
                      <span
                        key={t}
                        className="pixel-corners bg-accent-50 px-2.5 py-1 font-mono text-xs text-accent-800 ring-1 ring-accent-200 dark:bg-white/5 dark:text-accent-100 dark:ring-white/10"
                        style={px(3)}
                      >
                        {t}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </PixelPanel>
        </section>

        {/* Roles */}
        {d.roles && (
          <section className="mt-20">
            <Eyebrow>{d.rolesTitle ?? 'Who does what'}</Eyebrow>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {d.roles.map((r) => (
                <PixelPanel key={r.role}>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-ink dark:text-accent-50">{r.role}</h3>
                    <ul className="mt-3 space-y-2">
                      {r.can.map((c) => (
                        <li key={c} className="flex gap-2.5 text-[15px] leading-snug text-muted dark:text-accent-100/70">
                          <span aria-hidden="true" className="mt-[7px] size-1.5 shrink-0 bg-accent-600 dark:bg-accent-400" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </PixelPanel>
              ))}
            </div>
          </section>
        )}

        {/* Takeaway */}
        <section className="mt-20">
          <div className="flex gap-5">
            <div aria-hidden="true" className="flex flex-col gap-1.5 pt-1.5">
              {[1, 0.7, 0.45, 0.25].map((o) => (
                <span key={o} className="size-2 bg-accent-600 dark:bg-accent-400" style={{ opacity: o }} />
              ))}
            </div>
            <div>
              <Eyebrow>What I took away</Eyebrow>
              <p className="mt-3 max-w-3xl font-display text-2xl leading-snug font-medium tracking-[-0.01em] text-ink dark:text-accent-50">{d.takeaway}</p>
            </div>
          </div>
        </section>

        {/* Where it's going */}
        {d.next && (
          <section className="mt-24">
            <PixelPanel>
              <div className="p-8 sm:p-10">
                <div className="flex flex-wrap items-center gap-3">
                  <Eyebrow>Where it’s going</Eyebrow>
                  <span
                    className="pixel-corners bg-accent-100 px-2 py-0.5 font-mono text-[11px] tracking-[0.14em] text-accent-800 uppercase dark:bg-white/5 dark:text-accent-200"
                    style={px(2)}
                  >
                    {d.next.status}
                  </span>
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-0.025em] text-ink sm:text-4xl dark:text-accent-50">{d.next.headline}</h2>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed text-ink/80 dark:text-accent-100/80">{d.next.summary}</p>

                <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                  {d.next.ideas.map((idea) => (
                    <div key={idea.title} className="flex gap-3">
                      <span aria-hidden="true" className="mt-2 size-2 shrink-0 bg-accent-600 dark:bg-accent-400" />
                      <div>
                        <h3 className="font-display text-lg font-semibold text-ink dark:text-accent-50">{idea.title}</h3>
                        <p className="mt-1 text-[15px] leading-relaxed text-muted dark:text-accent-100/70">{idea.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-10 font-mono text-xs tracking-[0.2em] text-accent-700 uppercase dark:text-accent-300">Roadmap</p>
                <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {d.next.phases.map((ph, i) => (
                    <li key={ph.title} className="pixel-corners bg-accent-50 p-4 ring-1 ring-accent-200 dark:bg-white/5 dark:ring-white/10" style={px(4)}>
                      <span className="font-mono text-[11px] text-accent-700 dark:text-accent-300">PHASE {i}</span>
                      <h4 className="mt-1 font-display text-base font-semibold text-ink dark:text-accent-50">{ph.title}</h4>
                      <p className="mt-1 text-[13px] leading-snug text-muted dark:text-accent-100/70">{ph.text}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </PixelPanel>
          </section>
        )}

        <div className="mt-20 flex justify-center">
          <PixelLink href="/#projects">
            <ArrowLeft className="size-4" /> Back to all projects
          </PixelLink>
        </div>
      </div>
    </main>
  )
}
