import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { now, type NowKind } from '../data/now'
import { profile } from '../data/profile'
import { fetchGitHubActivity, monthStats, mostPushed, streaks, type Day, type GitHubActivity } from '../lib/github'
import './now.css'

/*
 * "Now": how this month is going. A hand-written month log, live month stats, and a pixel
 * GitHub heatmap for the last year with a per-day tooltip (count, streak, repos touched).
 */

const USER = 'AnanthuNarashimman'
const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties

// Dates are plain YYYY-MM-DD strings; format them in UTC so no timezone shifts a day
const utc = (date: string) => new Date(`${date}T00:00:00Z`)
const fmt = (date: string, opts: Intl.DateTimeFormatOptions) => utc(date).toLocaleDateString('en-US', { timeZone: 'UTC', ...opts })
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : /(s|sh|ch|x)$/.test(word) ? 'es' : 's'}`

/* ---------- Month progress ---------- */

function MonthProgress() {
  const today = new Date()
  const day = today.getDate()
  const total = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const name = today.toLocaleDateString('en-US', { month: 'long' })
  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
      <div className="flex gap-[3px]" role="img" aria-label={`${name}: day ${day} of ${total}`}>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-3 w-2 sm:w-2.5 ${
              i + 1 < day ? 'bg-accent-600 dark:bg-accent-400' : i + 1 === day ? 'now-today bg-accent-300' : 'bg-accent-900/10 dark:bg-white/10'
            }`}
          />
        ))}
      </div>
      <span className="font-mono text-xs tracking-[0.12em] text-ink/60 uppercase dark:text-accent-100/60">
        {name} · day {day} of {total}
      </span>
    </div>
  )
}

/* ---------- Glyphs (7×7, '#' = pixel) ---------- */

const GLYPHS = {
  work: ['..###..', '.#...#.', '#######', '#######', '###.###', '#######', '#######'], // briefcase
  shipping: ['...#...', '..###..', '..#.#..', '..###..', '.#####.', '#.###.#', '..#.#..'], // rocket
  contributing: ['.##.##.', '#######', '#######', '#######', '.#####.', '..###..', '...#...'], // heart
  building: ['.####..', '######.', '.####..', '...#...', '...#...', '...#...', '...#...'], // hammer
  learning: ['.......', '##...##', '###.###', '###.###', '###.###', '##.#.##', '.#...#.'], // book
  calendar: ['.#...#.', '#######', '#.....#', '#.#.#.#', '#.....#', '#.#.#.#', '#######'],
  check: ['......#', '.....##', '#...##.', '##.##..', '.###...', '..#....', '.......'],
  flame: ['...#...', '..##...', '.####..', '.#####.', '##.###.', '##..##.', '.####..'],
  push: ['...#...', '..###..', '.#####.', '#######', '..###..', '..###..', '..###..'],
}
type GlyphName = keyof typeof GLYPHS

function Glyph({ name, className = 'size-3.5' }: { name: GlyphName; className?: string }) {
  return (
    <svg viewBox="0 0 7 7" shapeRendering="crispEdges" aria-hidden="true" className={className} fill="currentColor">
      {GLYPHS[name].flatMap((row, y) => [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)))}
    </svg>
  )
}

/* ---------- Month log ---------- */

const KIND: Record<NowKind, { label: string; tile: string; text: string }> = {
  work: { label: 'Day job', tile: 'bg-accent-600 text-accent-50', text: 'text-accent-700 dark:text-accent-400' },
  shipping: { label: 'Shipping', tile: 'bg-accent-300 text-accent-800', text: 'text-accent-800 dark:text-accent-300' },
  contributing: { label: 'Open source', tile: 'bg-ink text-accent-300 dark:bg-accent-50 dark:text-accent-700', text: 'text-ink/70 dark:text-accent-100/70' },
  building: { label: 'Building', tile: 'bg-accent-400 text-ink', text: 'text-accent-500 dark:text-accent-400' },
  learning: { label: 'Learning', tile: 'bg-accent-200 text-accent-800', text: 'text-accent-800 dark:text-accent-200' },
}

