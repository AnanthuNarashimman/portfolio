import { useId, useState, type CSSProperties, type ReactNode } from 'react'
import { experience, type Experience as Exp } from '../data/experience'
import PixelIcon from './PixelIcon'
import type { PixelIconName } from './pixelIcons'
import './experience.css'
import './projects.css' // card-body / card-grid textures

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

// Deterministic pseudo-random so the side pixels are the same every render
const rand = (i: number, k: number) => (((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1) + 1) % 1

// Pixels streaming in from the section's left and right edges
const STREAMS = Array.from({ length: 26 }, (_, i) => ({
  side: i % 2 ? 'right' : 'left',
  top: `${4 + rand(i, 1) * 92}%`,
  size: rand(i, 2) > 0.6 ? 10 : 6,
  len: 3 + Math.floor(rand(i, 3) * 3),
  dur: 7 + rand(i, 4) * 8,
  delay: -rand(i, 5) * 15,
  gold: rand(i, 6) > 0.45,
}))

function SidePixels() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {STREAMS.map((s, i) => (
        <span key={i} className={`exp-stream exp-stream-${s.side}`} style={{ top: s.top, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}>
          {Array.from({ length: s.len }, (_, k) => (
            <i
              key={k}
              className={s.gold ? 'bg-accent-300 dark:bg-accent-300/70' : 'bg-accent-500/70 dark:bg-accent-500/60'}
              style={{ width: s.size, height: s.size, opacity: ((s.side === 'left' ? k + 1 : s.len - k) / s.len) * 0.9 }}
            />
          ))}
        </span>
      ))}
    </div>
  )
}

/** Square pixel node on the rail; the current role's node pulses */
function Node({ current }: { current?: boolean }) {
  return (
    <span aria-hidden="true" className="relative grid size-6 place-items-center">
      {current && <span className="exp-pulse absolute inset-0 bg-accent-400/60" />}
      <span className={`relative size-6 p-[4px] ${current ? 'bg-accent-300' : 'bg-accent-600 dark:bg-accent-500'}`}>
        <span className={`block size-full ${current ? 'bg-accent-600' : 'bg-accent-300'}`} />
      </span>
    </span>
  )
}

/** Pixel-art icon tile for the organisation */
function IconTile({ icon, current }: { icon: PixelIconName; current?: boolean }) {
  return (
    <span className="relative inline-flex shrink-0">
      <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/40" style={px(4)} />
      <span
        className={`pixel-corners relative grid size-14 place-items-center ${
          current ? 'bg-accent-300 text-accent-800' : 'bg-accent-600 text-accent-50 dark:bg-accent-700'
        }`}
        style={px(4)}
      >
        <PixelIcon name={icon} className="size-8" />
      </span>
    </span>
  )
}

/** XP bar: fills a few more pixels at every level */
function XpBar({ level, total, onGold }: { level: number; total: number; onGold?: boolean }) {
  const cells = 12
  const filled = Math.round((level / total) * cells)
  return (
    <span aria-hidden="true" className="flex gap-[3px]">
      {Array.from({ length: cells }, (_, i) => (
        <span key={i} className={`h-2 w-2 ${i < filled ? (onGold ? 'bg-accent-700' : 'bg-accent-300') : onGold ? 'bg-accent-700/20' : 'bg-black/20'}`} />
      ))}
    </span>
  )
}

// Tiny 7×7 glyphs for the story tiles ('#' = pixel)
const GLYPHS = {
  owned: ['##.....', '#####..', '#######', '#####..', '##.....', '#......', '#......'], // flag
  call: ['...###.', '..###..', '.###...', '#######', '...###.', '..###..', '.###...'], // bolt
  impact: ['...#...', '..###..', '.#####.', '#######', '..###..', '..###..', '..###..'], // arrow up
}

function Glyph({ name }: { name: keyof typeof GLYPHS }) {
  return (
    <svg viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true" className="size-3.5" fill="currentColor">
      {GLYPHS[name].flatMap((row, y) => [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)))}
    </svg>
  )
}

