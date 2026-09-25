import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import f01 from '../assets/titan/f01.webp'
import f02 from '../assets/titan/f02.webp'
import f03 from '../assets/titan/f03.webp'
import f04 from '../assets/titan/f04.webp'
import f05 from '../assets/titan/f05.webp'
import f06 from '../assets/titan/f06.webp'
import f07 from '../assets/titan/f07.webp'
import f08 from '../assets/titan/f08.webp'
import f09 from '../assets/titan/f09.webp'
import f10 from '../assets/titan/f10.webp'
import { BEAM_H, BEAM_LEN, PAD, buildLabArt, DUMMY_FH, DUMMY_FW, DUMMY_PIVOT, P, pixelTextPath, pixelTextWidth, type LabArt } from './labPixels'
import PixelWaveBand from './PixelWaveBand'
import './breather.css'

/*
 * Interlude between the hero and projects, drawn as pixel art: in a test bay, a tiny me fires
 * a homemade repulsor at a crash-test dummy; it backfires, he scratches his head, fixes the
 * glove, and knocks the dummy back. Loops.
 *
 * The character is stop-motion (hand-drawn frames downsampled onto the pixel grid). The room,
 * dummy and every effect are generated pixel art (labPixels.ts); effects play as sprite sheets
 * with stepped timing, so everything moves in crisp, whole-pixel jumps.
 */

const SOURCES = [f01, f02, f03, f04, f05, f06, f07, f08, f09, f10]

type Fx = 'aim' | 'charge' | 'backfire' | 'dazed' | 'wipe' | 'scratch' | 'idea' | 'flip' | 'fire' | 'victory'

const BEATS: { fx: Fx; ms: number }[] = [
  { fx: 'aim', ms: 700 },
  { fx: 'charge', ms: 1100 },
  { fx: 'backfire', ms: 1000 },
  { fx: 'dazed', ms: 1300 },
  { fx: 'wipe', ms: 800 },
  { fx: 'scratch', ms: 1200 },
  { fx: 'idea', ms: 900 },
  { fx: 'flip', ms: 700 },
  { fx: 'fire', ms: 1400 },
  { fx: 'victory', ms: 1900 },
]

// Stage is 1280 × 440 units. The character/bench/dummy layout sits DX right of centre-left,
// leaving room for the armor pod (left) and server rack (right)
const W = 1280
const EXT = PAD * P // extra units drawn left/right of the core stage
const VIEW = `${-EXT} 0 ${W + EXT * 2} 440`
const DX = 140
// Character placement: frames are 551×600 source px, drawn as 166×181 art pixels at (OX, OY)
const OX = 160 + DX
const OY = 60
const FLOOR = 411
const CW = 332 // character draw size in stage units
const CH = 362
const S = CW / 551
const FINE = 2 // stage units per rendered art pixel
const snap = (v: number) => Math.round(v / FINE) * FINE
const at = (x: number, y: number): [number, number] => [snap(OX + x * S), snap(OY + y * S)]

// Anchor points measured on the frames
const CHARGE = at(453, 290)
const BACKFIRE = at(115, 250)
const FACE = at(300, 210)
const DAZED_HEAD = at(265, 40)
const SCRATCH_HEAD = at(420, 40)
const IDEA_HEAD = at(330, -20)
const FLIP_GLOVE = at(428, 254)
const MUZZLE = at(472, 270)
const PALM = at(407, 190)

// Dummy: pivot (base centre) sits here on the floor; the beam hits its chest
const DUMMY_BASE: [number, number] = [848 + DX, 404]
const DUMMY_X = DUMMY_BASE[0] - DUMMY_PIVOT[0] * P
const DUMMY_Y = DUMMY_BASE[1] - DUMMY_PIVOT[1] * P
const TARGET: [number, number] = [DUMMY_X + 15 * P, DUMMY_Y + 23 * P]

const INK = '#120d0c'
const GOLD = '#f7d87f'
const AMBER = '#ffc861'

const anim = (value: string, extra?: CSSProperties): CSSProperties => ({ animation: value, ...extra })
const vars = (v: Record<string, string>) => v as CSSProperties
const pixelated: CSSProperties = { imageRendering: 'pixelated' }

