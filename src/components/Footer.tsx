import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight, ArrowUp, Check, Copy } from 'lucide-react'
import avatar from '../assets/avatar.webp'
import { profile } from '../data/profile'
import { sendNote } from '../lib/mail'
import MailDialog, { type MailField } from './MailDialog'
import PixelButton from './PixelButton'
import { PIXEL_FONT } from './pixelFont'
import PixelSocialLink from './PixelSocialLink'
import { socialLinks } from './socialLinks'
import './footer.css'

/*
 * Footer: the same dark arcade band as the tech stack, with a "Tell me something" mail form,
 * site links, local time, and my name half-sunk in a pixel sea — letters surface as you hover.
 */

const NOTE_FIELDS: MailField[] = [
  { name: 'name', label: 'Your name', placeholder: 'Ada Lovelace', required: true },
  { name: 'email', label: 'Your email', type: 'email', placeholder: 'you@example.com', required: true },
  { name: 'subject', label: 'About', placeholder: 'A project, a role, a bug on this site…', wide: true },
  { name: 'message', label: 'Message', multiline: true, required: true, wide: true, placeholder: 'Hey Ananthu,' },
]

const SITE = [
  { to: '/#projects', label: 'Projects' },
  { to: '/#tech-stack', label: 'Tech stack' },
  { to: '/#journey', label: 'Journey' },
  { to: '/#build-log', label: 'Hackathons' },
  { to: '/#now', label: 'Now' },
  { to: '/projects', label: 'All projects' },
]

/* ---------- Local time ---------- */

function LocalTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000)
    return () => clearInterval(t)
  }, [])
  const [h, m] = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' }).split(':')
  const hour = Number(h)
  const mood = hour < 6 ? 'probably asleep' : hour < 10 ? 'coffee first' : hour < 19 ? 'heads down, shipping' : 'late-night builds'
  return (
    <div>
      <p className="font-mono text-2xl font-bold text-accent-50">
        {h}
        <span className="footer-colon">:</span>
        {m} <span className="text-sm font-normal text-accent-100/60">IST</span>
      </p>
      <p className="mt-1 text-sm text-accent-100/60">Bengaluru, India · {mood}</p>
    </div>
  )
}

/* ---------- The half-sunk name ---------- */

const GLYPH = PIXEL_FONT
const NAME = 'ANANTHU'
const STEP = 7 // letter width 6 + 1 gap
const VW = NAME.length * STEP // includes half a unit of margin each side
const SUNK = 4 // resting top of each letter
const VH = 7.5 // the page ends here, cutting the resting letters in half
const RISE = [4, 1.6, 0.5] // hovered letter pops fully into view; its neighbours lift a little

function SunkName() {
  const [hover, setHover] = useState<number | null>(null)

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      shapeRendering="crispEdges"
      className="footer-name block h-auto w-full"
      role="img"
      aria-label="Ananthu"
      onPointerLeave={() => setHover(null)}
    >
      {[...NAME].map((ch, i) => {
        const rise = hover === null ? 0 : (RISE[Math.abs(hover - i)] ?? 0)
        return (
          <g key={i} transform={`translate(${0.5 + i * STEP} 0)`}>
            <g className="footer-letter" style={{ transform: `translateY(${SUNK - rise}px)` }}>
              {GLYPH[ch].flatMap((row, y) =>
                [...row].map((c, cx) =>
                  c === '#' ? (
                    <g key={`${cx}-${y}`}>
                      <rect x={cx + 0.2} y={y + 0.2} width={1} height={1} className="fill-accent-900/70" />
                      <rect x={cx} y={y} width={1} height={1} className="fill-[#f9c4b0]" />
                    </g>
                  ) : null,
                ),
              )}
            </g>
          </g>
        )
      })}

      {/* Hit areas: one full-height column per letter */}
      {[...NAME].map((_, i) => (
        <rect key={`hit${i}`} x={i * STEP} y={0} width={STEP} height={VH} fill="transparent" onPointerEnter={() => setHover(i)} onPointerDown={() => setHover(i)} />
      ))}
    </svg>
  )
}

/* ---------- Decoration ---------- */

// Pixels drifting up through the band, like the npm card
const RISERS = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: 4 + ((i * 5) % 3) * 2,
  dur: 10 + ((i * 7) % 9),
  delay: -((i * 13) % 17),
  gold: i % 4 === 0,
}))

/** Stepped pixel staircase for the band's corners */
function Stairs({ className }: { className: string }) {
  const cells: [number, number][] = []
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5 - y; x++) cells.push([x, y])
  return (
    <svg aria-hidden="true" viewBox="0 0 5 5" shapeRendering="crispEdges" className={`pointer-events-none absolute text-accent-200/25 ${className}`}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={0.8} height={0.8} fill="currentColor" />
      ))}
    </svg>
  )
}

const TICKER = ['Open to hackathons', 'Freelance builds', 'AI agents', 'Collabs', 'Coffee chats', 'Weird ideas welcome', 'Replies within a day']

