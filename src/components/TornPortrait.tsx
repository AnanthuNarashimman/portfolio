import { m, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useState, type PointerEvent, type ReactNode } from 'react'
import portrait from '../assets/portrait.webp'
import { useIntroDone } from '../lib/intro'
import { profile } from '../data/profile'

/*
 * The portrait bursts through a hole torn in the red card.
 * Everything is drawn in the illustration's own pixel space (1254×1254) so the
 * hole lines up with the shoulders: the head sits in front of the torn edge,
 * the torso disappears behind the paper below it.
 *
 * Performance: every ragged edge is computed once in JS (no displacement filters),
 * the portrait is clipped with a plain vector clipPath, and the few blur filters
 * live in layers that only ever move as a whole. So animation never re-runs a
 * filter — it stays smooth even on laptops rendering without a GPU.
 */

const IMG = 1254
const VIEWBOX = '95 20 1180 1230'
const CX = 665
const CY = 950
const RX = 560
const RY = 280 // top half
const RY_BOTTOM = 210 // shallower bottom half so the tear stays above the shirt hem
const SQUARENESS = 3.2 // superellipse exponent: flatter top so the ears stay inside the hole
const HEAD_CUT = 700 // everything above this line is in front of the paper
const TAU = Math.PI * 2

type Pt = [number, number]
const fmt = ([x, y]: Pt) => `${x.toFixed(1)},${y.toFixed(1)}`
const rad = (d: number) => (d * Math.PI) / 180

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Smooth random function around the circle (period 2π), values in -1…1
function loopNoise(rand: () => number, freq: number) {
  const v = Array.from({ length: freq }, () => rand() * 2 - 1)
  return (t: number) => {
    const x = (((t % TAU) + TAU) % TAU) / TAU * freq
    const i = Math.floor(x)
    const s = (1 - Math.cos(Math.PI * (x - i))) / 2
    return v[i % freq] + (v[(i + 1) % freq] - v[i % freq]) * s
  }
}

// Point on the hole's superellipse outline at angle t, scaled by s
function edgePoint(t: number, s = 1): Pt {
  const c = Math.cos(t)
  const n = Math.sin(t)
  const e = 2 / SQUARENESS
  const ry = n > 0 ? RY_BOTTOM : RY
  return [CX + RX * s * Math.sign(c) * Math.abs(c) ** e, CY + ry * s * Math.sign(n) * Math.abs(n) ** e]
}

/* ---------- The hole: layered noise + a few abrupt tongues, like real torn card ---------- */

const edgeRand = rng(7)
const octaves = [
  [5, 0.026],
  [13, 0.015],
  [29, 0.008],
  [71, 0.004],
].map(([f, a]) => [loopNoise(edgeRand, f), a] as const)
const tongues = Array.from({ length: 11 }, () => ({
  at: edgeRand() * TAU,
  width: 0.015 + edgeRand() * 0.05,
  amp: (edgeRand() - 0.45) * 0.08,
}))
const angleDist = (a: number, b: number) => Math.abs(((((a - b + Math.PI) % TAU) + TAU) % TAU) - Math.PI)

function holeScale(t: number) {
  let s = 1
  for (const [n, a] of octaves) s += n(t) * a
  for (const { at, width, amp } of tongues) s += amp * Math.max(0, 1 - angleDist(t, at) / width)
  return s
}

/* ---------- The peeled lip: the whole edge rolls back as one piece, swelling into flaps ---------- */

/*
 * Flaps are where the card split further and peeled back more. They grow out of the lip, so there are
 * no hard ends: [angle°, reach px, spread left°, spread right°] — 0 = right, 90 = bottom. Spread
 * around the sides and bottom (the top is behind the head); each gets a seeded random nudge so none
 * are alike, and the lopsided spreads keep any flap from being symmetric.
 */