// Deterministic spread of points around a circle
const spread = (n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.sin(seed + i * 12.9898) * 0.5
    const r = 0.65 + ((Math.sin(seed * 3 + i * 78.233) + 1) / 2) * 0.55
    return { a, r, i }
  })

/** A sprite sheet played frame by frame (steps), clipped to one frame */
function Sprite({
  src,
  fw,
  fh,
  frames,
  x,
  y,
  ms,
  delay = 0,
  loop = false,
  scale = P,
}: {
  src: string
  fw: number
  fh: number
  frames: number
  x: number
  y: number
  ms: number
  delay?: number
  loop?: boolean
  scale?: number
}) {
  return (
    <svg x={x} y={y} width={fw * scale} height={fh * scale} viewBox={`0 0 ${fw * 2} ${fh * 2}`} overflow="hidden">
      <image
        href={src}
        width={fw * 2 * frames}
        height={fh * 2}
        style={{
          ...pixelated,
          ...vars({ '--sheet': `${-fw * 2 * frames}px` }),
          ...anim(`b-sprite ${ms}ms steps(${frames}) ${delay}ms ${loop ? 'infinite' : 'both'}`),
        }}
      />
    </svg>
  )
}

/** Pixel-font word with a chunky ink outline (the comic sound effects) */
function PixelWord({
  text,
  x,
  y,
  s = 8,
  color = GOLD,
  delay = 0,
  hold = 620,
}: {
  text: string
  x: number
  y: number
  s?: number
  color?: string
  delay?: number
  hold?: number
}) {
  const w = pixelTextWidth(text, s)
  return (
    <g transform={`translate(${snap(x - w / 2)} ${snap(y)})`}>
      <g className="fx" style={anim(`b-pop-px 240ms steps(3) ${delay}ms both, b-out 1ms ${delay + hold}ms forwards`)}>
        <path d={pixelTextPath(text, 0, 0, s, s / 2)} fill={INK} />
        <path d={pixelTextPath(text, 0, 0, s)} fill={color} />
      </g>
    </g>
  )
}

/** Small bitmap drawn on the pixel grid. '#' = main colour, 'w' = highlight, 'g' = grey, auto ink outline */
function Bitmap({ rows, x, y, color, s = P }: { rows: string[]; x: number; y: number; color: string; s?: number }) {
  const cells: ReactNode[] = []
  const on = (cx: number, cy: number) => !!rows[cy]?.[cx] && rows[cy][cx] !== '.'
  rows.forEach((row, cy) =>
    [...row].forEach((ch, cx) => {
      if (ch === '.') return
      for (const [dx, dy] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ])
        if (!on(cx + dx, cy + dy))
          cells.push(<rect key={`o${cx}-${cy}-${dx}-${dy}`} x={x + (cx + dx) * s} y={y + (cy + dy) * s} width={s} height={s} fill={INK} />)
    }),
  )
  rows.forEach((row, cy) =>
    [...row].forEach((ch, cx) => {
      if (ch === '.') return
      const fill = ch === 'w' ? '#fffbe8' : ch === 'g' ? '#9a918b' : color
      cells.push(<rect key={`${cx}-${cy}`} x={x + cx * s} y={y + cy * s} width={s} height={s} fill={fill} />)
    }),
  )
  return <g>{cells}</g>
}

const STAR = ['..#..', '.###.', '##w##', '.###.', '..#..']
const BULB = ['..###..', '.#www#.', '#ww####', '#w#####', '#######', '.#####.', '..###..', '..ggg..', '..ggg..']

/* ---------- Beat effects ---------- */

function Charge({ art }: { art: LabArt }) {
  const [x, y] = CHARGE
  return (
    <g>
      <Sprite src={art.fx.orb} fw={20} fh={20} frames={4} x={x - 40} y={y - 40} ms={240} loop />
      {spread(10, 2).map(({ a, r, i }) => (
        <rect
          key={i}
          x={x - 2}
          y={y - 2}
          width={P}
          height={P}
          fill={i % 2 ? GOLD : '#fffbe8'}
          style={{
            ...vars({ '--dx': `${snap(Math.cos(a) * 72 * r)}px`, '--dy': `${snap(Math.sin(a) * 72 * r)}px` }),
            ...anim(`b-converge 480ms steps(6) ${(i % 5) * 100}ms infinite`),
          }}
        />
      ))}
    </g>
  )
}

