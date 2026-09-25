import type { CSSProperties } from 'react'

/*
 * Full-width backdrop band for the interlude: a warm body with stepped "8-bit" waves along the
 * top and bottom edges. Each edge stacks three wave layers (crimson → orange → band colour)
 * drifting at different speeds, so the rim reads as a moving pixel sunset. Motion is one
 * translateX per layer (GPU-composited); one period tiles seamlessly.
 */

const STRIP = 96 // wave strip height (px)
const STEP = 8 // pixel size of the stairs

// One period of a stepped wave, closed downward so it can be filled below the wave line
function wavePath(period: number, base: number, amp: number, amp2: number, phase: number) {
  let d = `M0,${STRIP}`
  for (let x = 0; x <= period; x += STEP) {
    const t = (x / period) * Math.PI * 2
    const y = base + amp * Math.sin(t + phase) + amp2 * Math.sin(3 * t + phase * 1.7)
    const q = Math.round(y / STEP) * STEP
    d += `V${q}H${Math.min(x + STEP, period)}`
  }
  return `${d}V${STRIP}Z`
}

type Layer = {
  id: string
  period: number
  base: number
  amp: number
  amp2: number
  phase: number
  className: string
  ms: number
  reverse?: boolean
}

const LAYERS: Layer[] = [
  { id: 'crimson', period: 720, base: 34, amp: 18, amp2: 6, phase: 0.8, className: 'fill-accent-600 dark:fill-accent-600', ms: 30000, reverse: true },
  { id: 'orange', period: 560, base: 46, amp: 16, amp2: 5, phase: 2.1, className: 'fill-accent-400 dark:fill-accent-400/85', ms: 22000 },
  { id: 'front', period: 480, base: 58, amp: 14, amp2: 4, phase: 0, className: 'fill-[#fde2bd] dark:fill-[#4a1813]', ms: 16000, reverse: true },
]

function WaveStrip({ flip }: { flip?: boolean }) {
  const side = flip ? 'b' : 't'
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 overflow-hidden ${flip ? 'bottom-0 -scale-y-100' : 'top-0'}`}
      style={{ height: STRIP }}
    >
      {LAYERS.map((l) => (
        <div
          key={l.id}
          className="wave-scroll absolute top-0 left-0 h-full"
          style={
            {
              width: `calc(100% + ${l.period}px)`,
              '--period': `-${l.period}px`,
              animationDuration: `${l.ms}ms`,
              animationDirection: (l.reverse ? !flip : flip) ? 'reverse' : 'normal',
            } as CSSProperties
          }
        >
          <svg width="100%" height={STRIP} className="block">
            <defs>
              <pattern id={`wave-${l.id}-${side}`} width={l.period} height={STRIP} patternUnits="userSpaceOnUse">
                <path d={wavePath(l.period, l.base, l.amp, l.amp2, l.phase)} className={l.className} />
              </pattern>
            </defs>
            <rect width="100%" height={STRIP} fill={`url(#wave-${l.id}-${side})`} />
          </svg>
        </div>
      ))}
    </div>
  )
}

// A few pixel sparks drifting up through the band
const SPARKS = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 37 + 11) % 100}%`,
  size: i % 3 === 0 ? 8 : 4,
  delay: `${-((i * 1.9) % 12)}s`,
  dur: `${10 + (i % 5) * 2.5}s`,
}))

export default function PixelWaveBand() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      {/* Body of the band between the two wave strips (matches the front wave colour) */}
      <div className="absolute inset-x-0 bg-[#fde2bd] dark:bg-[#4a1813]" style={{ top: STRIP - 1, bottom: STRIP - 1 }}>
        {SPARKS.map((s, i) => (
          <span
            key={i}
            className="band-spark absolute bottom-0 bg-accent-500/60 dark:bg-accent-400/70"
            style={{ left: s.left, width: s.size, height: s.size, animationDelay: s.delay, animationDuration: s.dur }}
          />
        ))}
      </div>
      <WaveStrip />
      <WaveStrip flip />
    </div>
  )
}