const flapRand = rng(99)
const FLAPS = (
  [
    [-38, 42, 7, 5],
    [4, 104, 9, 14],
    [47, 62, 11, 6],
    [83, 86, 6, 10],
    [100, 40, 4, 6],
    [142, 46, 15, 11],
    [184, 112, 10, 13],
    [215, 46, 6, 9],
  ] as const
).map(([a, reach, wl, wr]) => ({
  at: rad(a + (flapRand() - 0.5) * 8),
  reach: reach * (0.82 + flapRand() * 0.36),
  left: rad(wl * (0.8 + flapRand() * 0.45)),
  right: rad(wr * (0.8 + flapRand() * 0.45)),
}))

const lipNoise = loopNoise(edgeRand, 23)
const bandA = loopNoise(edgeRand, 17)
const bandB = loopNoise(edgeRand, 53)

// Lip width (px beyond the hole): a thin wavering roll everywhere, plus the flaps. Pointed tips, concave sides.
function lipWidth(t: number) {
  let w = 6 + 9 * (0.5 + 0.5 * lipNoise(t))
  for (const { at, reach, left, right } of FLAPS) {
    const d = (((t - at + Math.PI) % TAU) + TAU) % TAU - Math.PI
    const x = Math.abs(d) / (d < 0 ? left : right)
    if (x < 1) w += reach * (1 - x) ** 1.6
  }
  return w
}
// White paper core exposed along the torn outer edge — uneven, like real torn card
const coreWidth = (t: number) => 3 + 9 * Math.max(0, bandA(t)) ** 1.3 + 3 * (0.5 + 0.5 * bandB(t))

const STEPS = 900
const EDGE = (() => {
  const rand = rng(11)
  return Array.from({ length: STEPS }, (_, i) => {
    const t = (i / STEPS) * TAU
    const p = edgePoint(t, holeScale(t))
    // outward normal from the neighbouring points
    const a = edgePoint(t - 0.004, holeScale(t - 0.004))
    const b = edgePoint(t + 0.004, holeScale(t + 0.004))
    let [nx, ny] = [b[1] - a[1], -(b[0] - a[0])]
    const l = Math.hypot(nx, ny) || 1
    ;[nx, ny] = [nx / l, ny / l]
    if (nx * (p[0] - CX) + ny * (p[1] - CY) < 0) [nx, ny] = [-nx, -ny]
    const lip = lipWidth(t) + (rand() - 0.5) * 3 // fibres
    const core = lip + coreWidth(t) + (rand() - 0.5) * 3.5
    const j = (rand() - 0.5) * 2.5
    return {
      hole: [p[0] + nx * j, p[1] + ny * j] as Pt,
      lip: [p[0] + nx * lip, p[1] + ny * lip] as Pt,
      core: [p[0] + nx * core, p[1] + ny * core] as Pt,
    }
  })
})()
const closed = (pts: Pt[]) => `M${pts.map(fmt).join('L')}Z`

const HOLE = closed(EDGE.map((e) => e.hole))
const LIP = closed(EDGE.map((e) => e.lip))
const CORE = closed(EDGE.map((e) => e.core))
// Half-resolution outline for clipping the portrait — it's re-clipped every hover frame, so fewer points = cheaper
const HOLE_CLIP = closed(EDGE.filter((_, i) => i % 2 === 0).map((e) => e.hole))

// Hand-drawn four-point sparkle
const SPARKLE = 'M0,-40 C4,-10 10,-4 40,0 C10,4 4,10 0,40 C-4,10 -10,4 -40,0 C-10,-4 -4,-10 0,-40Z'
const SPARKLES = [
  [1150, 250, 0.9],
  [255, 300, 0.55],
  [1235, 800, 0.5],
]

const pop = { type: 'spring', stiffness: 120, damping: 14 } as const