function Backfire({ art }: { art: LabArt }) {
  const [x, y] = BACKFIRE
  const [fx, fy] = FACE
  return (
    <g>
      <Sprite src={art.fx.boom} fw={52} fh={52} frames={9} x={x - 104} y={y - 104} ms={720} />
      {spread(10, 5).map(({ a, r, i }) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={P * (i % 3 ? 1 : 2)}
          height={P * (i % 3 ? 1 : 2)}
          fill={i % 3 ? GOLD : '#e98a3f'}
          style={{
            ...vars({ '--dx': `${snap(Math.cos(a) * 140 * r)}px`, '--dy': `${snap(Math.sin(a) * 110 * r)}px`, '--r': '0deg' }),
            ...anim('b-fly 600ms steps(8) 60ms both'),
          }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={i} style={anim(`b-rise-px 800ms steps(6) ${150 + i * 120}ms both`)}>
          <Sprite src={art.fx.smoke} fw={16} fh={16} frames={6} x={fx - 60 + i * 36} y={fy - 36} ms={800} delay={150 + i * 120} />
        </g>
      ))}
      <PixelWord text="FZZT!" x={x + 70} y={y - 150} delay={60} />
    </g>
  )
}

function Dazed({ art }: { art: LabArt }) {
  const [x, y] = DAZED_HEAD
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <Bitmap rows={STAR} x={-15} y={-15} color={GOLD} s={6} />
          <animateMotion
            dur="1.2s"
            repeatCount="indefinite"
            begin={`${-i * 0.4}s`}
            calcMode="linear"
            path={`M${x - 56},${y} a56,16 0 1,0 112,0 a56,16 0 1,0 -112,0`}
          />
        </g>
      ))}
      {[0, 1].map((i) => (
        <g key={`s${i}`} style={anim(`b-rise-px 1100ms steps(8) ${i * 350}ms both`)}>
          <Sprite src={art.fx.smoke} fw={16} fh={16} frames={6} x={x - 40 + i * 44} y={y - 8} ms={1100} delay={i * 350} />
        </g>
      ))}
    </g>
  )
}

function Wipe() {
  const [x, y] = FACE
  return (
    <g>
      {spread(7, 3).map(({ i }) => (
        <rect
          key={i}
          x={snap(x - 32 + i * 12)}
          y={snap(y + 8 + (i % 3) * 8)}
          width={P}
          height={P}
          fill="#5f4f4a"
          style={{ ...vars({ '--dx': `${(i - 3) * 4}px` }), ...anim(`b-fall 560ms steps(7) ${i * 45}ms both`) }}
        />
      ))}
    </g>
  )
}

function Scratch() {
  const [x, y] = SCRATCH_HEAD
  return (
    <g>
      <g style={anim('b-bob-px 600ms steps(2) infinite')}>
        <PixelWord text="?" x={x} y={y - 20} delay={60} hold={5000} />
      </g>
      <g style={anim('b-bob-px 600ms steps(2) 300ms infinite')}>
        <PixelWord text="?" x={x + 44} y={y - 56} s={6} delay={380} hold={5000} />
      </g>
    </g>
  )
}

function Idea() {
  const [x, y] = IDEA_HEAD
  const rays = [
    [-9, 0],
    [9, 0],
    [0, -9],
    [-7, -7],
    [7, -7],
    [-7, 6],
    [7, 6],
  ]
  return (
    <g transform={`translate(${snap(x - 21)} ${snap(y - 28)})`}>
      <g className="fx" style={anim('b-pop-px 240ms steps(3) both')}>
        {rays.map(([dx, dy], i) => (
          <rect key={i} x={(3 + dx) * 6} y={(3 + dy) * 6} width={6} height={6} fill={AMBER} style={anim(`b-flicker-px 240ms steps(1) ${i * 40}ms infinite`)} />
        ))}
        <Bitmap rows={BULB} x={0} y={-6} color={GOLD} s={6} />
      </g>
    </g>
  )
}