/** Slow arcade ticker across the top of the footer */
function Ticker() {
  const list = (hidden?: boolean) => (
    <ul className="flex shrink-0" aria-hidden={hidden || undefined}>
      {TICKER.map((t) => (
        <li key={t} className="flex items-center gap-5 pr-5 font-mono text-xs font-bold tracking-[0.2em] whitespace-nowrap text-accent-100 uppercase">
          {t}
          <span aria-hidden="true" className="size-2 bg-accent-300" />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="footer-ticker relative overflow-hidden border-y-2 border-accent-900/40 bg-accent-900/25 py-2.5">
      <div className="footer-ticker-track flex w-max">
        {list()}
        {list(true)}
      </div>
    </div>
  )
}

/* ---------- Footer ---------- */

export default function Footer() {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <footer id="contact" className="relative isolate mt-24 scroll-mt-4 overflow-hidden">
      <div aria-hidden="true" className="footer-steps h-6 w-full" />
      <div className="footer-band relative">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="footer-rise pointer-events-none absolute inset-0">
          {RISERS.map((p, i) => (
            <span
              key={i}
              className={p.gold ? 'bg-accent-300' : 'bg-accent-100'}
              style={{ left: p.left, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }}
            />
          ))}
        </div>
        <Stairs className="top-12 left-2 w-16" />
        <Stairs className="top-12 right-2 w-16 -scale-x-100" />

        <Ticker />

        <div className="relative mx-auto max-w-7xl px-5 pt-14 sm:px-8 lg:px-24">
          <div data-reveal className="grid gap-12 text-center lg:grid-cols-[1.5fr_0.8fr_1fr] lg:text-left">
            {/* Say hi */}
            <div>
              <p className="font-mono text-xs tracking-[0.25em] text-accent-300 uppercase">Contact</p>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.03em] text-accent-50 sm:text-5xl">
                Got something on your{' '}
                <span className="relative inline-block">
                  <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-black/50" />
                  <span className="pixel-corners relative inline-block bg-accent-300 px-2.5 pb-0.5 text-accent-800">mind?</span>
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-accent-100/70 lg:mx-0">
                A project, a role, a hackathon, a bug on this site, or just hi. I read everything and reply within a day.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-4 lg:justify-start">
                <PixelButton onClick={() => dialogRef.current?.showModal()}>
                  Tell me something <ArrowRight className="size-4" />
                </PixelButton>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex cursor-pointer items-center font-mono text-sm text-accent-100/70 transition-colors hover:text-accent-300"
                >
                  {/* Both states share one grid cell, so the button keeps the email's width and nothing reflows */}
                  <span className="grid">
                    <span className={`inline-flex items-center justify-center gap-2 transition-opacity [grid-area:1/1] lg:justify-start ${copied ? 'opacity-0' : ''}`}>
                      <Copy className="size-4" />
                      {profile.email}
                    </span>
                    <span
                      aria-live="polite"
                      className={`inline-flex items-center justify-center gap-2 text-accent-300 transition-opacity [grid-area:1/1] lg:justify-start ${copied ? '' : 'opacity-0'}`}
                    >
                      <Check className="size-4" />
                      {copied ? 'Copied to clipboard' : ''}
                    </span>
                  </span>
                </button>
              </div>
            </div>

            {/* Around the site */}
            <nav aria-label="Footer">
              <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent-300 uppercase">Around the site</p>
              <ul className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-3 lg:block lg:space-y-2.5">
                {SITE.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="group inline-flex items-center gap-2 text-[15px] text-accent-100/75 transition-colors hover:text-accent-50">
                      <span aria-hidden="true" className="size-1.5 bg-accent-300/60 transition-all group-hover:w-3 group-hover:bg-accent-300" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Elsewhere + local time */}
            <div>
              <p className="font-mono text-[11px] font-bold tracking-[0.18em] text-accent-300 uppercase">Elsewhere</p>
              <div className="mt-4 flex justify-center gap-3 lg:justify-start">
                {socialLinks.map((s) => (
                  <PixelSocialLink key={s.label} href={s.href} label={s.label} pixel={s.pixel} />
                ))}
              </div>
              <p className="mt-8 font-mono text-[11px] font-bold tracking-[0.18em] text-accent-300 uppercase">My local time</p>
              <div className="mt-3">
                <LocalTime />
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 flex flex-col items-center gap-5 border-t-2 border-accent-100/20 pt-6 text-center font-mono text-xs text-accent-100/70 lg:flex-row lg:justify-between lg:gap-4 lg:text-left">
            <div className="flex flex-col items-center gap-3 lg:flex-row">
              <img src={avatar} alt="" width={40} height={40} loading="lazy" className="size-10 shrink-0 rounded-full ring-2 ring-accent-300/70" />
              <div>
                <p className="font-display text-sm font-semibold text-accent-50">
                  {profile.firstName} {profile.lastName}
                </p>
                <p className="mt-0.5">Built pixel by pixel with React & Tailwind</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0 })}
              className="group inline-flex w-fit cursor-pointer items-center gap-2 uppercase tracking-[0.14em] transition-colors hover:text-accent-300"
            >
              Back to top
              <ArrowUp className="size-3.5 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </div>

        {/* The name, cut in half by the bottom of the page */}
        <div className="relative mx-auto mt-6 max-w-7xl px-3 sm:px-6">
          <SunkName />
        </div>
      </div>

      <MailDialog
        dialogRef={dialogRef}
        id="note"
        eyebrow="Mailbox open"
        title="Tell me something"
        blurb="Ideas, offers, feedback, or a hello. It lands straight in my inbox."
        fields={NOTE_FIELDS}
        submitLabel="Send it"
        onSend={sendNote}
      />
    </footer>
  )
}