// Shared SVG definitions referenced by every layer
function Defs() {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute">
      <defs>
        <clipPath id="lip-clip">
          <path d={LIP} />
        </clipPath>
        <clipPath id="hole-clip">
          <path d={HOLE} />
        </clipPath>
        {/* Head in front of the paper (above HEAD_CUT) + body visible only through the hole */}
        <clipPath id="burst-clip">
          <rect x="-200" y="-200" width="1700" height={HEAD_CUT + 200} />
          <path d={HOLE_CLIP} />
        </clipPath>
        <radialGradient id="paper" gradientUnits="userSpaceOnUse" cx={CX} cy={CY + 40} r="620">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="65%" stopColor="#fbf4e7" />
          <stop offset="100%" stopColor="#efe0ca" />
        </radialGradient>
      </defs>
    </svg>
  )
}

// Frame around the hole, used for the inner shadow (hole cut out with even-odd fill)
const INNER_FRAME = `M${CX - RX - 90},${CY - RY - 90}H${CX + RX + 90}V${CY + RY_BOTTOM + 90}H${CX - RX - 90}Z ${HOLE}`

/*
 * Soft shadow without a blur filter: a few translucent copies of the shape, each nudged a bit
 * further along (dx, dy). Overlaps build a darker core and a feathered edge, and plain fills
 * cost almost nothing to paint — unlike feGaussianBlur on a CPU-only laptop.
 */
function SoftShadow({ d, dx, dy, opacity, color, evenOdd }: { d: string; dx: number; dy: number; opacity: number; color: string; evenOdd?: boolean }) {
  const steps = 5
  return (
    <g fill={color} fillRule={evenOdd ? 'evenodd' : undefined} opacity={opacity}>
      {Array.from({ length: steps }, (_, i) => {
        const k = (i + 1) / steps
        return <path key={i} d={d} opacity={1 / steps + 0.08} transform={`translate(${(dx * k).toFixed(1)} ${(dy * k).toFixed(1)})`} />
      })}
    </g>
  )
}

const SCENE_IMAGES = [portrait]

/*
 * Resolves once the scene's images are decoded and the page has painted twice. The entrance waits
 * for this, so on a slow laptop the animation plays from its first frame instead of starting while
 * the page is still loading and skipping ahead in visible jumps.
 */
function useSceneReady() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    let cancelled = false
    const decodes = SCENE_IMAGES.map((src) => {
      const img = new Image()
      img.src = src
      return img.decode().catch(() => {})
    })
    Promise.all(decodes).then(() =>
      requestAnimationFrame(() => requestAnimationFrame(() => !cancelled && setReady(true))),
    )
    return () => {
      cancelled = true
    }
  }, [])
  return ready
}

type LayerProps = {
  x: MotionValue<number>
  y: MotionValue<number>
  children: ReactNode
  initial?: { opacity?: number; scale?: number }
  play?: boolean
  delay?: number
}

// One stacked scene layer. It only ever moves/fades as a whole (a cheap transform), so its content is painted once.
function Layer({ x, y, children, initial, play = true, delay = 0 }: LayerProps) {
  return (
    <m.div
      className="pointer-events-none absolute inset-0 will-change-transform"
      style={{ x, y }}
      initial={initial}
      animate={initial && play ? { opacity: 1, scale: 1 } : undefined}
      transition={{ ...pop, delay, opacity: { duration: 0.35, delay } }}
    >
      <svg viewBox={VIEWBOX} className="absolute inset-0 size-full overflow-visible">
        {children}
      </svg>
    </m.div>
  )
}

