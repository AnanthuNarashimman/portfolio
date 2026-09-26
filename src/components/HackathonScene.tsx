import type { SceneKind, TimeOfDay } from '../data/hackathons'

/*
 * Tiny pixel landscapes for the hackathon cards, drawn on a 64×36 grid (one unit = one pixel).
 * Each scene is a sky (by time of day), a landmark layer, and a "lights" layer that stays bright
 * at night (lit windows, the lighthouse lamp, a laptop screen).
 */

type R = [x: number, y: number, w: number, h: number, fill: string]
type Layers = { land: R[]; lights: R[] }

const W = 64
const H = 36

const SKY: Record<TimeOfDay, [string, string, string]> = {
  dawn: ['#f0a07c', '#f6bf98', '#fbdcbc'],
  noon: ['#6fb7e0', '#93cbe9', '#bfe2f2'],
  dusk: ['#4b2458', '#b8433a', '#ee8a48'],
  night: ['#0f0a22', '#1a1338', '#2a1f4d'],
}

// Landmarks darken with the light; the lights layer is exempt
const LAND_FILTER: Record<TimeOfDay, string | undefined> = {
  dawn: 'saturate(0.9) brightness(0.97)',
  noon: undefined,
  dusk: 'brightness(0.8) saturate(1.1)',
  night: 'brightness(0.5) saturate(0.7)',
}

function sky(time: TimeOfDay): R[] {
  const [a, b, c] = SKY[time]
  const out: R[] = [
    [0, 0, W, 10, a],
    [0, 10, W, 9, b],
    [0, 19, W, H - 19, c],
  ]
  if (time === 'dawn') out.push(...sun(12, 17, '#ffe29a'))
  if (time === 'noon') out.push(...sun(54, 6, '#fff3b0'), ...cloud(10, 5), ...cloud(34, 9))
  if (time === 'dusk') out.push(...sun(46, 18, '#ffc35a'))
  if (time === 'night') {
    out.push([54, 3, 3, 1, '#fff4d6'], [53, 4, 3, 3, '#fff4d6'], [54, 7, 3, 1, '#fff4d6'], [55, 4, 2, 3, SKY.night[0]])
    for (const [x, y] of [[6, 3], [15, 7], [23, 2], [31, 6], [40, 3], [47, 9], [12, 12], [60, 11]]) out.push([x, y, 1, 1, '#f3e6c8'])
  }
  return out
}

function sun(x: number, y: number, fill: string): R[] {
  return [
    [x - 1, y - 2, 3, 1, fill],
    [x - 2, y - 1, 5, 3, fill],
    [x - 1, y + 2, 3, 1, fill],
  ]
}

function cloud(x: number, y: number): R[] {
  return [
    [x + 2, y, 4, 1, '#fdfaf4'],
    [x, y + 1, 9, 2, '#fdfaf4'],
    [x + 1, y + 3, 7, 1, '#e3eef4'],
  ]
}

function palm(x: number, base: number): R[] {
  const g = '#3f6f33'
  return [
    [x, base - 8, 1, 8, '#6b4a2e'],
    [x - 1, base - 10, 3, 1, g],
    [x - 3, base - 9, 3, 1, g],
    [x + 1, base - 9, 3, 1, g],
    [x - 4, base - 8, 1, 1, g],
    [x + 4, base - 8, 1, 1, g],
  ]
}

function namakkal(): Layers {
  const land: R[] = [
    [0, 30, W, 6, '#4f7a3a'],
    [0, 30, W, 1, '#6a9a4a'],
  ]
  // Granite hill: a stepped mound, right side in shade, a few light streaks
  for (let y = 12; y < 30; y++) {
    const half = 6 + Math.floor((y - 12) * 1.25)
    land.push([32 - half, y, half * 2, 1, '#8a7c72'], [33, y, half - 1, 1, '#74675e'])
  }
  land.push([24, 18, 4, 1, '#a3968b'], [21, 22, 5, 1, '#a3968b'], [17, 26, 6, 1, '#a3968b'], [38, 21, 3, 1, '#665a52'])
  // Fort wall with crenellations and a gate on the summit
  land.push([24, 9, 16, 4, '#c9a27a'], [24, 12, 16, 1, '#9c7a58'], [31, 10, 2, 3, '#5a3a24'])
  for (let x = 24; x < 40; x += 3) land.push([x, 7, 2, 2, '#c9a27a'])
  // Little temple tower on the slope
  land.push([15, 16, 4, 3, '#d9b48a'], [16, 14, 2, 2, '#d9b48a'], [16, 13, 1, 1, '#d0311e'])
  land.push(...palm(6, 30), ...palm(11, 31), ...palm(54, 31), ...palm(59, 30))
  return { land, lights: [] }
}