function Flip({ art }: { art: LabArt }) {
  const [x, y] = FLIP_GLOVE
  return (
    <g>
      <Sprite src={art.fx.swirl} fw={28} fh={28} frames={6} x={x - 56} y={y - 56} ms={420} loop />
      <PixelWord text="CLICK" x={x} y={y - 96} s={4} delay={380} />
    </g>
  )
}

function Fire({ art }: { art: LabArt }) {
  const [x, y] = MUZZLE
  const [tx, ty] = TARGET
  return (
    <g>
      {/* Beam: pixel sprite, revealed left→right in whole-pixel steps, then cut */}
      <g style={anim('b-beam-px 1100ms 120ms both')}>
        <Sprite src={art.fx.beam} fw={BEAM_LEN} fh={BEAM_H} frames={3} x={x} y={y - (BEAM_H * P) / 2} ms={120} loop />
      </g>
      <Sprite src={art.fx.muzzle} fw={24} fh={24} frames={3} x={x - 48} y={y - 48} ms={210} delay={90} />
      <Sprite src={art.fx.hit} fw={34} fh={34} frames={7} x={tx - 68} y={ty - 68} ms={560} delay={260} />
      {spread(12, 7).map(({ a, r, i }) => (
        <rect
          key={i}
          x={tx}
          y={ty}
          width={P}
          height={P}
          fill={i % 3 === 0 ? '#fffbe8' : GOLD}
          style={{
            ...vars({ '--dx': `${snap(Math.cos(a) * 110 * r)}px`, '--dy': `${snap(Math.sin(a) * 90 * r)}px`, '--r': '0deg' }),
            ...anim('b-fly 640ms steps(8) 300ms both'),
          }}
        />
      ))}
      <PixelWord text="PEW!" x={x + 80} y={y - 84} delay={140} />
    </g>
  )
}

function Victory({ art }: { art: LabArt }) {
  const [x, y] = PALM
  return (
    <g>
      {[0, 1].map((i) => (
        <g key={i} style={anim(`b-rise-px 1300ms steps(8) ${i * 420}ms both`)}>
          <Sprite src={art.fx.smoke} fw={16} fh={16} frames={6} x={x - 32} y={y - 32} ms={1300} delay={i * 420} />
        </g>
      ))}
      {[0, 1].map((i) => (
        <g key={`d${i}`} style={anim(`b-rise-px 1300ms steps(8) ${200 + i * 480}ms both`)}>
          <Sprite src={art.fx.smoke} fw={16} fh={16} frames={6} x={TARGET[0] - 24} y={TARGET[1] - 40} ms={1300} delay={200 + i * 480} />
        </g>
      ))}
    </g>
  )
}

const EFFECTS: Record<Fx, (p: { art: LabArt }) => ReactNode> = {
  aim: () => null,
  charge: Charge,
  backfire: Backfire,
  dazed: Dazed,
  wipe: Wipe,
  scratch: Scratch,
  idea: Idea,
  flip: Flip,
  fire: Fire,
  victory: Victory,
}

/* ---------- Holo readout (pixel text over the backdrop's projected panel) ---------- */

const HOLO: Record<Fx, { status: string; tone: string; power: number }> = {
  aim: { status: 'ARMING…', tone: AMBER, power: 2 },
  charge: { status: 'CHARGING', tone: '#ffb45c', power: 8 },
  backfire: { status: '✗ BACKFIRE', tone: '#ff6b5c', power: 0 },
  dazed: { status: '✗ BACKFIRE', tone: '#ff6b5c', power: 0 },
  wipe: { status: 'RESETTING', tone: AMBER, power: 1 },
  scratch: { status: 'DIAGNOSING', tone: '#ffb45c', power: 1 },
  idea: { status: 'FIX FOUND!', tone: '#9fe08a', power: 3 },
  flip: { status: 'RECALIBRATE', tone: '#ffb45c', power: 6 },
  fire: { status: '✓ DIRECT HIT', tone: '#9fe08a', power: 10 },
  victory: { status: '✓ PASSED', tone: '#9fe08a', power: 4 },
}

