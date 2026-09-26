// Quarter-circle ripples drawn with square "pixels", mirrored into each corner of the hero card
const GRID = 13
const PITCH = 14
const CELL = 10
const BAND = 3.4 // distance between ripple rings, in cells
const RING = 1.25 // thickness of each ring, in cells

type Pixel = { x: number; y: number; d: number }

const pixels: Pixel[] = []
for (let i = 0; i < GRID; i++) {
  for (let j = 0; j < GRID; j++) {
    const d = Math.hypot(i, j)
    if (d < GRID - 0.5 && d % BAND < RING) pixels.push({ x: i * PITCH, y: j * PITCH, d })
  }
}

const size = GRID * PITCH - (PITCH - CELL)

const corners = [
  'top-0 left-0',
  'top-0 right-0 -scale-x-100',
  'bottom-0 left-0 -scale-y-100',
  'right-0 bottom-0 -scale-100',
]

// Pixels grouped into thin distance bands. Each band is its own <svg> that pulses as a whole, so the
// ripple runs as a GPU opacity animation on a few layers instead of restyling ~50 SVG rects per frame
const BUCKET = BAND / 5.44 // ≈0.625 cells: two bands per ring, so the ripple still travels outward
const bands = Object.values(
  pixels.reduce<Record<number, Pixel[]>>((acc, p) => {
    ;(acc[Math.floor(p.d / BUCKET)] ??= []).push(p)
    return acc
  }, {}),
)

function Wave({ className }: { className: string }) {
  return (
    <div className={`absolute m-5 hidden aspect-square w-32 text-accent-300 sm:block xl:w-40 2xl:w-48 ${className}`}>
      {bands.map((band) => (
        <svg
          key={band[0].d}
          viewBox={`0 0 ${size} ${size}`}
          className="pixel-wave absolute inset-0 size-full"
          style={{ animationDelay: `${Math.floor(band[0].d / BUCKET) * BUCKET * 0.14}s` }}
        >
          {band.map(({ x, y, d }) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={CELL} height={CELL} rx={2} fill="currentColor" fillOpacity={Math.max(0.08, 0.7 * (1 - d / GRID))} />
          ))}
        </svg>
      ))}
    </div>
  )
}

export default function PixelWaves() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {corners.map((c) => (
        <Wave key={c} className={c} />
      ))}
    </div>
  )
}