function chennai(time: TimeOfDay): Layers {
  const land: R[] = [
    [0, 20, W, 9, '#2f7fb8'],
    [0, 20, W, 1, '#1f6aa0'],
    [0, 28, W, 8, '#e8c889'],
    [0, 28, W, 1, '#fff7ef'],
  ]
  for (const [x, y] of [[4, 22], [16, 24], [30, 22], [40, 26], [8, 26], [56, 23], [24, 27]]) land.push([x, y, 3, 1, '#bfe6f5'])
  for (const [x, y] of [[6, 31], [20, 33], [35, 32], [58, 34]]) land.push([x, y, 2, 1, '#d4b171'])
  // Fishing boat
  land.push([20, 23, 8, 1, '#6b4a2e'], [21, 24, 6, 1, '#4a321f'], [23, 18, 1, 5, '#4a321f'], [24, 19, 3, 3, '#fff7ef'])
  // Beach umbrella
  land.push([10, 26, 7, 1, '#d0311e'], [11, 25, 5, 1, '#d0311e'], [13, 27, 1, 4, '#6b4a2e'])
  // Lighthouse: banded tower, gallery, lamp room
  land.push(
    [47, 30, 6, 2, '#8a7c72'],
    [48, 8, 4, 22, '#fff7ef'],
    [48, 11, 4, 3, '#d0311e'],
    [48, 18, 4, 3, '#d0311e'],
    [48, 25, 4, 3, '#d0311e'],
    [51, 8, 1, 22, '#d9cfc4'],
    [47, 7, 6, 1, '#1c0d0a'],
    [48, 2, 4, 1, '#d0311e'],
    [49, 1, 2, 1, '#d0311e'],
  )
  const lamp = time === 'night' || time === 'dusk' ? '#ffd65a' : '#f6c453'
  const lights: R[] = [[48, 3, 4, 4, lamp]]
  if (time === 'night') {
    // Stepped beam sweeping left
    for (let i = 0; i < 6; i++) lights.push([47 - (i + 1) * 5, 4 - Math.floor(i / 2), 5, 2 + i, 'rgb(255 214 90 / 0.28)'])
  }
  return { land, lights }
}

function delhi(time: TimeOfDay): Layers {
  const stone = '#c98f5a'
  const shade = '#a8703f'
  const light = '#e0ae7c'
  const land: R[] = [
    [0, 30, W, 6, '#5d8a3f'],
    [0, 30, W, 1, '#79a854'],
    [26, 30, 12, 6, '#d8c49a'],
    // The arch
    [22, 10, 20, 20, stone],
    [22, 10, 2, 20, shade],
    [40, 10, 2, 20, shade],
    [24, 11, 16, 1, shade],
    [28, 17, 8, 13, '#4a2a1a'],
    [29, 16, 6, 1, '#4a2a1a'],
    [30, 15, 4, 1, '#4a2a1a'],
    [20, 8, 24, 2, light],
    [24, 5, 16, 3, stone],
    [24, 7, 16, 1, shade],
    [30, 3, 4, 2, stone],
  ]
  for (const x of [8, 14, 50, 56]) land.push([x - 2, 22, 5, 4, '#3f7a3a'], [x - 1, 21, 3, 1, '#3f7a3a'], [x, 26, 1, 4, '#6b4a2e'])
  land.push([18, 22, 1, 8, '#1c0d0a'], [45, 22, 1, 8, '#1c0d0a'])
  const on = time === 'dusk' || time === 'night'
  const lights: R[] = [
    [17, 21, 3, 1, on ? '#ffd65a' : '#8a7c72'],
    [44, 21, 3, 1, on ? '#ffd65a' : '#8a7c72'],
  ]
  if (on) lights.push([31, 27, 2, 3, '#ffb347'], [31, 26, 1, 1, '#ffd65a']) // the eternal flame under the arch
  return { land, lights }
}