export default function TornPortrait() {
  const reduceMotion = useReducedMotion()
  // Bursts through once its image is decoded and (on a first visit) the opening animation has cleared
  const introDone = useIntroDone()
  const sceneReady = useSceneReady()
  const play = sceneReady && introDone

  // Pointer position over the portrait, -0.5 … 0.5 on each axis, eased with a spring
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 140, damping: 18, mass: 0.6 }
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)
  const hover = useSpring(0, spring)

  // Whole scene tilts toward the cursor…
  const rotateY = useTransform(sx, [-0.5, 0.5], [-7, 7])
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6])
  // …and each layer shifts by its depth (CSS px), so nearer things move further
  const tearX = useTransform(sx, (v) => v * 8)
  const tearY = useTransform(sy, (v) => v * 6)
  // Portrait shifts *inside* the fixed clip (SVG user units), so the torn edge keeps clipping the body
  const headX = useTransform(sx, (v) => v * 44)
  const headY = useTransform([sy, hover], ([y, h]: number[]) => y * 26 - h * 16)
  const headTurn = useTransform(sx, (v) => v * 4)
  const sparkX = useTransform(sx, (v) => v * -30)
  const sparkY = useTransform(sy, (v) => v * -24)

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
    hover.set(1)
  }
  function onPointerLeave() {
    px.set(0)
    py.set(0)
    hover.set(0)
  }

  return (
    <div
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="relative mx-auto aspect-[1180/1230] w-full max-w-md lg:mr-0 lg:w-[min(100%,calc(min(76dvh,700px)*0.959))] lg:max-w-none"
      role="img"
      aria-label={`Illustration of ${profile.firstName} bursting through the page`}
    >
      <Defs />
      <m.div className="absolute inset-0" style={{ rotateX, rotateY, transformPerspective: 1100 }}>
        {/* The tear in the card — pops open as one pre-painted layer */}
        <Layer x={tearX} y={tearY} initial={{ opacity: 0, scale: 0.55 }} play={play} delay={0.05}>
          {/* Shadow the lifted, peeled edge casts on the card */}
          <SoftShadow d={CORE} dx={3} dy={14} opacity={0.38} color="#3a0808" />
          {/* Torn outer edge: uneven white paper core, thin dark line where the red face breaks */}
          <path d={CORE} fill="#fff7ef" stroke="#8f1414" strokeOpacity="0.4" strokeWidth="3.5" strokeLinejoin="round" />
          {/* The peeled-back lip: the card's pale underside, shaded like it rolls over at the fold */}
          <path d={LIP} fill="#f3d5ca" />
          <g clipPath="url(#lip-clip)" fill="none">
            <path d={LIP} stroke="#b9786a" strokeOpacity="0.35" strokeWidth="7" />
            <path d={HOLE} stroke="#fff6f1" strokeOpacity="0.75" strokeWidth="44" />
            <path d={HOLE} stroke="#a4544a" strokeOpacity="0.35" strokeWidth="20" />
            <path d={HOLE} stroke="#7a2a22" strokeOpacity="0.4" strokeWidth="9" />
          </g>
          {/* The paper behind the card */}
          <g clipPath="url(#hole-clip)">
            <rect x="0" y="560" width={IMG + 100} height="720" fill="url(#paper)" />
            {/* Inner shadow: the card's cut edge overhangs the paper, darkest along the top */}
            <SoftShadow d={INNER_FRAME} dx={0} dy={26} opacity={0.5} color="#3a0808" evenOdd />
          </g>
        </Layer>

        {/* The portrait: rises through the hole, then leans and lifts toward the cursor — no filters, just an image in a vector clip */}
        <Layer x={tearX} y={tearY}>
          <g clipPath="url(#burst-clip)">
            <m.g style={{ x: headX, y: headY, rotate: headTurn, transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
              <m.g
                initial={{ y: 160, opacity: 0 }}
                animate={play ? { y: 0, opacity: 1 } : undefined}
                transition={{ ...pop, delay: 0.25, opacity: { duration: 0.25, delay: 0.25 } }}
              >
                <image href={portrait} x="0" y="0" width={IMG} height={IMG} />
              </m.g>
            </m.g>
          </g>
        </Layer>

        {/* Gold sparkles drift the other way for depth */}
        <Layer x={sparkX} y={sparkY}>
          {SPARKLES.map(([x, y, s], i) => (
            <m.path
              key={i}
              d={SPARKLE}
              fill="#f7d87f"
              initial={{ scale: 0, rotate: -45 }}
              animate={play ? { scale: s, rotate: 0 } : undefined}
              transition={{ ...pop, delay: 0.7 + i * 0.15 }}
              style={{ x, y }}
            />
          ))}
        </Layer>
      </m.div>
    </div>
  )
}