/** One story tile: pixel header strip with a glyph, then the text */
function StoryTile({ label, glyph, highlight, children }: { label: string; glyph: keyof typeof GLYPHS; highlight?: boolean; children: ReactNode }) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/15 dark:bg-black/50" style={px(4)} />
      <div className={`pixel-corners relative flex h-full flex-col p-[2px] ${highlight ? 'bg-accent-300' : 'bg-accent-600 dark:bg-accent-700'}`} style={px(4)}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.16em] uppercase ${
            highlight ? 'bg-accent-300 text-accent-800' : 'bg-accent-600 text-accent-50 dark:bg-accent-700'
          }`}
        >
          <Glyph name={glyph} />
          {label}
        </div>
        <p
          className={`flex-1 px-3 py-3 text-[14.5px] leading-relaxed ${
            highlight ? 'bg-[#fffaf0] text-ink dark:bg-[#2c1a10] dark:text-accent-50' : 'bg-[#fffaf5] text-ink/80 dark:bg-[#241412] dark:text-accent-100/80'
          }`}
        >
          {children}
        </p>
      </div>
    </div>
  )
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span
      className="pixel-corners bg-accent-50 px-2 py-0.5 font-mono text-[11px] text-accent-800 ring-1 ring-accent-200 dark:bg-white/5 dark:text-accent-100 dark:ring-white/10"
      style={px(3)}
    >
      {children}
    </span>
  )
}

function Card({ item, level, total, last }: { item: Exp; level: number; total: number; last: boolean }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  return (
    <li data-reveal className="relative grid grid-cols-[1.5rem_1fr] gap-5 sm:gap-8">
      {/* Rail segment: from this node down to the next (older) one; the oldest item ends the rail */}
      {!last && (
        <span aria-hidden="true" className="absolute top-10 bottom-[calc(-2.5rem-1.75rem)] left-[11px] w-[2px] bg-accent-600/70 dark:bg-accent-500/60" />
      )}
      <div className="relative flex justify-center pt-7">
        <Node current={item.current} />
      </div>

      <article className="group relative">
        <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-2 translate-y-2 bg-accent-900/25 dark:bg-black/60" style={px(6)} />
        <div
          className={`pixel-corners relative p-[3px] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5 ${
            item.current ? 'bg-accent-300 dark:bg-accent-300' : 'bg-accent-600 dark:bg-accent-700'
          }`}
          style={px(6)}
        >
          <div className="card-body pixel-corners relative overflow-hidden" style={px(6)}>
            <div aria-hidden="true" className="card-grid pointer-events-none absolute inset-0" />

            {/* Header strip */}
            <div
              className={`relative flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 font-mono text-[11px] tracking-[0.18em] uppercase sm:px-7 ${
                item.current ? 'bg-accent-300 text-accent-800' : 'bg-accent-600 text-accent-50 dark:bg-accent-700'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="font-bold">LVL {String(level).padStart(2, '0')}</span>
                <XpBar level={level} total={total} onGold={item.current} />
              </span>
              <span className="flex items-center gap-2">
                {item.current && (
                  <span className="inline-flex items-center gap-1.5 font-bold">
                    <span aria-hidden="true" className="exp-blink size-1.5 bg-accent-700" />
                    Now
                  </span>
                )}
                <span className={item.current ? 'text-accent-800/80' : 'text-accent-100'}>{item.dates}</span>
              </span>
            </div>

            <div className="relative p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <IconTile icon={item.icon} current={item.current} />
                <div className="min-w-0">
                  <h3 className="font-display text-2xl leading-tight font-semibold tracking-[-0.02em] text-ink dark:text-accent-50">{item.role}</h3>
                  <p className="mt-1 text-[15px] font-medium text-accent-700 dark:text-accent-300">
                    {item.org}
                    {item.meta && <span className="text-ink/50 dark:text-accent-100/50"> · {item.meta}</span>}
                  </p>
                </div>
              </div>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted dark:text-accent-100/75">{item.summary}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                <ul className="flex flex-wrap gap-1.5">
                  {item.chips.map((c) => (
                    <li key={c}>
                      <Chip>{c}</Chip>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={id}
                  onClick={() => setOpen((o) => !o)}
                  className="group/btn relative inline-flex shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-300"
                >
                  <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/50" style={px(3)} />
                  <span
                    className="pixel-corners relative inline-flex items-center gap-2 bg-accent-300 px-3.5 py-1.5 text-sm font-bold text-accent-800 transition-[translate,background-color] duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:translate-y-0.5 group-hover/btn:bg-accent-200"
                    style={px(3)}
                  >
                    {open ? 'Less' : 'The story'}
                    <span aria-hidden="true" className="font-mono">
                      {open ? '−' : '+'}
                    </span>
                  </span>
                </button>
              </div>

              {/* Expands smoothly via grid rows 0fr → 1fr */}
              <div id={id} className={`exp-panel grid ${open ? 'exp-open' : ''}`} inert={!open}>
                <div className="min-h-0 overflow-hidden">
                  {/* Context: a lead line with a pixel bar */}
                  <div className="mt-6 flex gap-4">
                    <span aria-hidden="true" className="flex shrink-0 flex-col gap-1 pt-1">
                      {[1, 0.7, 0.45, 0.25].map((o) => (
                        <span key={o} className="size-2 bg-accent-600 dark:bg-accent-400" style={{ opacity: o }} />
                      ))}
                    </span>
                    <p className="font-display text-lg leading-snug font-medium text-ink dark:text-accent-50">{item.context}</p>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-3">
                    <StoryTile label="What I owned" glyph="owned">
                      {item.owned}
                    </StoryTile>
                    <StoryTile label="Key call" glyph="call" highlight>
                      {item.decision}
                    </StoryTile>
                    <StoryTile label="Impact" glyph="impact">
                      {item.impact}
                    </StoryTile>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span
                      className="pixel-corners bg-ink px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.16em] text-accent-300 uppercase dark:bg-accent-300 dark:text-accent-800"
                      style={px(2)}
                    >
                      Stack
                    </span>
                    {item.stack.map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}

// Read bottom to top: the newest role sits at the top, right under "now"
const LADDER = [...experience].reverse()

export default function Experience() {
  return (
    <section id="journey" className="relative isolate scroll-mt-4 overflow-hidden pt-24 pb-4">
      <SidePixels />
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <div data-reveal className="lg:px-4">
          <p className="font-mono text-xs tracking-[0.2em] text-accent-700 uppercase dark:text-accent-300">Journey</p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl dark:text-accent-50">
            From campus build to{' '}
            <span className="relative inline-block">
              <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/60" />
              <span className="pixel-corners relative inline-block bg-accent-300 px-2.5 pb-0.5 text-accent-800">founding team.</span>
            </span>
          </h2>
          <p className="mt-3 font-mono text-xs tracking-[0.16em] text-ink/50 uppercase dark:text-accent-100/50">Read it bottom to top ↑</p>
        </div>

        <div className="relative mt-12">
          {/* "Now" marker at the top of the ladder */}
          <div className="relative mb-10 flex items-center gap-4 pl-[3px]">
            <span aria-hidden="true" className="absolute top-[9px] left-[11px] h-[calc(2.5rem+2.5rem)] w-[2px] bg-accent-600/70 dark:bg-accent-500/60" />
            <span aria-hidden="true" className="relative grid size-[18px] place-items-center">
              <span className="exp-pulse absolute inset-0 bg-accent-500/50" />
              <span className="relative size-[18px] bg-accent-600" />
            </span>
            <span className="font-mono text-xs tracking-[0.2em] text-accent-700 uppercase dark:text-accent-300">Now · still shipping</span>
          </div>
          <ol className="relative space-y-10">
            {LADDER.map((e) => {
              const level = experience.indexOf(e) + 1
              return <Card key={e.org} item={e} level={level} total={experience.length} last={level === 1} />
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