function Holo({ fx, attempt }: { fx: Fx; attempt: number }) {
  const h = HOLO[fx]
  return (
    <g>
      <path d={pixelTextPath('REPULSOR TEST', 532 + DX, 64, 3)} fill={AMBER} opacity={0.9} />
      <path d={pixelTextPath(`ATTEMPT #${String(attempt).padStart(3, '0')}`, 532 + DX, 82, 3)} fill={AMBER} opacity={0.5} />
      <path d={pixelTextPath(h.status, 532 + DX, 104, 3)} fill={h.tone} />
      <path d={pixelTextPath('OUTPUT', 532 + DX, 132, 3)} fill={AMBER} opacity={0.5} />
      {Array.from({ length: 10 }, (_, i) => (
        <rect key={i} x={532 + DX + i * 12} y={148} width={8} height={12} fill={i < h.power ? h.tone : AMBER} opacity={i < h.power ? 0.95 : 0.15} />
      ))}
      <path d={pixelTextPath(`${h.power * 10}%`, 662 + DX, 150, 3)} fill={h.tone} opacity={0.9} />
    </g>
  )
}

/** Blinking status LEDs on the server rack */
function RackLeds() {
  const rows = [98, 126, 154, 182, 210, 238, 266, 294]
  const colors = ['#9fe08a', AMBER, '#9fe08a', '#ff6b5c', '#9fe08a', '#9fe08a', AMBER, '#9fe08a']
  return (
    <g>
      {rows.map((y, i) => (
        <g key={y}>
          <rect
            x={1238}
            y={y + 6}
            width={4}
            height={4}
            fill={colors[i]}
            style={anim(`b-flicker-px ${700 + ((i * 377) % 900)}ms steps(1) ${(i * 130) % 600}ms infinite`)}
          />
          <rect
            x={1246}
            y={y + 6}
            width={4}
            height={4}
            fill="#9fe08a"
            opacity={0.6}
            style={anim(`b-flicker-px ${1100 + ((i * 233) % 700)}ms steps(1) infinite`)}
          />
        </g>
      ))}
    </g>
  )
}

/* ---------- Section ---------- */