function bengaluru(time: TimeOfDay): Layers {
  const land: R[] = []
  const lights: R[] = []
  const lit = time === 'night' || time === 'dusk'
  const blocks: [x: number, w: number, top: number, fill: string][] = [
    [2, 6, 14, '#4a4266'],
    [9, 5, 8, '#3a3350'],
    [15, 7, 16, '#534a73'],
    [23, 4, 4, '#3a3350'],
    [28, 8, 12, '#4a4266'],
    [37, 5, 18, '#3a3350'],
    [43, 7, 10, '#534a73'],
    [51, 5, 15, '#4a4266'],
    [57, 6, 6, '#3a3350'],
  ]
  for (const [x, w, top, fill] of blocks) {
    land.push([x, top, w, 30 - top, fill])
    for (let wy = top + 2; wy < 28; wy += 3) {
      for (let wx = x + 1; wx < x + w - 1; wx += 2) {
        if ((wx * 7 + wy * 3) % 5 === 0) continue
        if (lit && (wx * 3 + wy) % 3 !== 0) lights.push([wx, wy, 1, 1, '#f6c453'])
        else land.push([wx, wy, 1, 1, lit ? '#2a2440' : '#a9c7e0'])
      }
    }
  }
  land.push([24, 1, 1, 3, '#1c0d0a'])
  lights.push([24, 0, 1, 1, '#ff4a36'])
  land.push([0, 30, W, 6, '#3f6a34'], [0, 30, W, 1, '#5a8a48'])
  // Rain trees: Garden City
  for (const x of [8, 31, 55]) {
    land.push(
      [x - 5, 23, 11, 3, '#3f7a3a'],
      [x - 4, 22, 9, 1, '#3f7a3a'],
      [x - 3, 21, 7, 1, '#3f7a3a'],
      [x - 3, 22, 4, 1, '#5a9a48'],
      [x, 26, 1, 4, '#6b4a2e'],
    )
  }
  return { land, lights }
}

function online(): Layers {
  const land: R[] = [
    [6, 28, 52, 2, '#8a5a3a'],
    [6, 30, 52, 6, '#6b4128'],
    // Plant
    [10, 24, 4, 4, '#a8703f'],
    [9, 19, 2, 5, '#3f7a3a'],
    [12, 18, 2, 6, '#3f7a3a'],
    [11, 21, 1, 3, '#5a9a48'],
    // Laptop
    [20, 10, 24, 16, '#1c0d0a'],
    [21, 11, 22, 14, '#241a3a'],
    [16, 26, 32, 2, '#b8b0c0'],
    [16, 27, 32, 1, '#8a8296'],
    // Mug
    [49, 24, 4, 4, '#d0311e'],
    [53, 25, 1, 2, '#d0311e'],
    [50, 21, 1, 2, '#e8e0d8'],
    [51, 20, 1, 1, '#e8e0d8'],
  ]
  const lights: R[] = [
    [23, 13, 6, 1, '#f6c453'],
    [23, 15, 10, 1, '#e98a3f'],
    [25, 17, 8, 1, '#a9c7e0'],
    [25, 19, 5, 1, '#e8584a'],
    [23, 21, 9, 1, '#a9c7e0'],
  ]
  return { land, lights }
}

// Wi-Fi arcs for the online scene, blinking in from the centre
const WIFI: R[][] = [
  [[52, 10, 2, 1, '#f6c453']],
  [[50, 8, 1, 1, '#f6c453'], [51, 7, 4, 1, '#f6c453'], [55, 8, 1, 1, '#f6c453']],
  [[48, 6, 1, 1, '#f6c453'], [49, 5, 1, 1, '#f6c453'], [50, 4, 6, 1, '#f6c453'], [56, 5, 1, 1, '#f6c453'], [57, 6, 1, 1, '#f6c453']],
]

function build(kind: SceneKind, time: TimeOfDay): Layers {
  switch (kind) {
    case 'namakkal':
      return namakkal()
    case 'chennai':
      return chennai(time)
    case 'delhi':
      return delhi(time)
    case 'bengaluru':
      return bengaluru(time)
    case 'online':
      return online()
  }
}

const rects = (list: R[], prefix: string) =>
  list.map(([x, y, w, h, fill], i) => <rect key={`${prefix}${i}`} x={x} y={y} width={w} height={h} fill={fill} />)

export default function HackathonScene({ kind, time, title }: { kind: SceneKind; time: TimeOfDay; title: string }) {
  const { land, lights } = build(kind, time)
  const filter = LAND_FILTER[time]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} shapeRendering="crispEdges" role="img" aria-label={title} className="block h-auto w-full">
      {rects(sky(time), 's')}
      <g style={filter ? { filter } : undefined}>{rects(land, 'l')}</g>
      {rects(lights, 'g')}
      {kind === 'online' && (
        <>
          <rect x={33} y={21} width={1} height={1} fill="#fff7ef" className="hack-blink" />
          {WIFI.map((arc, i) => (
            <g key={i} className="hack-wifi" style={{ animationDelay: `${i * 0.35}s` }}>
              {rects(arc, `w${i}-`)}
            </g>
          ))}
        </>
      )}
    </svg>
  )
}
