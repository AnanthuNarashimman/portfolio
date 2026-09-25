/*
 * Pixel-tile mosaic used behind section headings: rows of square tiles shading warm yellow →
 * peach → pink, sprinkled with orange/coral/yellow accent tiles, a few of which twinkle.
 * Colours come from CSS classes (breather.css) so light and dark themes each get their palette.
 */

const COLS = 56
const ROWS = 8
const TILE = 18
const GAP = 4
const PITCH = TILE + GAP
const W = COLS * PITCH - GAP
const H = ROWS * PITCH - GAP

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Tile = { x: number; y: number; cls: string; twinkle?: { accent: string; delay: number; dur: number } }

const TILES: Tile[] = (() => {
  const rand = rng(2024)
  const out: Tile[] = []
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      // Rows blend into the next shade a little, so the gradient reads as stepped pixels, not stripes
      const row = Math.min(ROWS - 1, Math.max(0, r + (rand() < 0.22 ? (rand() < 0.5 ? -1 : 1) : 0)))
      let cls = `m-r${row}`
      const roll = rand()
      // Warmer accents cluster toward the top rows, coral toward the bottom
      if (roll < 0.07) cls = r < ROWS / 2 ? (rand() < 0.5 ? 'm-a0' : 'm-a2') : rand() < 0.6 ? 'm-a1' : 'm-a0'
      const tile: Tile = { x: c * PITCH, y: r * PITCH, cls }
      if (roll > 0.965) tile.twinkle = { accent: rand() < 0.5 ? 'm-a0' : 'm-a1', delay: rand() * 6, dur: 3 + rand() * 4 }
      out.push(tile)
    }
  return out
})()

export default function TextMosaic() {
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      {TILES.map((t, i) => (
        <rect key={i} x={t.x} y={t.y} width={TILE} height={TILE} className={t.cls} />
      ))}
      {TILES.filter((t) => t.twinkle).map((t, i) => (
        <rect
          key={`t${i}`}
          x={t.x}
          y={t.y}
          width={TILE}
          height={TILE}
          className={`${t.twinkle!.accent} mosaic-twinkle`}
          style={{ animationDelay: `${-t.twinkle!.delay}s`, animationDuration: `${t.twinkle!.dur}s` }}
        />
      ))}
    </svg>
  )
}
