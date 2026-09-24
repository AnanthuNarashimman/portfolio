import { motion } from 'motion/react'
import portrait from '../assets/profile-cutout.webp'
import { profile } from '../data/profile'

/*
 * The portrait bursts through a hole torn in the red card.
 * Everything is drawn in the illustration's own pixel space (1254×1254) so the
 * hole lines up with the shoulders: the head sits in front of the torn edge,
 * the torso disappears behind the paper below it.
 */

const IMG = 1254
const CX = 700
const CY = 905
const RX = 500
const RY = 325
const SQUARENESS = 3.2 // superellipse exponent: flatter top so the ears stay inside the hole
const HEAD_CUT = 605 // everything above this line is in front of the paper

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Point on the hole's superellipse outline at angle t, scaled by s
function edgePoint(t: number, s = 1): [number, number] {
  const c = Math.cos(t)
  const n = Math.sin(t)
  const e = 2 / SQUARENESS
  return [CX + RX * s * Math.sign(c) * Math.abs(c) ** e, CY + RY * s * Math.sign(n) * Math.abs(n) ** e]
}

// Ragged closed outline: slow wobble plus sharp paper-fibre teeth
function tornOutline(seed: number, scale: number, teeth: number) {
  const rand = rng(seed)
  const phases = [rand() * 6.28, rand() * 6.28, rand() * 6.28]
  const steps = 150
  const pts: string[] = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const wobble = 0.025 * Math.sin(3 * t + phases[0]) + 0.018 * Math.sin(5 * t + phases[1]) + 0.012 * Math.sin(9 * t + phases[2])
    const tooth = (i % 2 ? 1 : -0.4) * teeth * rand()
    const [x, y] = edgePoint(t, scale * (1 + wobble + tooth))
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`)
  }
  return `M${pts.join('L')}Z`
}

const HOLE = tornOutline(7, 1, 0.012)
const RIM = tornOutline(19, 1.045, 0.022)

// Paper flaps peeling outward from the tear: [start angle, end angle, reach, twist] in degrees
const FLAPS: [number, number, number, number][] = [
  [196, 214, 1.34, 10],
  [140, 158, 1.3, -8],
  [100, 116, 1.24, 6],
  [52, 68, 1.3, -10],
  [-4, 12, 1.33, 8],
  [-36, -24, 1.26, -6],
]

function flapPath([a0, a1, reach, twist]: (typeof FLAPS)[number]) {
  const r = (d: number) => (d * Math.PI) / 180
  const [x0, y0] = edgePoint(r(a0), 1.03)
  const [x1, y1] = edgePoint(r(a1), 1.03)
  const [tx, ty] = edgePoint(r((a0 + a1) / 2 + twist), reach)
  const [mx0, my0] = edgePoint(r(a0 + (a1 - a0) * 0.2 + twist * 0.6), (1 + reach) / 2 + 0.03)
  const [mx1, my1] = edgePoint(r(a1 - (a1 - a0) * 0.25 + twist * 0.6), (1 + reach) / 2 - 0.02)
  return `M${x0},${y0}L${mx0},${my0}L${tx},${ty}L${mx1},${my1}L${x1},${y1}Z`
}

// Loose scraps of paper flying off the tear: [x, y, size, rotation, drift delay]
const SCRAPS: [number, number, number, number, number][] = [
  [175, 470, 46, -18, 0],
  [1185, 520, 38, 24, 1.2],
  [135, 1130, 30, 40, 0.6],
  [1215, 1080, 44, -30, 1.8],
]

function scrapPath(size: number, seed: number) {
  const rand = rng(seed)
  const pts = Array.from({ length: 7 }, (_, i) => {
    const t = (i / 7) * Math.PI * 2
    const r = size * (0.55 + rand() * 0.5)
    return `${(Math.cos(t) * r).toFixed(1)},${(Math.sin(t) * r * 0.75).toFixed(1)}`
  })
  return `M${pts.join('L')}Z`
}

// Hand-drawn four-point sparkle
const SPARKLE = 'M0,-40 C4,-10 10,-4 40,0 C10,4 4,10 0,40 C-4,10 -10,4 -40,0 C-10,-4 -4,-10 0,-40Z'

const pop = { type: 'spring', stiffness: 120, damping: 14 } as const

export default function TornPortrait() {
  return (
    <div className="relative mx-auto aspect-[1180/1290] w-full max-w-md lg:mr-0 lg:w-[min(100%,calc(min(76dvh,700px)*0.915))] lg:max-w-none">
      <svg
        viewBox="95 20 1180 1290"
        className="absolute inset-0 size-full overflow-visible"
        role="img"
        aria-label={`Illustration of ${profile.firstName} bursting through the page`}
      >
        <defs>
          <clipPath id="hole-clip">
            <path d={HOLE} />
          </clipPath>
          <mask id="burst-mask" maskUnits="userSpaceOnUse" x="0" y="0" width={IMG} height={IMG}>
            <rect x="0" y="0" width={IMG} height={HEAD_CUT} fill="#fff" />
            <path d={HOLE} fill="#fff" />
          </mask>
          <radialGradient id="paper" cx="50%" cy="60%" r="65%">
            <stop offset="0%" stopColor="#fffdf6" />
            <stop offset="70%" stopColor="#fdf7ec" />
            <stop offset="100%" stopColor="#f4e6d2" />
          </radialGradient>
          <linearGradient id="flap" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fff4ec" />
            <stop offset="60%" stopColor="#f9dccf" />
            <stop offset="100%" stopColor="#eab8a6" />
          </linearGradient>
          <filter id="grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" />
            <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.05 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
          <filter id="lift" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="#4a0b0b" floodOpacity="0.45" />
          </filter>
          <filter id="flap-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="6" dy="10" stdDeviation="8" floodColor="#4a0b0b" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* The tear opens up */}
        <motion.g
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...pop, delay: 0.3 }}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          {/* Shadow the torn edge casts on the card */}
          <path d={RIM} fill="#4a0b0b" opacity="0.35" filter="url(#soft)" transform="translate(0 16)" />
          {/* White paper fibres along the torn edge */}
          <path d={RIM} fill="#fff6ee" />
          {/* The paper behind */}
          <path d={HOLE} fill="url(#paper)" />
          <path d={HOLE} fill="#fff" filter="url(#grain)" />
          {/* Inner shadow so the hole reads as depth */}
          <g clipPath="url(#hole-clip)">
            <path d={HOLE} fill="none" stroke="#7a1616" strokeOpacity="0.35" strokeWidth="70" filter="url(#soft)" />
          </g>

          {/* Curled flaps peeling back */}
          {FLAPS.map((f, i) => (
            <path key={i} d={flapPath(f)} fill="url(#flap)" stroke="#fff6ee" strokeWidth="3" filter="url(#flap-shadow)" />
          ))}
        </motion.g>

        {/* The portrait pushing through */}
        <motion.g
          initial={{ y: 140, scale: 0.86, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ ...pop, delay: 0.55 }}
          style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
        >
          <g filter="url(#lift)">
            <image href={portrait} x="0" y="0" width={IMG} height={IMG} mask="url(#burst-mask)" />
          </g>
        </motion.g>

        {/* Scraps of paper flying off */}
        {SCRAPS.map(([x, y, size, rot, delay], i) => (
          <motion.g
            key={i}
            initial={{ opacity: 0, x: CX - x, y: CY - y, scale: 0.3 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{ ...pop, delay: 0.5 + i * 0.06 }}
          >
            <g transform={`translate(${x} ${y}) rotate(${rot})`}>
              <g className="animate-float" style={{ animationDelay: `${-delay}s` }}>
                <path d={scrapPath(size, 40 + i)} fill={i % 2 ? '#f8ebab' : '#fff6ee'} filter="url(#flap-shadow)" />
              </g>
            </g>
          </motion.g>
        ))}

        {/* Gold sparkles */}
        {[
          [1150, 250, 0.9],
          [255, 300, 0.55],
          [1225, 860, 0.5],
        ].map(([x, y, s], i) => (
          <motion.path
            key={i}
            d={SPARKLE}
            fill="#f7d87f"
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: s, rotate: 0 }}
            transition={{ ...pop, delay: 1 + i * 0.15 }}
            style={{ x, y }}
          />
        ))}
      </svg>
    </div>
  )
}
