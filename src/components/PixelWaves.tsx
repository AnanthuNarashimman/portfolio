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

function Wave({ className }: { className: string }) {
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={`absolute m-5 hidden w-32 text-accent-300 sm:block xl:w-40 2xl:w-48 ${className}`}
    >
      {pixels.map(({ x, y, d }) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={CELL}
          height={CELL}
          rx={2}
          fill="currentColor"
          fillOpacity={Math.max(0.08, 0.7 * (1 - d / GRID))}
          className="pixel-wave"
          style={{ animationDelay: `${d * 0.14}s` }}
        />
      ))}
    </svg>
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
