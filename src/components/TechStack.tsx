import type { CSSProperties } from 'react'
import {
  type BrandIcon,
  siAnthropic,
  siClaude,
  siCrewai,
  siDocker,
  siElectron,
  siExpress,
  siFastapi,
  siFigma,
  siFirebase,
  siFlask,
  siFlutter,
  siGit,
  siGithub,
  siGooglecloud,
  siGooglegemini,
  siHuggingface,
  siJavascript,
  siLangchain,
  siMysql,
  siN8n,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPostgresql,
  siPostman,
  siPython,
  siReact,
  siRender,
  siScikitlearn,
  siSocketdotio,
  siSupabase,
  siTailwindcss,
  siTypescript,
  siVercel,
  siVite,
} from '../data/brandIcons'
import ArcadeBand from './ArcadeBand'

/*
 * Tech-stack interlude: a full-width arcade band (stepped pixel edges, line grid, scanlines)
 * with three rows of pixel tiles marqueeing in alternating directions. Logos are the real brand
 * marks from Simple Icons, stored locally in data/brandIcons.ts (no hot-linking).
 */

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

type Tech = { icon: BrandIcon; name?: string }

const ROWS: { label: string; items: Tech[]; seconds: number }[] = [
  {
    label: 'Languages & frameworks',
    seconds: 42,
    items: [
      { icon: siPython },
      { icon: siJavascript },
      { icon: siTypescript },
      { icon: siOpenjdk, name: 'Java' },
      { icon: siReact },
      { icon: siNextdotjs },
      { icon: siNodedotjs },
      { icon: siExpress },
      { icon: siFlask },
      { icon: siFastapi },
      { icon: siElectron },
      { icon: siFlutter },
      { icon: siTailwindcss },
      { icon: siVite },
    ],
  },
  {
    label: 'AI & agents',
    seconds: 36,
    items: [
      { icon: siGooglegemini, name: 'Gemini' },
      { icon: siClaude },
      { icon: siAnthropic },
      { icon: siLangchain },
      { icon: siCrewai },
      { icon: siN8n },
      { icon: siHuggingface, name: 'Transformers' },
      { icon: siScikitlearn },
      { icon: siSocketdotio },
    ],
  },
  {
    label: 'Data, cloud & tools',
    seconds: 46,
    items: [
      { icon: siFirebase },
      { icon: siSupabase },
      { icon: siMysql },
      { icon: siPostgresql },
      { icon: siGooglecloud },
      { icon: siDocker },
      { icon: siVercel },
      { icon: siRender },
      { icon: siGit },
      { icon: siGithub },
      { icon: siPostman },
      { icon: siFigma },
    ],
  },
]

// Very dark brand colours (Next.js, Vercel, GitHub…) would vanish on the dark band's tiles' shadow side,
// so the tile is always cream and the logo keeps its real colour.
function Tile({ tech }: { tech: Tech }) {
  const name = tech.name ?? tech.icon.title
  return (
    <li className="group relative mx-2.5 shrink-0">
      <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-black/55" style={px(4)} />
      <span
        className="pixel-corners relative flex items-center gap-3 bg-[#fff7ef] py-2.5 pr-4 pl-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
        style={px(4)}
      >
        <svg role="img" aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0" fill={`#${tech.icon.hex}`}>
          <path d={tech.icon.path} />
        </svg>
        <span className="font-mono text-sm font-semibold whitespace-nowrap text-ink">{name}</span>
      </span>
    </li>
  )
}

function Row({ items, seconds, reverse, label }: { items: Tech[]; seconds: number; reverse: boolean; label: string }) {
  return (
    <div className="tech-row relative overflow-hidden py-2" aria-label={label}>
      {/* Two identical lists back to back; the track slides by exactly one list width, so the loop is seamless */}
      <div className={`tech-track flex w-max ${reverse ? 'tech-reverse' : ''}`} style={{ animationDuration: `${seconds}s` }}>
        <ul className="flex">
          {items.map((t) => (
            <Tile key={t.icon.slug} tech={t} />
          ))}
        </ul>
        <ul className="flex" aria-hidden="true">
          {items.map((t) => (
            <Tile key={t.icon.slug} tech={t} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function TechStack() {
  return (
    <ArcadeBand id="tech-stack" label="Tech stack" className="overflow-hidden">
        <div data-reveal className="relative mx-auto mb-10 max-w-7xl px-5 text-center sm:px-8">
          <p className="font-mono text-xs tracking-[0.25em] text-accent-300 uppercase">Tech stack</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-accent-50 sm:text-4xl">
            Tools I reach for,{' '}
            <span className="relative inline-block">
              <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-black/50" />
              <span className="pixel-corners relative inline-block bg-accent-300 px-2.5 pb-0.5 text-accent-800">every day.</span>
            </span>
          </h2>
        </div>

        <div data-reveal className="tech-fade relative space-y-4" style={{ '--reveal-delay': '120ms' } as CSSProperties}>
          {ROWS.map((r, i) => (
            <Row key={r.label} items={r.items} seconds={r.seconds} reverse={i % 2 === 1} label={r.label} />
          ))}
        </div>
    </ArcadeBand>
  )
}
