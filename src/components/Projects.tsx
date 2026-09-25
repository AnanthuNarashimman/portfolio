import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { GithubIcon } from './SocialIcons'
import type { CSSProperties } from 'react'
import { projects, type Project } from '../data/projects'

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

// Stepped 8-bit sky bands for the image placeholder, one palette per card for variety
const SKIES = [
  ['#ffe7a6', '#ffd58a', '#ffc27a', '#ffad70', '#ff9a68', '#f7866a'],
  ['#ffd9b0', '#ffc9a4', '#ffb89a', '#ffa692', '#f7938c', '#ec8088'],
  ['#fff0bf', '#ffe29e', '#ffd07e', '#fcba68', '#f7a45e', '#ee8c56'],
  ['#ffdcc6', '#ffcbb8', '#ffb9aa', '#fca69c', '#f5928f', '#ea7f84'],
]

// Pixel "image" glyph: frame, sun, two mountains ('#' ink, 's' sun, 'm' mountain)
const GLYPH = [
  '################',
  '#..............#',
  '#..........ss..#',
  '#.........ssss.#',
  '#..........ss..#',
  '#..............#',
  '#.....m........#',
  '#....mmm.......#',
  '#...mmmmm..m...#',
  '#..mmmmmmmmmm..#',
  '#.mmmmmmmmmmmm.#',
  '################',
]

function ImagePlaceholder({ index, title }: { index: number; title: string }) {
  const sky = SKIES[index % SKIES.length]
  return (
    <div className="relative aspect-[16/9] overflow-hidden" role="img" aria-label={`${title} screenshot (coming soon)`}>
      <div className="absolute inset-0 flex flex-col">
        {sky.map((c, i) => (
          <div key={i} className="flex-1" style={{ background: c }} />
        ))}
      </div>
      <div className="absolute inset-0 dark:bg-black/35" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <svg viewBox="0 0 16 12" shapeRendering="crispEdges" className="w-20 transition-transform duration-300 group-hover:-translate-y-1" aria-hidden="true">
          {GLYPH.flatMap((row, y) =>
            [...row].map((ch, x) =>
              ch === '.' ? null : (
                <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={ch === 's' ? '#fff7ef' : ch === 'm' ? '#be1a1a' : '#1c0d0a'} />
              ),
            ),
          )}
        </svg>
        <span className="pixel-corners bg-ink/85 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-accent-200 uppercase" style={px(3)}>
          Screenshot coming soon
        </span>
      </div>
    </div>
  )
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="group relative">
      {/* Hard 8-bit offset shadow; the card slides toward it on hover */}
      <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-2 translate-y-2 bg-accent-900/25 dark:bg-black/60" style={px(6)} />
      <div
        className="pixel-corners relative h-full bg-accent-600 p-[3px] transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1 dark:bg-accent-700"
        style={px(6)}
      >
        <div className="pixel-corners flex h-full flex-col overflow-hidden bg-white dark:bg-[#1f1210]" style={px(6)}>
          {project.image ? (
            <img src={project.image} alt={`${project.title} screenshot`} className="aspect-[16/9] w-full object-cover object-top" loading="lazy" />
          ) : (
            <ImagePlaceholder index={index} title={project.title} />
          )}
          <div className="h-[3px] bg-accent-600 dark:bg-accent-700" />

          <div className="flex flex-1 flex-col p-6">
            <div className="flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] uppercase">
              <span className="text-accent-700 dark:text-accent-300">CH {String(index + 1).padStart(2, '0')}</span>
              <span
                className="pixel-corners inline-flex items-center gap-1.5 bg-accent-100 px-2 py-0.5 text-accent-800 dark:bg-white/5 dark:text-accent-200"
                style={px(2)}
              >
                <span aria-hidden="true" className="size-1.5 bg-[#3fae4f]" />
                {project.status}
              </span>
            </div>

            <h3 className="mt-2.5 font-display text-2xl font-semibold tracking-[-0.02em] text-ink dark:text-accent-50">{project.title}</h3>
            <p className="mt-1 text-sm font-medium text-accent-700 dark:text-accent-300">{project.tagline}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted dark:text-accent-100/70">{project.description}</p>

            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
              {project.stack.map((t) => (
                <li
                  key={t}
                  className="pixel-corners bg-accent-50 px-2 py-0.5 font-mono text-[11px] text-accent-800 ring-1 ring-accent-200 dark:bg-white/5 dark:text-accent-100 dark:ring-white/10"
                  style={px(3)}
                >
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-5">
              <div className="h-[2px] bg-accent-100 dark:bg-white/10" />
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
                {project.detail ? (
                  <Link
                    to={`/projects/${project.slug}`}
                    className="group/link inline-flex items-center gap-1.5 text-accent-700 hover:text-accent-800 dark:text-accent-300 dark:hover:text-accent-200"
                  >
                    How it works
                    <ArrowRight className="size-4 transition-transform group-hover/link:translate-x-0.5" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-ink/35 dark:text-accent-100/35" title="Breakdown coming soon">
                    How it works · soon
                  </span>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link inline-flex items-center gap-1.5 text-ink/70 hover:text-ink dark:text-accent-100/70 dark:hover:text-accent-50"
                  >
                    <GithubIcon className="size-4" />
                    Code
                  </a>
                )}
                {project.demo && (
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noreferrer"
                    className="group/link inline-flex items-center gap-1.5 text-ink/70 hover:text-ink dark:text-accent-100/70 dark:hover:text-accent-50"
                  >
                    Live demo
                    <ArrowUpRight className="size-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="mx-auto w-full max-w-7xl scroll-mt-4 px-5 py-24 sm:px-8">
      <div className="lg:px-16">
        <p className="font-mono text-xs tracking-[0.2em] text-accent-700 uppercase dark:text-accent-300">Featured projects</p>
        <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl dark:text-accent-50">Work, live on air.</h2>
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-9 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        {/* Not wired up yet — the full projects page comes later */}
        <a href="#" onClick={(e) => e.preventDefault()} className="group relative inline-flex">
          <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent-900/60" style={px(4)} />
          <span
            className="pixel-corners relative inline-flex items-center gap-2 bg-accent-300 px-6 py-3 text-sm font-bold text-accent-800 transition-[translate,background-color] duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:bg-accent-200 group-active:translate-x-1.5 group-active:translate-y-1.5"
            style={px(4)}
          >
            See all my work
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>
      </div>
    </section>
  )
}