export default function Breather() {
  const reduceMotion = useReducedMotion()
  const [{ beat, loop }, setState] = useState({ beat: 0, loop: 0 })
  const [visible, setVisible] = useState(false)
  const [art, setArt] = useState<LabArt | null>(null)
  const ref = useRef<HTMLElement>(null)

  // Build the pixel art once the section is about to come into view; only animate while visible
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const near = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return
        near.disconnect()
        buildLabArt(SOURCES).then(setArt)
      },
      { rootMargin: '600px 0px' },
    )
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.25 })
    near.observe(el)
    io.observe(el)
    return () => {
      near.disconnect()
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!visible || reduceMotion || !art) return
    const t = setTimeout(
      () => setState((s) => (s.beat === BEATS.length - 1 ? { beat: 0, loop: s.loop + 1 } : { beat: s.beat + 1, loop: s.loop })),
      BEATS[beat].ms,
    )
    return () => clearTimeout(t)
  }, [beat, visible, reduceMotion, art])

  const still = !!reduceMotion
  const frame = still ? BEATS.length - 1 : beat
  const { fx } = still ? BEATS[BEATS.length - 1] : BEATS[beat]
  const Effect = EFFECTS[fx]
  const key = `${loop}-${beat}`
  const shake = fx === 'backfire' ? 'b-shake-px 360ms steps(1) both' : fx === 'fire' ? 'b-shake-px-sm 200ms steps(1) 260ms both' : undefined
  const dummyAnim = still ? undefined : fx === 'fire' ? 'b-dummy-hit 1400ms step-end both' : fx === 'victory' ? 'b-dummy-reset 1900ms step-end both' : undefined

  return (
    <section ref={ref} aria-label="Interlude" className="relative isolate mt-16 hidden overflow-hidden py-28 lg:block">
      <PixelWaveBand />
      <div className="mx-auto w-full max-w-[1760px] px-10">
        {/* Centred heading on a small pixel-tile plate that hugs the text */}
        <div className="text-center">
          {/* Framed like the project cards: hard offset shadow, crimson pixel border, solid gaps between tiles */}
          <div className="relative inline-block">
            <div
              aria-hidden="true"
              className="pixel-corners absolute inset-0 translate-x-1.5 translate-y-1.5 bg-accent-900/35 dark:bg-black/60"
              style={vars({ '--px': '6px' })}
            />
            <div className="pixel-corners relative bg-accent-600 p-[2px] dark:bg-accent-400/70" style={vars({ '--px': '6px' })}>
              {/* Uniform pixel stroke (a checker of theme squares) framing a solid crimson plate */}
              <div className="pixel-stroke pixel-corners relative p-2.5" style={vars({ '--px': '3px' })}>
                <div className="relative bg-accent-700 px-6 py-3 dark:bg-accent-900">
                  <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.025em] text-accent-50">
                    Break it. Figure it out. Ship it{' '}
                    <span className="relative ml-1 inline-block">
                      <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-black/40" />
                      <span className="pixel-corners relative inline-block bg-accent-300 px-2.5 pb-0.5 text-accent-800">anyway.</span>
                    </span>
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* In dark mode a thin glowing crimson pixel frame lifts the (dark) scene off the maroon band */}
        <div
          className="pixel-corners mt-8 dark:bg-gradient-to-b dark:from-accent-400/70 dark:via-accent-600/60 dark:to-accent-700/70 dark:p-[3px]"
          style={vars({ '--px': '10px' })}
        >
          <div className="pixel-corners bg-[#141010] shadow-2xl shadow-ink/25" style={vars({ '--px': '8px' })}>
            <svg
              viewBox={VIEW}
            preserveAspectRatio="xMidYMid slice"
              className="block h-[min(420px,calc((100vw-80px)*0.34375))] w-full"
              role="img"
              aria-label="Pixel-art test bay: a tiny Ananthu fires a homemade repulsor glove at a crash-test dummy; it backfires, he scratches his head, flips the glove around, and knocks the dummy back with a direct hit."
            >
              {art && (
                <>
                  <image href={art.backdrop} x={-EXT} width={W + EXT * 2} height={440} style={pixelated} />
                  <Holo fx={fx} attempt={loop + 1} />
                  {!still && <RackLeds />}

                  {/* Target dummy: knockback + scorch frames from one sprite sheet */}
                  <svg x={DUMMY_X} y={DUMMY_Y} width={DUMMY_FW * P} height={DUMMY_FH * P} viewBox={`0 0 ${DUMMY_FW * 2} ${DUMMY_FH * 2}`} overflow="hidden">
                    <image
                      key={`dummy-${key}`}
                      href={art.dummy}
                      width={DUMMY_FW * 2 * 10}
                      height={DUMMY_FH * 2}
                      style={{ ...pixelated, ...(dummyAnim ? anim(dummyAnim) : {}) }}
                    />
                  </svg>

                  {/* Floor reflection of the character */}
                  <g transform={`translate(0 ${2 * FLOOR}) scale(1 -1)`} opacity={0.16}>
                    {art.frames.map((src, i) => (
                      <image key={i} href={src} x={OX} y={OY} width={CW} height={CH} visibility={i === frame ? 'visible' : 'hidden'} style={pixelated} />
                    ))}
                  </g>

                  <g key={shake ? key : 'still'} style={shake ? anim(shake) : undefined}>
                    <rect x={OX + 40} y={FLOOR - 4} width={CW - 80} height={8} fill="#000" opacity={0.4} />
                    {/* All frames stay mounted (preloaded); only the current one shows — stop motion */}
                    {art.frames.map((src, i) => (
                      <image key={i} href={src} x={OX} y={OY} width={CW} height={CH} visibility={i === frame ? 'visible' : 'hidden'} style={pixelated} />
                    ))}
                    {!still && <g key={`fx-${key}`}>{Effect({ art })}</g>}
                  </g>

                  {fx === 'backfire' && !still && (
                    <rect key={`flash-${key}`} x={-EXT} width={W + EXT * 2} height="440" fill="#ff9a4a" style={anim('b-flash 300ms steps(3) both')} />
                  )}
                </>
              )}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