function Panel({
  title,
  aside,
  children,
  className = '',
  reveal,
}: {
  title: React.ReactNode
  aside?: React.ReactNode
  children: React.ReactNode
  className?: string
  reveal?: boolean
}) {
  return (
    <div data-reveal={reveal || undefined} className={`relative ${className}`}>
      <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent-900/15 dark:bg-black/50" style={px(6)} />
      <div className="pixel-corners relative flex h-full flex-col bg-accent-200 p-[2px] dark:bg-white/15" style={px(6)}>
        <div className="flex items-center justify-between gap-3 bg-accent-200 px-4 py-2 font-mono text-[11px] font-bold tracking-[0.16em] text-accent-800 uppercase dark:bg-white/10 dark:text-accent-200">
          <span className="flex items-center gap-2">{title}</span>
          {aside}
        </div>
        <div className="flex-1 bg-[#fffaf5] p-5 sm:p-6 dark:bg-[#241412]">{children}</div>
      </div>
    </div>
  )
}

function MonthLog() {
  return (
    <Panel
      title={
        <>
          Month log · {now.month}
          <span aria-hidden="true" className="now-today inline-block h-3 w-1.5 bg-accent-800 dark:bg-accent-200" />
        </>
      }
      aside={<span className="hidden font-normal tracking-[0.08em] sm:inline text-accent-800/70 dark:text-accent-200/60">upd. {fmt(now.updated, { month: 'short', day: 'numeric' })}</span>}
    >
      <ul className="divide-y-2 divide-accent-100 dark:divide-white/10">
        {now.entries.map((e) => {
          const k = KIND[e.kind]
          return (
            <li key={e.title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              {/* Pixel icon tile with a hard shadow */}
              <span className="relative mt-0.5 size-11 shrink-0 self-start">
                <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/20 dark:bg-black/50" style={px(4)} />
                <span className={`pixel-corners relative grid size-11 place-items-center ${k.tile}`} style={px(4)}>
                  <Glyph name={e.kind} className="size-5" />
                </span>
              </span>
              <div className="min-w-0">
                <p className={`font-mono text-[10px] font-bold tracking-[0.18em] uppercase ${k.text}`}>{k.label}</p>
                {e.href ? (
                  <a href={e.href} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1 font-display text-lg font-semibold text-ink hover:text-accent-700 dark:text-accent-50 dark:hover:text-accent-300">
                    {e.title}
                    <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <p className="font-display text-lg font-semibold text-ink dark:text-accent-50">{e.title}</p>
                )}
                <p className="mt-0.5 text-[15px] leading-relaxed text-ink/75 dark:text-accent-100/75">{e.text}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Panel>
  )
}

/* ---------- Month stats ---------- */

function Stat({
  label,
  glyph,
  value,
  note,
  highlight,
  children,
}: {
  label: string
  glyph: GlyphName
  value: React.ReactNode
  note?: React.ReactNode
  highlight?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="relative">
      <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/15 dark:bg-black/50" style={px(4)} />
      <div className={`pixel-corners relative flex h-full flex-col p-[2px] ${highlight ? 'bg-accent-300' : 'bg-accent-600 dark:bg-accent-700'}`} style={px(4)}>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.16em] uppercase ${
            highlight ? 'text-accent-800' : 'text-accent-50'
          }`}
        >
          <Glyph name={glyph} className="size-3" />
          {label}
        </div>
        <div className={`flex flex-1 flex-col px-3.5 pt-3 pb-3.5 ${highlight ? 'bg-[#fffaf0] dark:bg-[#2c1a10]' : 'bg-[#fffaf5] dark:bg-[#241412]'}`}>
          <p className="truncate font-display text-3xl leading-none font-semibold tracking-[-0.02em] text-ink dark:text-accent-50">{value}</p>
          {note && <p className="mt-1.5 truncate text-[13px] text-ink/60 dark:text-accent-100/60">{note}</p>}
          {children && <div className="flex flex-1 flex-col justify-end pt-4">{children}</div>}
        </div>
      </div>
    </div>
  )
}

const ON = 'bg-accent-600 dark:bg-accent-400'
const OFF = 'bg-accent-900/10 dark:bg-white/10'
const EMPTY = 'ring-1 ring-inset ring-accent-900/15 dark:ring-white/10'

function MonthStats({ data }: { data: GitHubActivity | null }) {
  const labels: [string, GlyphName][] = [
    ['This month', 'calendar'],
    ['Active days', 'check'],
    ['Streak', 'flame'],
    ['Most pushed', 'push'],
  ]
  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-4" aria-busy="true">
        {labels.map(([l, g], i) => (
          <Stat key={l} label={l} glyph={g} highlight={i === 0} value={<span className="now-skeleton inline-block h-8 w-16 bg-accent-900/10 dark:bg-white/10" />} />
        ))}
      </div>
    )
  }

  const m = monthStats(data.days)
  const s = streaks(data.days)
  const ym = new Date().toISOString().slice(0, 7)
  const top = mostPushed(data.events, ym)
  const month = data.days.filter((d) => d.date.startsWith(ym))
  const [yy, mm] = ym.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(yy, mm, 0)).getUTCDate()
  const firstWeekday = new Date(Date.UTC(yy, mm - 1, 1)).getUTCDay()
  const slots = Array.from({ length: daysInMonth }, (_, i) => month[i])
  const peak = Math.max(1, ...month.map((d) => d.count))
  const last14 = data.days.slice(-14)
  const diff = m.total - m.previous

  // Pushes per repo this month, for the mini bar list
  const pushes: Record<string, number> = {}
  for (const [date, list] of Object.entries(data.events)) {
    if (date.startsWith(ym)) for (const r of list) if (r.actions.push) pushes[r.repo] = (pushes[r.repo] ?? 0) + r.actions.push
  }
  const repos = Object.entries(pushes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  return (
    <div className="grid grid-cols-2 gap-4">
      <Stat label="This month" glyph="calendar" highlight value={m.total} note={m.previous ? `${diff >= 0 ? '+' : ''}${diff} vs last month` : 'contributions'}>
        {/* Daily contributions as pixel bars that fill the tile (heights snap to eighths); days to come stay empty */}
        <div className="flex min-h-20 flex-1 flex-col" aria-hidden="true">
          {m.best && (
            <p className="mb-2 font-mono text-[10px] tracking-[0.1em] text-ink/50 uppercase dark:text-accent-100/50">
              Peak <b className="text-accent-800 dark:text-accent-300">{m.best.count}</b> · {fmt(m.best.date, { month: 'short', day: 'numeric' })}
            </p>
          )}
          <div className="relative flex flex-1 items-end gap-[2px] border-b-2 border-accent-900/20 dark:border-white/20">
            {slots.map((d, i) => (
              <span
                key={i}
                className={`flex-1 ${!d ? 'h-[2px] bg-accent-900/10 dark:bg-white/10' : d.count ? (d.count === peak ? 'bg-accent-300 ring-1 ring-accent-800/30 ring-inset' : ON) : 'h-[2px] bg-accent-900/15 dark:bg-white/15'}`}
                style={d?.count ? { height: `${Math.max(1, Math.round((d.count / peak) * 8)) * 12.5}%` } : undefined}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-ink/45 dark:text-accent-100/45">
            <span>1</span>
            <span>{Math.ceil(daysInMonth / 2)}</span>
            <span>{daysInMonth}</span>
          </div>
        </div>
      </Stat>

      <Stat label="Active days" glyph="check" value={`${m.activeDays}/${m.daysSoFar}`} note={m.best ? `Best: ${fmt(m.best.date, { month: 'short', day: 'numeric' })} · ${m.best.count}` : undefined}>
        {/* The month as a little calendar, weeks starting Sunday */}
        <div className="grid grid-cols-7 gap-[3px]" aria-hidden="true">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((l, i) => (
            <span key={`h${i}`} className="pb-0.5 text-center font-mono text-[10px] text-ink/45 dark:text-accent-100/45">
              {l}
            </span>
          ))}
          {Array.from({ length: firstWeekday }, (_, i) => (
            <span key={`pad${i}`} />
          ))}
          {slots.map((d, i) => (
            <span
              key={i}
              className={`aspect-square ${!d ? EMPTY : d.count ? 'bg-accent-400' : OFF} ${d && i === month.length - 1 ? 'now-today outline-2 outline-offset-1 outline-ink dark:outline-accent-50' : ''}`}
            />
          ))}
        </div>
      </Stat>

      <Stat label="Streak" glyph="flame" value={plural(s.current, 'day')} note={`Longest: ${plural(s.longest, 'day')}`}>
        {/* Last two weeks as two rows of seven, today outlined */}
        <div aria-hidden="true">
          <div className="grid grid-cols-7 gap-[3px]">
            {last14.slice(0, 7).map((d) => (
              <span key={`h${d.date}`} className="pb-0.5 text-center font-mono text-[10px] text-ink/45 dark:text-accent-100/45">
                {fmt(d.date, { weekday: 'narrow' })}
              </span>
            ))}
            {last14.map((d, i) => (
              <span
                key={d.date}
                className={`aspect-square ${d.count ? (i >= 14 - s.current ? ON : 'bg-accent-400/70') : OFF} ${i === 13 ? 'outline-2 outline-offset-1 outline-ink dark:outline-accent-50' : ''}`}
              />
            ))}
          </div>
          <p className="mt-2 font-mono text-[10px] tracking-[0.1em] text-ink/45 uppercase dark:text-accent-100/45">Last 14 days</p>
        </div>
      </Stat>

      <Stat label="Most pushed" glyph="push" value={top?.repo ?? '—'} note={top ? `${plural(top.pushes, 'push')} this month` : 'No public pushes yet'}>
        {repos.length > 0 && (
          <ul className="space-y-1.5 font-mono text-[11px] text-ink/70 dark:text-accent-100/70">
            {repos.map(([repo, n], i) => (
              <li key={repo} className="grid grid-cols-[1fr_auto] items-center gap-x-2">
                <span className="truncate">{repo}</span>
                <span className="text-ink/45 dark:text-accent-100/45">{n}</span>
                <span className="col-span-2 flex h-1.5 bg-accent-900/10 dark:bg-white/10">
                  <span className={i === 0 ? 'bg-accent-300' : ON} style={{ width: `${(n / repos[0][1]) * 100}%` }} />
                </span>
              </li>
            ))}
          </ul>
        )}
      </Stat>
    </div>
  )
}

/* ---------- Heatmap ---------- */

const CELL = 10
const STEP = 12
const LEFT = 26
const TOP = 14

const LEVEL = [
  'fill-[#efd9d0] dark:fill-[#3a1c17]',
  'fill-accent-300',
  'fill-accent-400',
  'fill-accent-600',
  'fill-accent-800 dark:fill-[#ff5a3c]',
]

function Heatmap({ data }: { data: GitHubActivity }) {
  const { days, events, eventsSince } = data
  const [active, setActive] = useState<number | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)

  const layout = useMemo(() => {
    const pad = utc(days[0].date).getUTCDay() // weeks start on Sunday, like GitHub
    const weeks = Math.ceil((pad + days.length) / 7)
    const cells = days.map((d, i) => ({ d, x: LEFT + Math.floor((pad + i) / 7) * STEP, y: TOP + ((pad + i) % 7) * STEP }))
    const months: { x: number; label: string }[] = []
    cells.forEach((c) => {
      if (c.d.date.endsWith('-01') || c === cells[0]) {
        const col = c.y === TOP ? c.x : c.x + STEP // label the first full week of the month
        if (!months.length || col - months[months.length - 1].x >= STEP * 3) months.push({ x: col, label: fmt(c.d.date, { month: 'short' }) })
      }
    })
    if (months.length > 1 && months[1].x - months[0].x < STEP * 3) months.shift()
    return { cells, months, W: LEFT + weeks * STEP - 2, H: TOP + 7 * STEP - 2 }
  }, [days])

  const stats = useMemo(() => {
    const s = streaks(days)
    const max = Math.max(...days.map((d) => d.count))
    return { ...s, max, total: days.reduce((a, d) => a + d.count, 0), best: days.find((d) => d.count === max) }
  }, [days])

  // Phones show the latest weeks first
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [layout])

  // The tooltip lives outside the scroller (so it never adds overflow or scrollbars). It's measured
  // against the hovered cell, clamped to the card, and flips below the cell when there's no room above.
  useLayoutEffect(() => {
    const t = tip.current
    const w = wrap.current
    const c = active !== null ? w?.querySelector<SVGRectElement>(`[data-i="${active}"]`) : null
    if (!t || !w || !c) return
    const wr = w.getBoundingClientRect()
    const cr = c.getBoundingClientRect()
    const left = Math.min(Math.max(cr.left - wr.left + cr.width / 2 - t.offsetWidth / 2, 0), wr.width - t.offsetWidth)
    const above = cr.top - wr.top - t.offsetHeight - 8
    t.style.left = `${left}px`
    t.style.top = `${above >= -24 ? above : cr.bottom - wr.top + 8}px`
    t.style.visibility = 'visible'
  }, [active])

  const onKey = (e: KeyboardEvent) => {
    const move = { ArrowLeft: -7, ArrowRight: 7, ArrowUp: -1, ArrowDown: 1 }[e.key]
    if (move === undefined) return
    e.preventDefault()
    setActive((a) => Math.min(days.length - 1, Math.max(0, (a ?? days.length - 1) + move)))
  }

  const cell = active !== null ? layout.cells[active] : null

  return (
    <div ref={wrap} className="relative">
      <div ref={scroller} className="now-scroll overflow-x-auto overflow-y-hidden pb-2" onScroll={() => setActive(null)}>
        <svg
          viewBox={`0 0 ${layout.W} ${layout.H}`}
          shapeRendering="crispEdges"
          className="block h-auto w-full min-w-[680px] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-600 dark:focus-visible:outline-accent-300"
          tabIndex={0}
          role="img"
          aria-label={`GitHub contributions: ${stats.total} in the last year. Use arrow keys to read individual days.`}
          onKeyDown={onKey}
          onFocus={() => setActive((a) => a ?? days.length - 1)}
          onBlur={() => setActive(null)}
          onMouseLeave={() => setActive(null)}
        >
          {layout.months.map((m) => (
            <text key={m.x} x={m.x} y={8} className="fill-ink/55 font-mono text-[8px] dark:fill-accent-100/55">
              {m.label}
            </text>
          ))}
          {(
            [
              [1, 'Mon'],
              [3, 'Wed'],
              [5, 'Fri'],
            ] as const
          ).map(([row, label]) => (
            <text key={label} x={0} y={TOP + row * STEP + 8} className="fill-ink/55 font-mono text-[8px] dark:fill-accent-100/55">
              {label}
            </text>
          ))}
          {layout.cells.map(({ d, x, y }, i) => (
            <rect key={d.date} data-i={i} x={x} y={y} width={CELL} height={CELL} className={LEVEL[d.level]} onMouseEnter={() => setActive(i)} onClick={() => setActive(i)} />
          ))}
          {cell && <rect x={cell.x - 1.5} y={cell.y - 1.5} width={CELL + 3} height={CELL + 3} fill="none" strokeWidth={1.5} className="pointer-events-none stroke-ink dark:stroke-accent-50" />}
        </svg>
      </div>

      {active !== null && (
        <div ref={tip} role="status" className="pointer-events-none absolute top-0 left-0 z-20 w-max max-w-[17rem]" style={{ visibility: 'hidden' }}>
          <DayTip days={days} i={active} events={events} eventsSince={eventsSince} runAt={stats.runAt} max={stats.max} />
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 font-mono text-[11px] text-ink/60 dark:text-accent-100/60">
        <div className="flex flex-wrap gap-x-5 gap-y-1 tracking-[0.08em] uppercase">
          <span>
            Longest streak <b className="text-ink dark:text-accent-50">{plural(stats.longest, 'day')}</b>
          </span>
          {stats.best && (
            <span>
              Best day{' '}
              <b className="text-ink dark:text-accent-50">
                {fmt(stats.best.date, { month: 'short', day: 'numeric' })} · {stats.best.count}
              </b>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          Less
          {LEVEL.map((l, i) => (
            <svg key={i} viewBox="0 0 10 10" className="size-2.5">
              <rect width={10} height={10} className={l} />
            </svg>
          ))}
          More
        </div>
      </div>
    </div>
  )
}

function DayTip({
  days,
  i,
  events,
  eventsSince,
  runAt,
  max,
}: {
  days: Day[]
  i: number
  events: GitHubActivity['events']
  eventsSince?: string
  runAt: (i: number) => number
  max: number
}) {
  const d = days[i]
  const repos = events[d.date] ?? []
  const run = runAt(i)
  let start = i
  while (start > 0 && days[start - 1].count) start--
  const tagline = d.count && d.count === max ? 'Busiest day of the year' : run > 1 ? `Day ${i - start + 1} of a ${run}-day streak` : null

  return (
    <div className="relative">
      <div aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-600" style={px(4)} />
      <div className="pixel-corners relative bg-ink px-3.5 py-2.5 text-accent-50 dark:bg-accent-50 dark:text-ink" style={px(4)}>
        <p className="font-mono text-[10px] tracking-[0.14em] text-accent-300 uppercase dark:text-accent-700">
          {fmt(d.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <p className="mt-0.5 font-display text-base font-semibold">{d.count ? plural(d.count, 'contribution') : 'No contributions'}</p>
        {tagline && <p className="mt-0.5 text-[12px] text-accent-300 dark:text-accent-700">{tagline}</p>}
        {repos.length > 0 && (
          <ul className="mt-2 space-y-0.5 border-t border-white/15 pt-2 font-mono text-[11px] dark:border-ink/15">
            {repos.slice(0, 4).map((r) => (
              <li key={r.repo} className="flex justify-between gap-4">
                <span className="truncate">{r.repo}</span>
                <span className="shrink-0 opacity-70">
                  {Object.entries(r.actions)
                    .map(([a, n]) => (n > 1 ? plural(n, a) : a))
                    .join(', ')}
                </span>
              </li>
            ))}
          </ul>
        )}
        {!repos.length && d.count > 0 && eventsSince && d.date < eventsSince && (
          <p className="mt-1.5 font-mono text-[10px] opacity-60">Repo detail only goes back a few weeks.</p>
        )}
      </div>
    </div>
  )
}

function HeatmapSkeleton() {
  return (
    <div className="now-skeleton grid min-w-[680px] grid-flow-col grid-rows-7 gap-[3px] pt-5 pl-8" aria-busy="true" aria-label="Loading GitHub activity">
      {Array.from({ length: 53 * 7 }, (_, i) => (
        <span key={i} className="aspect-square bg-[#efd9d0] dark:bg-[#3a1c17]" />
      ))}
    </div>
  )
}

/* ---------- Backdrop ---------- */

// Big, soft pixel clouds (8px "pixels") drifting slowly along the section's edges
const CLOUD = ['.....#####......', '...#########....', '..############..', '.##############.', '################']
const CLOUDS = [
  { top: '4%', left: '-2%', scale: 1.1, dur: 46 },
  { top: '14%', right: '6%', scale: 0.8, dur: 38 },
  { top: '34%', right: '-3%', scale: 1.4, dur: 58 },
  { top: '52%', left: '3%', scale: 0.75, dur: 42 },
  { top: '68%', left: '-4%', scale: 1.25, dur: 52 },
  { top: '88%', right: '4%', scale: 0.9, dur: 40 },
]

function Cloud() {
  return (
    <svg viewBox={`0 0 ${CLOUD[0].length} ${CLOUD.length}`} width={CLOUD[0].length * 8} height={CLOUD.length * 8} shapeRendering="crispEdges" className="block">
      {CLOUD.flatMap((row, y) => [...row].map((c, x) => (c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)))}
    </svg>
  )
}

function NowBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {CLOUDS.map((c, i) => (
        <div
          key={i}
          className="now-cloud absolute fill-white/75 dark:fill-white/[0.05]"
          style={{ top: c.top, left: c.left, right: c.right, animationDuration: `${c.dur}s`, animationDelay: `${-i * 7}s`, scale: c.scale }}
        >
          <Cloud />
        </div>
      ))}
    </div>
  )
}

/* ---------- Section ---------- */

export default function Now() {
  const [data, setData] = useState<GitHubActivity | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const ctrl = new AbortController()
    fetchGitHubActivity(USER, ctrl.signal)
      .then(setData)
      .catch((e: unknown) => {
        if (!ctrl.signal.aborted) {
          console.warn('GitHub activity unavailable', e)
          setFailed(true)
        }
      })
    return () => ctrl.abort()
  }, [])

  const total = data?.days.reduce((a, d) => a + d.count, 0)

  return (
    <section id="now" className="relative isolate scroll-mt-4 pt-28 pb-8">
      <NowBackdrop />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-24">
        <div data-reveal>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-accent-700 uppercase dark:text-accent-300">
            <span className="now-live size-2 bg-accent-600 dark:bg-accent-400" aria-hidden="true" />
            Now
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-ink sm:text-5xl dark:text-accent-50">
            How this month is{' '}
            <span className="relative inline-block">
              <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/25 dark:bg-black/50" />
              <span className="pixel-corners relative inline-block bg-accent-300 px-2.5 pb-0.5 text-accent-800">going.</span>
            </span>
          </h2>
          <MonthProgress />
        </div>

        <div data-reveal className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
          <MonthLog />
          {failed ? (
            <Panel title="This month on GitHub">
              <p className="text-[15px] text-ink/70 dark:text-accent-100/70">GitHub isn’t answering right now.</p>
            </Panel>
          ) : (
            <MonthStats data={data} />
          )}
        </div>

        <Panel
          className="mt-6"
          reveal
          title={total !== undefined ? `${total.toLocaleString()} contributions · last 12 months` : 'A year of commits'}
          aside={
            <a href={profile.socials.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-accent-600 dark:hover:text-accent-300">
              @{USER}
              <ArrowUpRight className="size-3.5" />
            </a>
          }
        >
          {data ? (
            <Heatmap data={data} />
          ) : failed ? (
            <p className="text-[15px] text-ink/70 dark:text-accent-100/70">
              The live graph is taking a breather.{' '}
              <a className="font-medium text-accent-700 underline underline-offset-4 dark:text-accent-300" href={`https://github.com/${USER}`} target="_blank" rel="noreferrer">
                See it on GitHub
              </a>
              .
            </p>
          ) : (
            <div className="overflow-hidden">
              <HeatmapSkeleton />
            </div>
          )}
        </Panel>
      </div>
    </section>
  )
}
