import { useRef, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { hackathons, type Hackathon } from '../data/hackathons'
import { sendInvite } from '../lib/mail'
import ArcadeBand from './ArcadeBand'
import HackathonScene from './HackathonScene'
import MailDialog, { type MailField } from './MailDialog'
import PixelButton from './PixelButton'
import me from '../assets/me/hackathon-me.png'
import './hackathons.css'

/*
 * Hackathon diaries: the same dark arcade band as the tech stack, one slow marquee of small
 * pixel cards (each with a scene of its city), and a pixel me pointing at the invite button.
 */

const px = (n: number) => ({ '--px': `${n}px` }) as CSSProperties


function Card({ h, n }: { h: Hackathon; n: number }) {
  const win = h.result === 'Winner'
  return (
    <li className="group relative mx-3 w-[260px] shrink-0">
      <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1.5 translate-y-1.5 bg-black/55" style={px(6)} />
      <article
        className="pixel-corners relative flex h-full flex-col bg-[#fff7ef] p-1.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
        style={px(6)}
      >
        <div className="pixel-corners relative overflow-hidden" style={px(4)}>
          <HackathonScene kind={h.scene} time={h.time} title={`${h.city}, pixel scene`} />
          <span className="absolute top-1.5 right-1.5 bg-black/55 px-1.5 font-mono text-[10px] font-bold tracking-[0.12em] text-accent-50">
            #{String(n).padStart(2, '0')}
          </span>
          {h.great && (
            <span className="absolute top-1.5 left-1.5 bg-accent-300 px-1.5 font-mono text-[10px] font-bold tracking-[0.08em] text-accent-800 uppercase">
              ★ One of the greats
            </span>
          )}
        </div>
        <div className="flex flex-1 flex-col px-2 pt-3 pb-2">
          <h3 className="font-display text-[17px] leading-tight font-semibold tracking-[-0.01em] text-ink">{h.name}</h3>
          <p className="mt-0.5 text-[13px] text-ink/60">{h.tagline}</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="truncate font-mono text-[11px] whitespace-nowrap text-ink/70 uppercase">
              {h.city} · {h.date.replace(/ 20(\d\d)$/, ' ’$1')}
            </span>
            <span
              className={`pixel-corners shrink-0 px-2 py-0.5 font-mono text-[10px] font-bold tracking-[0.1em] uppercase ${
                win ? 'bg-accent-300 text-accent-800' : 'bg-accent-600 text-accent-50'
              }`}
              style={px(2)}
            >
              {h.result}
            </span>
          </div>
        </div>
      </article>
    </li>
  )
}

const INVITE_FIELDS: MailField[] = [
  { name: 'name', label: 'Your name', placeholder: 'Ada Lovelace', required: true },
  { name: 'email', label: 'Your email', type: 'email', placeholder: 'you@example.com', required: true },
  { name: 'hackathon', label: 'Hackathon', placeholder: 'HackNight 2026', required: true },
  { name: 'when', label: 'When & where', placeholder: 'Oct 12–13 · Bengaluru' },
  { name: 'message', label: 'Message', multiline: true, wide: true },
]

export default function Hackathons() {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <ArcadeBand id="build-log" label="Hackathons">
      <div data-reveal className="relative mx-auto mb-12 flex max-w-7xl items-end gap-6 px-5 sm:px-8 lg:px-24">
        {/* Pixel me, breaking out over the band's top edge and pointing at the invite */}
        <div aria-hidden="true" className="relative -mt-44 hidden shrink-0 md:block">
          <img src={me} alt="" width={216} height={300} loading="lazy" decoding="async" className="relative z-10 h-[300px] w-[216px] [image-rendering:pixelated]" />
          <span className="absolute -bottom-1 left-1/2 h-2 w-36 -translate-x-1/2 bg-black/45" />
        </div>

        <div className="min-w-0 flex-1 pb-2">
          <p className="font-mono text-xs tracking-[0.25em] text-accent-300 uppercase">Hackathon diaries</p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-accent-50 sm:text-4xl">
            Weekends on the{' '}
            <span className="relative inline-block">
              <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-black/50" />
              <span className="pixel-corners relative inline-block bg-accent-300 px-2.5 pb-0.5 text-accent-800">clock.</span>
            </span>
          </h2>
          <p className="mt-4 font-mono text-sm text-accent-100/75">
            Hackathons across India and online · plenty of all-nighters · a trophy (so far)
          </p>

          <div className="mt-7 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center">
            <div className="hack-bubble relative hidden self-start bg-[#fff7ef] px-3.5 py-2 font-mono text-sm font-bold text-ink md:block">
              Got one coming up?
            </div>
            <PixelButton onClick={() => dialogRef.current?.showModal()} className="w-full sm:w-auto [&>span:last-child]:w-full [&>span:last-child]:justify-center">
              Invite me to a hackathon <ArrowRight className="size-4" />
            </PixelButton>
          </div>
        </div>
      </div>

      <div data-reveal className="tech-fade relative" style={{ '--reveal-delay': '120ms' } as CSSProperties}>
        <div className="tech-row relative overflow-hidden py-3" aria-label="Hackathons I've built at">
          <div className="tech-track flex w-max" style={{ animationDuration: '70s' }}>
            <ul className="flex">
              {hackathons.map((h, i) => (
                <Card key={h.name} h={h} n={i + 1} />
              ))}
            </ul>
            <ul className="flex" aria-hidden="true">
              {hackathons.map((h, i) => (
                <Card key={h.name} h={h} n={i + 1} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <MailDialog
        dialogRef={dialogRef}
        id="invite"
        eyebrow="Player 2 wanted"
        title="Invite me to a hackathon"
        blurb="Organiser, teammate, or just someone with a wild idea — drop the details and I'll get back within a day."
        fields={INVITE_FIELDS}
        initial={{ message: "Hey Ananthu, we'd love to have you build with us. Here's what the event is about:" }}
        submitLabel="Send invite"
        onSend={sendInvite}
      />
    </ArcadeBand>
  )
}
