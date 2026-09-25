import { useState, type CSSProperties } from 'react'
import { ArrowUpRight, Check, Copy } from 'lucide-react'
import { npmPackages, type NpmPackage } from '../data/projects'

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

// Blocky "npm" wordmark on a pixel grid (p has a descender), drawn in the card's cream
const NPM = ['###.###.#####', '#.#.#.#.#.#.#', '#.#.#.#.#.#.#', '#.#.###.#.#.#', '....#........']

function NpmMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 15 6" shapeRendering="crispEdges" className={className} role="img" aria-label="npm">
      <rect width="15" height="6" className="fill-[#fff7ef]" />
      {NPM.flatMap((row, y) =>
        [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x + 1} y={y + 1} width={1} height={1} className="fill-accent-700" /> : null)),
      )}
    </svg>
  )
}

function InstallCommand({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)
  const cmd = `npm i ${name}`
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(cmd).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
      className="pixel-corners group/copy flex w-full items-center justify-between gap-3 bg-black/25 px-3 py-2 text-left font-mono text-[13px] text-accent-50 transition-colors hover:bg-black/35"
      style={px(3)}
      aria-label={`Copy install command: ${cmd}`}
    >
      <span className="truncate">
        <span className="text-accent-300">$</span> {cmd}
      </span>
      {copied ? <Check className="size-4 shrink-0 text-accent-300" /> : <Copy className="size-4 shrink-0 opacity-60 group-hover/copy:opacity-100" />}
    </button>
  )
}

function PackageTile({ pkg }: { pkg: NpmPackage }) {
  return (
    <div className="pixel-corners relative flex h-full flex-col bg-[#8a1414] p-5 ring-1 ring-accent-300/25" style={px(6)}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-mono text-lg font-bold break-all text-accent-50">{pkg.name}</h3>
        <span className="shrink-0 font-mono text-xs text-accent-200/70">{pkg.downloads.toLocaleString()} ↓</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-accent-100/85">{pkg.oneLiner}</p>

      <div className="mt-auto flex items-center gap-4 pt-4">
        <div className="min-w-0 flex-1">
          <InstallCommand name={pkg.name} />
        </div>
        <a
          href={pkg.npm}
          target="_blank"
          rel="noreferrer"
          className="group/link inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent-200 hover:text-accent-50"
        >
          npm
          <ArrowUpRight className="size-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
        </a>
      </div>
    </div>
  )
}

// Rising pixels inside the npm card (deterministic layout)
const r = (i: number, k: number) => (((Math.sin(i * 12.9898 + k * 78.233) * 43758.5453) % 1) + 1) % 1
const RISE = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i / 16) * 100 + r(i, 1) * 4}%`,
  size: r(i, 2) > 0.6 ? 8 : 5,
  dur: 7 + r(i, 3) * 7,
  delay: -r(i, 4) * 14,
  gold: r(i, 5) > 0.4,
}))

/** Stepped pixel staircase for the card's corners */
function Stairs({ className }: { className: string }) {
  const cells: [number, number][] = []
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5 - y; x++) cells.push([x, y])
  return (
    <svg aria-hidden="true" viewBox="0 0 5 5" shapeRendering="crispEdges" className={`pointer-events-none absolute text-accent-200/30 ${className}`}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={0.8} height={0.8} fill="currentColor" />
      ))}
    </svg>
  )
}

/** Published packages: a red pixel card under the project grid */
export default function NpmPackages() {
  const total = npmPackages.reduce((n, p) => n + p.downloads, 0)
  const rounded = total >= 1000 ? `${Math.floor(total / 1000) * 1000}+` : `${total}`
  return (
    <div className="relative mx-auto mt-16 max-w-6xl">
      <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-2 translate-y-2 bg-accent-900/30 dark:bg-black/60" style={px(8)} />
      <div className="pixel-corners relative overflow-hidden bg-gradient-to-br from-accent-600 via-accent-700 to-accent-800 p-6 sm:p-8" style={px(8)}>
        {/* Faint line grid, like the hero card */}
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="npm-rise pointer-events-none absolute inset-0">
          {RISE.map((p, i) => (
            <span
              key={i}
              className={p.gold ? 'bg-accent-300' : 'bg-accent-100'}
              style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
            />
          ))}
        </div>
        <Stairs className="bottom-1.5 left-1.5 w-6 -scale-y-100" />
        <Stairs className="top-2 right-2 w-14 -scale-x-100" />
        <Stairs className="right-1.5 bottom-1.5 w-6 rotate-180" />

        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <NpmMark className="h-8 w-auto" />
              <span className="font-mono text-xs tracking-[0.2em] text-accent-200 uppercase">Published packages</span>
            </div>
            <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.025em] text-accent-50">Shipped to npm</h3>
            <p className="mt-1 max-w-md text-sm text-accent-100/80">Small tools that fill real gaps in the AI-agent stack.</p>
          </div>
          {/* Prominent but quiet: big numeral in a low-contrast tone */}
          <div className="text-right">
            <div className="font-display text-5xl leading-none font-semibold tracking-[-0.04em] text-accent-300/80 sm:text-6xl">{rounded}</div>
            <div className="mt-1 font-mono text-[11px] tracking-[0.18em] text-accent-200/70 uppercase">downloads</div>
          </div>
        </div>

        <div className="relative mt-6 grid gap-5 md:grid-cols-2">
          {npmPackages.map((p) => (
            <PackageTile key={p.name} pkg={p} />
          ))}
        </div>
      </div>
    </div>
  )
}
