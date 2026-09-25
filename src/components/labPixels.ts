/*
 * Pixel-art generator for the interlude's test bay. Everything is drawn on a real pixel grid
 * in plain JS (no image assets), then shown with image-rendering: pixelated at 4 stage units
 * per pixel: the room backdrop, the target dummy's knockback frames, and sprite sheets for the
 * charge orb, explosions, muzzle flash, beam, smoke and glove-flip swirl. The character's
 * hand-drawn frames are downsampled onto the same grid so everything matches.
 */

export const P = 4 // stage units per layout pixel (art is drawn at R× this, see R)
export const GW = 320 // backdrop width in layout pixels (1280 units)
export const GH = 110 // backdrop height in pixels (440 units)

type RGB = [number, number, number]
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => (v + 0.5) / 16))

function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Smooth 2D value noise, 0..1
function noise2(seed: number) {
  const h = (x: number, y: number) => {
    let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 982451653)
    n = Math.imul(n ^ (n >>> 13), 1274126177)
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296
  }
  return (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const fx = x - xi
    const fy = y - yi
    const sx = fx * fx * (3 - 2 * fx)
    const sy = fy * fy * (3 - 2 * fy)
    const a = h(xi, yi) + (h(xi + 1, yi) - h(xi, yi)) * sx
    const b = h(xi, yi + 1) + (h(xi + 1, yi + 1) - h(xi, yi + 1)) * sx
    return a + (b - a) * sy
  }
}

class Canvas {
  w: number
  h: number
  d: Uint8ClampedArray
  constructor(w: number, h: number) {
    this.w = w
    this.h = h
    this.d = new Uint8ClampedArray(w * h * 4)
  }
  set(x: number, y: number, c: RGB, a = 255) {
    x = Math.round(x)
    y = Math.round(y)
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return
    const i = (y * this.w + x) * 4
    this.d[i] = c[0]
    this.d[i + 1] = c[1]
    this.d[i + 2] = c[2]
    this.d[i + 3] = a
  }
  get(x: number, y: number): RGB {
    const i = (y * this.w + x) * 4
    return [this.d[i], this.d[i + 1], this.d[i + 2]]
  }
  alpha(x: number, y: number) {
    return this.d[(y * this.w + x) * 4 + 3]
  }
  rect(x: number, y: number, w: number, h: number, c: RGB) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c)
  }
  line(x0: number, y0: number, x1: number, y1: number, c: RGB) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1)
    for (let k = 0; k <= n; k++) this.set(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, c)
  }
  /** Ordered-dithered blend toward a colour: the pixel-art way to do light and shadow */
  shade(x: number, y: number, amount: number, c: RGB, steps = 3) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || amount <= 0) return
    const t = Math.min(1, Math.floor(amount * steps + BAYER[y & 3][x & 3]) / steps)
    if (t <= 0) return
    const [r, g, b] = this.get(x, y)
    this.set(x, y, [r + (c[0] - r) * t, g + (c[1] - g) * t, b + (c[2] - b) * t], this.alpha(x, y) || 255)
  }
  url() {
    const cv = document.createElement('canvas')
    cv.width = this.w
    cv.height = this.h
    const img = new ImageData(this.w, this.h)
    img.data.set(this.d)
    cv.getContext('2d')!.putImageData(img, 0, 0)
    return cv.toDataURL('image/png')
  }
}

/* ---------- Palette ---------- */
const K = hex('#120d0c')
const WALL_HI = hex('#262020')
const WALL_LO = hex('#171211')
const SEAM = hex('#0c0908')
const SEAM_HI = hex('#322a28')
const STEEL = [hex('#2b2523'), hex('#453c39'), hex('#625753'), hex('#8c807a'), hex('#bdb2ab')]
const LIGHT = hex('#fff1d6')
const WARM = hex('#6a4f44')
const AMBER = hex('#ffc861')
const HAZ = hex('#e0b54a')
const RED = hex('#be1a1a')
const RED_D = hex('#7a1010')
const GOLD = hex('#f7d87f')
const ORANGE = hex('#e98a3f')
const CREAM = hex('#fff7ef')
const WHITE = hex('#fffbe8')
const SMOKE = [hex('#2a201e'), hex('#433531'), hex('#5f4f4a'), hex('#857570')]
const DUMMY = [hex('#6f5d38'), hex('#a8935f'), hex('#d8c58f'), hex('#f0e3b8'), hex('#fbf4dc')]

/* ---------- Pixel font (3×5) ---------- */
// Each glyph: five rows of three cells, top to bottom
const FONT_ROWS: Record<string, string> = {
  "0": '### #.# #.# #.# ###',
  "1": '.#. ##. .#. .#. ###',
  "2": '##. ..# .#. #.. ###',
  "3": '##. ..# .#. ..# ##.',
  "4": '#.# #.# ### ..# ..#',
  "5": '### #.. ##. ..# ##.',
  "6": '.## #.. ### #.# ###',
  "7": '### ..# .#. .#. .#.',
  "8": '### #.# ### #.# ###',
  "9": '### #.# ### ..# ##.',
  "A": '.#. #.# ### #.# #.#',
  "B": '##. #.# ##. #.# ##.',
  "C": '.## #.. #.. #.. .##',
  "D": '##. #.# #.# #.# ##.',
  "E": '### #.. ##. #.. ###',
  "F": '### #.. ##. #.. #..',
  "G": '.## #.. #.# #.# .##',
  "H": '#.# #.# ### #.# #.#',
  "I": '### .#. .#. .#. ###',
  "J": '..# ..# ..# #.# .#.',
  "K": '#.# #.# ##. #.# #.#',
  "L": '#.. #.. #.. #.. ###',
  "M": '#.# ### ### #.# #.#',
  "N": '##. #.# #.# #.# #.#',
  "O": '.#. #.# #.# #.# .#.',
  "P": '##. #.# ##. #.. #..',
  "Q": '.#. #.# #.# ##. .##',
  "R": '##. #.# ##. #.# #.#',
  "S": '.## #.. .#. ..# ##.',
  "T": '### .#. .#. .#. .#.',
  "U": '#.# #.# #.# #.# ###',
  "V": '#.# #.# #.# #.# .#.',
  "W": '#.# #.# ### ### #.#',
  "X": '#.# #.# .#. #.# #.#',
  "Y": '#.# #.# .#. .#. .#.',
  "Z": '### ..# .#. #.. ###',
  " ": '... ... ... ... ...',
  ".": '... ... ... ... .#.',
  "!": '.#. .#. .#. ... .#.',
  "#": '#.# ### #.# ### #.#',
  "?": '##. ..# .#. ... .#.',
  ":": '... .#. ... .#. ...',
  "-": '... ... ### ... ...',
  "%": '#.# ..# .#. #.. #.#',
  "✓": '... ..# ..# #.# .#.',
  "✗": '#.# #.# .#. #.# #.#',
  "…": '... ... ... ... #.#',
}
const FONT: Record<string, string> = Object.fromEntries(Object.entries(FONT_ROWS).map(([k, v]) => [k, v.replace(/ /g, '')]))

/** SVG path of a pixel string: one rect per lit font pixel, size `s` units per pixel */
export function pixelTextPath(text: string, x: number, y: number, s: number, grow = 0) {
  let d = ''
  let cx = x
  for (const ch of text.toUpperCase()) {
    const g = FONT[ch] ?? FONT['?']
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 3; c++)
        if (g[r * 3 + c] === '#') {
          const px = cx + c * s - grow
          const py = y + r * s - grow
          const w = s + grow * 2
          d += `M${px},${py}h${w}v${w}h${-w}z`
        }
    cx += s * 4
  }
  return d
}
export const pixelTextWidth = (text: string, s: number) => text.length * s * 4 - s

/* ---------- Backdrop ---------- */
/** Art pixels are drawn at R× the layout grid, so one on-screen pixel is P/R stage units (finer, less blocky) */
export const R = 2

export function drawBackdrop() {
  const c = new Canvas(GW * R, GH * R)
  const HZ = 88 // horizon row (352 units)
  const DX = 35 // bench/backstop/dummy layout offset in the wider stage

  // Helpers in layout-grid coordinates; fractional sizes give half-size (fine) details
  const rect = (x: number, y: number, w: number, h: number, col: RGB) =>
    c.rect(Math.round(x * R), Math.round(y * R), Math.max(1, Math.round(w * R)), Math.max(1, Math.round(h * R)), col)
  const dot = (x: number, y: number, col: RGB) => c.set(Math.round(x * R), Math.round(y * R), col)
  const line = (x0: number, y0: number, x1: number, y1: number, col: RGB) => c.line(x0 * R, y0 * R, x1 * R, y1 * R, col)
  const area = (x0: number, y0: number, x1: number, y1: number, f: (fx: number, fy: number, lx: number, ly: number) => void) => {
    for (let fy = Math.max(0, Math.floor(y0 * R)); fy < Math.min(c.h, Math.ceil(y1 * R)); fy++)
      for (let fx = Math.max(0, Math.floor(x0 * R)); fx < Math.min(c.w, Math.ceil(x1 * R)); fx++) f(fx, fy, fx / R, fy / R)
  }
  const stencil = (text: string, x: number, y: number, s: number, col: RGB) => {
    let cx = x
    for (const ch of text) {
      const g = FONT[ch] ?? FONT[' ']
      for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) if (g[r * 3 + q] === '#') rect(cx + q * s, y + r * s, s, s, col)
      cx += s * 4
    }
  }

  // Wall: two tones dithered top→bottom, darker lower band, ceiling rail, panel seams
  area(0, 0, GW, HZ, (fx, fy, _lx, ly) => {
    c.set(fx, fy, WALL_LO)
    c.shade(fx, fy, 0.35 + (ly / HZ) * 0.5, WALL_HI, 5)
  })
  area(0, 65, GW, HZ, (fx, fy) => c.shade(fx, fy, 0.5, SEAM, 4))
  rect(0, 0, GW, 4, SEAM)
  rect(0, 4, GW, 0.5, SEAM_HI)
  for (let x = 16; x < GW; x += 32) {
    rect(x, 5, 0.5, HZ - 5, SEAM)
    rect(x + 0.5, 5, 0.5, HZ - 5, SEAM_HI)
  }
  rect(0, 65, GW, 0.5, SEAM_HI)
  rect(0, 65.5, GW, 0.5, SEAM)

  // Warm backlight on the wall behind the character (keeps dark hair readable)
  area(DX, 5, DX + 170, HZ, (fx, fy, lx, ly) => {
    const d = Math.hypot((lx - 80 - DX) / 72, (ly - 56) / 52)
    if (d < 1) c.shade(fx, fy, (1 - d) ** 1.4 * 0.9, WARM, 5)
  })
  stencil('TEST BAY 01', DX + 22, 17, 2, hex('#2e2624'))
  stencil('REPULSOR CALIBRATION', DX + 22, 30, 1, hex('#2b2321'))

  // Armor display pod (far left): lit glass capsule with a suit inside
  rect(7, 17, 36, 68, hex('#0d0a09'))
  area(8, 18, 42, 84, (fx, fy, _lx, ly) => c.shade(fx, fy, ((ly - 18) / 66) * 0.45, hex('#5a2a1a'), 5))
  area(8, 18, 42, 84, (fx, fy, lx, ly) => {
    const d = Math.hypot((lx - 25) / 14, (ly - 50) / 30)
    if (d < 1) c.shade(fx, fy, (1 - d) * 0.35, WARM, 5)
  })
  // Armor suit: built from individually shaded plates on the fine grid. Where two plates meet
  // a dark seam is drawn automatically, and the side facing the pod light gets a rim highlight.
  {
    const X0 = 12
    const Y0 = 21
    const fw = Math.ceil((38 - X0) * R)
    const fh = Math.ceil((84 - Y0) * R)
    const ids = new Int16Array(fw * fh).fill(-1)
    const cols: RGB[] = new Array(fw * fh)
    const glow = new Set<number>()
    type Pal = [RGB, RGB, RGB, RGB]
    const REDP: Pal = [hex('#5e0a0e'), hex('#a3141a'), hex('#d22e34'), hex('#ff7a6e')]
    const GOLDP: Pal = [hex('#8a6424'), hex('#c99a3e'), hex('#f0c863'), hex('#fff0b8')]
    const JOINT: Pal = [hex('#2f2a28'), hex('#56504c'), hex('#8a827d'), hex('#c9c0b9')]
    let pid = 0
    // A plate: every fine pixel inside `inside` gets shaded across the plate's width (light from the right)
    const plate = (inside: (x: number, y: number) => boolean, cx: number, half: number, pal: Pal | RGB, isGlow = false) => {
      const id = pid++
      if (isGlow) glow.add(id)
      for (let fy = 0; fy < fh; fy++)
        for (let fx = 0; fx < fw; fx++) {
          const lx = X0 + (fx + 0.5) / R
          const ly = Y0 + (fy + 0.5) / R
          if (!inside(lx, ly)) continue
          const i = fy * fw + fx
          ids[i] = id
          if (pal.length === 3 && typeof pal[0] === 'number') {
            cols[i] = pal as RGB
          } else {
            const p = pal as Pal
            const v = (lx - cx) / half
            cols[i] = v < -0.45 ? p[0] : v > 0.78 ? p[3] : v > 0.35 ? p[2] : p[1]
          }
        }
    }
    const ell = (cx: number, cy: number, rx: number, ry: number) => (x: number, y: number) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1
    const band = (y0: number, y1: number, cx: number, half: (y: number) => number) => (x: number, y: number) => y >= y0 && y < y1 && Math.abs(x - cx) <= half(y)

    // Aura: a warm glow behind the suit and a light ring at its feet
    area(8, 18, 42, 84, (fx, fy, lx, ly) => {
      const d = Math.hypot((lx - 25) / 15, (ly - 47) / 30)
      if (d < 1) c.shade(fx, fy, (1 - d) ** 1.2 * 0.75, hex('#b0421c'), 5)
      const r = Math.hypot((lx - 25) / 12, (ly - 83) / 2.2)
      if (r < 1) c.shade(fx, fy, (1 - r) * 0.9, AMBER, 5)
    })

    // Head: helmet shell, gold faceplate, glowing eye slits, neck
    const helmet = ell(25, 27.2, 4.6, 5.2)
    plate(helmet, 25, 4.6, REDP)
    plate((x, y) => helmet(x, y) && y >= 24.8 && Math.abs(x - 25) <= 3.4 - Math.max(0, y - 29.4) * 0.75, 25, 3.4, GOLDP)
    plate((x, y) => y >= 26.6 && y < 27.6 && ((x >= 22.2 && x <= 24.2) || (x >= 25.8 && x <= 27.8)), 25, 3, WHITE, true)
    plate(band(31.8, 34, 25, () => 2.3), 25, 2.3, JOINT)

    // Torso: broad pauldrons, V-taper chest, pec plates, arc reactor, gold abs, belt + buckle
    for (const s of [-1, 1]) plate(ell(25 + s * 9.4, 36.4, 4.3, 3.4), 25 + s * 9.4, 4.3, REDP)
    plate((x, y) => y >= 33.4 && y < 45.2 && Math.abs(x - 25) <= (y < 35 ? 8.8 - (35 - y) * 1.6 : 8.8 - Math.max(0, y - 39) * 0.5), 25, 8.8, REDP)
    for (const s of [-1, 1]) plate(ell(25 + s * 3.7, 38.4, 3.4, 2.5), 25 + s * 3.7, 3.4, REDP)
    plate(ell(25, 40.4, 2.8, 2.8), 25, 2.8, JOINT)
    plate(ell(25, 40.4, 1.9, 1.9), 25, 1.9, CREAM, true)
    plate(ell(25, 40.4, 1.1, 1.1), 25, 1.1, WHITE, true)
    for (const [y0, y1] of [[45.2, 47], [47, 48.8], [48.8, 50.6]]) plate(band(y0, y1, 25, (y) => 5.8 - (y - 45.2) * 0.15), 25, 5.8, GOLDP)
    plate(band(50.6, 53.2, 25, () => 6.4), 25, 6.4, REDP)
    plate(band(51, 52.8, 25, () => 1.1), 25, 1.1, GOLDP)

    // Arms: bicep, elbow joint, forearm, gold gauntlet cuff, fist with a glowing palm repulsor
    for (const s of [-1, 1]) {
      const ax = (y: number) => 25 + s * (12.6 + (y - 39) * 0.05)
      const seg = (y0: number, y1: number, half: (y: number) => number, pal: Pal | RGB, isGlow = false) =>
        plate((x, y) => y >= y0 && y < y1 && Math.abs(x - ax(y)) <= half(y), ax((y0 + y1) / 2), half((y0 + y1) / 2), pal, isGlow)
      seg(38.6, 46.2, (y) => 2.7 + Math.sin(((y - 38.6) / 7.6) * Math.PI) * 0.35, REDP)
      seg(46.2, 47.8, () => 2.1, JOINT)
      seg(47.8, 51.8, (y) => 2.8 - (y - 47.8) * 0.05, REDP)
      seg(51.8, 53.6, () => 3, GOLDP)
      plate(ell(ax(55.4), 55.4, 2.6, 2.1), ax(55.4), 2.6, REDP)
      seg(55, 55.9, () => 0.6, WHITE, true)
    }

    // Legs (wide stance): thigh with gold outer panel, kneecap, shin with guard, ankle ring, boot, sole
    for (const s of [-1, 1]) {
      const lx = (y: number) => 25 + s * (3.4 + (y - 53) * 0.07)
      const leg = (y0: number, y1: number, half: (y: number) => number, pal: Pal | RGB) =>
        plate((x, y) => y >= y0 && y < y1 && Math.abs(x - lx(y)) <= half(y), lx((y0 + y1) / 2), half((y0 + y1) / 2), pal)
      leg(53.2, 64.6, (y) => 3.1 - (y - 53.2) * 0.04, REDP)
      plate((x, y) => y >= 54.6 && y < 63 && s * (x - lx(y)) >= 1.5 && s * (x - lx(y)) <= 2.9, lx(59), 3, GOLDP)
      plate(ell(lx(65.8), 65.8, 2.6, 1.4), lx(65.8), 2.6, GOLDP)
      leg(67.2, 77.4, (y) => 2.5 - (y - 67.2) * 0.02, REDP)
      leg(68.4, 75.8, () => 0.8, GOLDP)
      leg(77.4, 78.6, () => 2.6, GOLDP)
      leg(78.6, 82.6, (y) => 2.7 + (y - 78.6) * 0.15, REDP)
      leg(82.6, 83.4, () => 3.4, hex('#2a0608'))
    }

    // Compose: seams where plates meet, rim light on the lit (right) silhouette edge
    const SEAM_C = hex('#240506')
    const RIM = hex('#ffb08a')
    for (let fy = 0; fy < fh; fy++)
      for (let fx = 0; fx < fw; fx++) {
        const i = fy * fw + fx
        const id = ids[i]
        if (id < 0) continue
        let col = cols[i]
        const nb = (dx: number, dy: number) => {
          const x = fx + dx
          const y = fy + dy
          return x < 0 || y < 0 || x >= fw || y >= fh ? -1 : ids[y * fw + x]
        }
        if (!glow.has(id)) {
          const right = nb(1, 0)
          const down = nb(0, 1)
          const seamRight = right >= 0 && right < id && !glow.has(right)
          const seamDown = down >= 0 && down !== id && !glow.has(down) && down < id
          if (seamRight || seamDown) col = SEAM_C
          else if (right === -1) col = [col[0] + (RIM[0] - col[0]) * 0.45, col[1] + (RIM[1] - col[1]) * 0.45, col[2] + (RIM[2] - col[2]) * 0.45]
          else if (nb(-1, 0) === -1) col = [col[0] * 0.7, col[1] * 0.7, col[2] * 0.7]
        }
        c.set(Math.round(X0 * R) + fx, Math.round(Y0 * R) + fy, col)
      }
    // Soft glow spill from the arc reactor and palms onto the dark pod
    area(17, 33, 33, 48, (fx, fy, lx, ly) => {
      const d = Math.hypot(lx - 25, ly - 40.4)
      if (d > 2.8 && d < 7 && ids[(fy - Math.round(Y0 * R)) * fw + (fx - Math.round(X0 * R))] < 0) c.shade(fx, fy, (7 - d) / 7, AMBER, 4)
    })
  }
  // Glass: frame, top cap, base with light strip
  rect(6, 14, 38, 3, STEEL[2])
  rect(6, 14, 38, 0.5, STEEL[4])
  rect(7, 17, 0.5, 67, STEEL[3])
  rect(42.5, 17, 0.5, 67, STEEL[2])
  rect(5, 84, 40, 4, STEEL[1])
  rect(5, 84, 40, 0.5, STEEL[3])
  rect(8, 83.5, 34, 0.5, AMBER)

  // Blast backstop: riveted steel plates, old scorch, dents, hazard band
  const bx = 186 + DX
  const bw = 61
  area(bx, 18, bx + bw, HZ, (fx, fy, lx) => {
    c.set(fx, fy, STEEL[0])
    c.shade(fx, fy, 0.45 - ((lx - bx) / bw) * 0.3, STEEL[1], 4)
  })
  rect(bx, 18, bw, 0.5, STEEL[3])
  rect(bx - 0.5, 18, 0.5, HZ - 18, K)
  rect(bx + bw, 18, 0.5, HZ - 18, K)
  for (const sy of [37, 56, 74]) {
    rect(bx, sy, bw, 0.5, K)
    rect(bx, sy + 0.5, bw, 0.5, STEEL[2])
  }
  for (const ry of [21, 34, 53, 71])
    for (let x = bx + 3; x < bx + bw - 2; x += 6) {
      dot(x, ry, STEEL[4])
      dot(x + 0.5, ry + 0.5, K)
    }
  const n1 = noise2(3)
  for (const [sx, sy, rx, ry, k] of [[217 + DX, 54, 17, 14, 1], [197 + DX, 31, 8, 6, 0.8], [237 + DX, 72, 7, 5, 0.8]] as const)
    area(sx - rx, sy - ry, sx + rx, sy + ry, (fx, fy, lx, ly) => {
      const d = Math.hypot((lx - sx) / rx, (ly - sy) / ry)
      if (d < 1) c.shade(fx, fy, ((1 - d) * 1.1 + (n1(lx * 0.4, ly * 0.4) - 0.5) * 0.5) * k, K, 4)
    })
  for (const [x, y] of [[203 + DX, 43], [226 + DX, 63], [232 + DX, 32], [215 + DX, 72]]) {
    rect(x, y, 1.5, 1.5, K)
    dot(x, y, STEEL[3])
  }
  area(bx, 83, bx + bw, HZ, (fx, fy, lx, ly) => c.set(fx, fy, Math.floor((lx + ly) / 3) % 2 ? HAZ : K))

  // Server rack (far right)
  const rx0 = 290
  rect(rx0, 20, 26, HZ - 20, STEEL[0])
  rect(rx0, 20, 26, 0.5, STEEL[3])
  rect(rx0 - 0.5, 20, 0.5, HZ - 20, K)
  rect(rx0 + 26, 20, 0.5, HZ - 20, K)
  for (let y = 24; y < HZ - 6; y += 7) {
    rect(rx0 + 2, y, 22, 5, hex('#1b1716'))
    rect(rx0 + 2, y, 22, 0.5, STEEL[1])
    for (let x = rx0 + 4; x < rx0 + 17; x += 1.5) rect(x, y + 1.5, 0.5, 2.5, hex('#0f0c0b'))
  }
  rect(rx0 + 1, HZ - 4, 24, 4, STEEL[1])

  // Workbench with vise, spare gauntlet, wrench, lamp and holo emitter
  const b = DX
  rect(122 + b, 71, 59, 3, STEEL[2])
  rect(122 + b, 71, 59, 0.5, STEEL[4])
  rect(122 + b, 74, 59, 0.5, K)
  for (const lx of [125 + b, 176 + b]) {
    rect(lx, 74.5, 2, 15.5, STEEL[1])
    rect(lx, 74.5, 0.5, 15.5, STEEL[3])
  }
  rect(126 + b, 85, 51, 1, STEEL[0])
  rect(125 + b, 66, 9, 5, hex('#3d4a55'))
  rect(125 + b, 66, 9, 0.5, hex('#5b6a76'))
  rect(124 + b, 64, 11, 2, hex('#6a7884'))
  rect(124 + b, 64, 11, 0.5, hex('#9aa6b0'))
  rect(134 + b, 67, 4, 1, hex('#9aa3aa'))
  rect(141 + b, 67, 12, 4, RED)
  rect(141 + b, 67, 12, 0.5, hex('#e0403a'))
  rect(144 + b, 67, 1, 4, HAZ)
  rect(148 + b, 67, 1, 4, HAZ)
  rect(153 + b, 66, 4, 5, RED_D)
  rect(154 + b, 67.5, 2, 2, CREAM)
  line(158 + b, 70, 165 + b, 69, STEEL[3])
  rect(165.5 + b, 67.5, 1, 1, STEEL[3])
  rect(165.5 + b, 69.5, 1, 1, STEEL[3])
  rect(149 + b, 69, 8, 2, STEEL[2])
  rect(151 + b, 68, 4, 1, AMBER)
  line(175 + b, 70, 173 + b, 60, STEEL[1])
  line(173 + b, 60, 167 + b, 57, STEEL[1])
  rect(163 + b, 55, 6, 3, STEEL[3])
  rect(163 + b, 57.5, 6, 0.5, LIGHT)
  area(158 + b, 58, 176 + b, 71, (fx, fy, lx, ly) => {
    const w = (ly - 58) * 0.7 + 2
    if (Math.abs(lx - 166 - b) < w) c.shade(fx, fy, 0.35 - (ly - 58) * 0.015, LIGHT, 4)
  })

  // Holo readout frame + projection cone (the text is drawn live on top)
  area(128 + b, 45, 178 + b, 69, (fx, fy, lx, ly) => {
    const t = (ly - 45) / 24
    const half = 21 - t * 17
    if (Math.abs(lx - 153 - b) <= half) c.shade(fx, fy, 0.28 - t * 0.12, AMBER, 5)
  })
  area(130 + b, 14, 177 + b, 45, (fx, fy) => c.shade(fx, fy, fy % 2 ? 0.1 : 0.2, AMBER, 5))
  rect(130 + b, 14, 47, 0.5, AMBER)
  rect(130 + b, 44.5, 47, 0.5, AMBER)
  rect(130 + b, 14, 0.5, 31, AMBER)
  rect(176.5 + b, 14, 0.5, 31, AMBER)
  for (const [x, y, dx, dy] of [[130, 14, 1, 1], [176.5, 14, -1, 1], [176.5, 44.5, -1, -1], [130, 44.5, 1, -1]]) {
    rect(Math.min(x, x + dx * 3) + b, y, 3.5, 1, AMBER)
    rect(x + b, Math.min(y, y + dy * 3), 1, 3.5, AMBER)
  }

  // Floor: dithered concrete, perspective seams
  area(0, HZ, GW, GH, (fx, fy, _lx, ly) => {
    c.set(fx, fy, hex('#141010'))
    c.shade(fx, fy, 1 - (ly - HZ) / (GH - HZ), hex('#2c2321'), 5)
  })
  rect(0, HZ, GW, 0.5, SEAM_HI)
  const vx = 160
  for (const bxs of [-230, -130, -45, 30, 100, 175, 255, 340, 440, 540]) line(vx + (bxs - vx) * 0.35, HZ + 0.5, bxs, GH, SEAM)
  rect(0, 95, GW, 0.5, SEAM)

  // Cables snaking out of the armor pod's base across the floor (drawn after the floor so they sit on it)
  const cable = (p: number[][], col: RGB, hi: RGB, w = 1.2) => {
    const [a, b1, b2, d] = p
    for (let k = 0; k <= 160; k++) {
      const t = k / 160
      const u = 1 - t
      const x = u * u * u * a[0] + 3 * u * u * t * b1[0] + 3 * u * t * t * b2[0] + t * t * t * d[0]
      const y = u * u * u * a[1] + 3 * u * u * t * b1[1] + 3 * u * t * t * b2[1] + t * t * t * d[1]
      rect(x - w / 2, y - w / 2 + 0.5, w, w, SEAM) // contact shadow
      rect(x - w / 2, y - w / 2, w, w, col)
      rect(x - w / 4, y - w / 2, w / 2, 0.5, hi)
    }
  }
  const RUBBER = hex('#2e2624')
  const RUBBER_HI = hex('#7a6d67')
  cable([[41, 86.6], [52, 88], [55, 95], [70, 94]], RUBBER, RUBBER_HI, 2.2)
  cable([[70, 94], [80, 93.5], [84, 90], [96, 89]], RUBBER, RUBBER_HI, 2.2)
  cable([[37, 87.6], [44, 99], [58, 104], [74, 108]], hex('#8a1014'), hex('#e0403a'), 1.8)
  cable([[74, 108], [82, 110.5], [90, 110], [96, 111]], hex('#8a1014'), hex('#e0403a'), 1.8)
  cable([[30, 87.8], [31, 96], [20, 99], [12, 104]], RUBBER, RUBBER_HI, 1.6)
  cable([[12, 104], [6, 107], [2, 105], [-2, 108]], RUBBER, RUBBER_HI, 1.6)
  cable([[11, 87.6], [8, 92], [3, 92], [-2, 94]], hex('#6a5a22'), hex('#e0b54a'), 1.3)
  // Connector plug where the black cable meets the wall + a coiled slack loop
  rect(95.5, 87.4, 2.5, 2.2, STEEL[2])
  rect(95.5, 87.4, 2.5, 0.5, STEEL[4])
  rect(97.5, 88, 0.6, 1, AMBER)
  area(58, 98, 68, 104, (fx, fy, lx, ly) => {
    const r = Math.hypot((lx - 63) / 4.2, (ly - 101) / 2.2)
    if (r > 0.6 && r < 1) c.set(fx, fy, r > 0.9 ? RUBBER_HI : RUBBER)
  })

  // Spotlights: fixtures, dithered volumetric cones, floor pools
  // The pod light stops at the pod roof (its glass lights the suit from inside instead)
  for (const [sx, spread, coneEnd] of [[82 + DX, 40, GH], [215 + DX, 34, GH], [25, 22, 14]] as const) {
    area(sx - spread - 6, 7, sx + spread + 6, coneEnd, (fx, fy, lx, ly) => {
      const t = (ly - 7) / (GH - 7)
      const half = 5 + t * spread
      const u = Math.abs(lx - sx) / half
      if (u < 1) c.shade(fx, fy, 0.2 * (1 - t * 0.6) * (1 - u * u), LIGHT, 5)
    })
    area(sx - spread - 6, HZ, sx + spread + 6, GH, (fx, fy, lx, ly) => {
      const d = Math.hypot((lx - sx) / (spread + 6), (ly - 100) / 9)
      if (d < 1) c.shade(fx, fy, (1 - d) * 0.35, LIGHT, 5)
    })
    rect(sx - 8, 3, 16, 3, STEEL[2])
    rect(sx - 8, 3, 16, 0.5, STEEL[3])
    rect(sx - 6, 6, 12, 0.5, LIGHT)
  }
  return c.url()
}

/* ---------- Target dummy: clean + scorched knockback frames ---------- */
export const DUMMY_FW = 48
export const DUMMY_FH = 76
export const DUMMY_PIVOT: [number, number] = [24, 72] // base centre inside a frame
export const DUMMY_ANGLES = [0, 0, 7, 13, 9, -5, -3, 3, 1, -1] // frame 0 clean, 1+ scorched

function drawDummy(scorched: boolean) {
  const c = new Canvas(DUMMY_FW, DUMMY_FH)
  const cx = 24
  // Rounded vinyl shading across a span: dark rim → lit front → dark rim
  const shadeSpan = (y: number, x0: number, x1: number, pal: RGB[]) => {
    for (let x = x0; x <= x1; x++) {
      const u = (x - x0) / Math.max(1, x1 - x0)
      c.set(x, y, pal[u < 0.18 ? 1 : u < 0.42 ? 3 : u < 0.6 ? 4 : u < 0.82 ? 2 : 1])
    }
    c.set(x0 - 1, y, K)
    c.set(x1 + 1, y, K)
  }
  // Weighted base + chrome pole
  c.rect(cx - 11, 72, 23, 2, STEEL[0])
  c.rect(cx - 12, 71, 25, 1, K)
  c.rect(cx - 10, 70, 21, 1, STEEL[3])
  c.rect(cx - 11, 74, 23, 1, K)
  for (let y = 48; y < 70; y++) {
    c.set(cx - 1, y, STEEL[1])
    c.set(cx, y, STEEL[4])
    c.set(cx + 1, y, STEEL[2])
  }
  c.rect(cx - 3, 46, 7, 2, STEEL[3])
  c.rect(cx - 3, 45, 7, 1, K)
  // Pelvis block
  for (let y = 39; y < 45; y++) shadeSpan(y, cx - 6 + (y > 42 ? 1 : 0), cx + 6 - (y > 42 ? 1 : 0), DUMMY)
  c.rect(cx - 6, 45, 13, 1, K)
  // Arms: upper + forearm with a darker elbow joint, hanging slightly out
  for (const side of [-1, 1]) {
    for (let y = 17; y < 40; y++) {
      const out = side * (10 + Math.round((y - 17) * 0.12))
      const x0 = Math.min(cx + out, cx + out + side * 3)
      shadeSpan(y, x0, x0 + 2, y >= 28 && y <= 29 ? [K, DUMMY[0], DUMMY[0], DUMMY[1], DUMMY[1]] : DUMMY)
    }
    const hx = cx + side * (13 + 1)
    c.rect(Math.min(hx, hx + side * 2) - 1, 40, 4, 3, DUMMY[2])
    c.rect(Math.min(hx, hx + side * 2) - 1, 43, 4, 1, K)
  }
  // Chest: broad shoulders tapering to the waist
  for (let y = 15; y < 39; y++) {
    const half = y < 17 ? 6 + (y - 15) * 2 : y < 30 ? 9 : 9 - Math.round((y - 30) * 0.45)
    shadeSpan(y, cx - half, cx + half, DUMMY)
  }
  c.rect(cx - 5, 14, 11, 1, K)
  // Rib line + centre seam
  c.line(cx - 7, 31, cx + 7, 31, DUMMY[1])
  for (let y = 17; y < 38; y += 2) c.set(cx, y, DUMMY[1])
  // Chest quadrant decal
  for (let y = -3; y <= 3; y++) for (let x = -3; x <= 3; x++) {
    const d = Math.hypot(x, y)
    if (d <= 3.4) c.set(cx - 4 + x, 23 + y, d > 2.6 ? K : (x >= 0) === (y >= 0) ? HAZ : K)
  }
  // Neck + head
  c.rect(cx - 2, 11, 5, 3, STEEL[2])
  c.set(cx - 2, 11, STEEL[3])
  for (let y = -6; y <= 6; y++) for (let x = -5; x <= 5; x++) {
    const d = Math.hypot(x / 5.4, y / 6.4)
    if (d <= 1) {
      const l = Math.hypot(x + 2, y + 2.5)
      c.set(cx + x, 4 + y, d > 0.86 ? K : l < 2.5 ? DUMMY[4] : l < 5 ? DUMMY[3] : l < 7.5 ? DUMMY[2] : DUMMY[1])
    }
  }
  for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (Math.hypot(x, y) <= 2.2) c.set(cx + 2 + x, 4 + y, (x >= 0) === (y >= 0) ? HAZ : K)

  if (scorched) {
    const n = noise2(9)
    for (let y = 15; y < 32; y++) for (let x = cx - 11; x <= cx + 1; x++) {
      if (!c.alpha(x, y)) continue
      const d = Math.hypot((x - (cx - 7)) / 6.5, (y - 23) / 7)
      if (d < 1) c.shade(x, y, (1 - d) * 1.3 + (n(x * 0.6, y * 0.6) - 0.5) * 0.6, K, 3)
    }
    c.set(cx - 8, 22, ORANGE)
    c.set(cx - 6, 25, RED)
    c.set(cx - 9, 25, ORANGE)
  }
  return c
}

/** Nearest-neighbour rotation around the dummy's base, keeping hard pixel edges */
function rotated(src: Canvas, deg: number) {
  const out = new Canvas(src.w, src.h)
  const a = (-deg * Math.PI) / 180
  const [px, py] = DUMMY_PIVOT
  for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) {
    const dx = x - px
    const dy = y - py
    const sx = Math.round(px + dx * Math.cos(a) - dy * Math.sin(a))
    const sy = Math.round(py + dx * Math.sin(a) + dy * Math.cos(a))
    if (sx < 0 || sy < 0 || sx >= src.w || sy >= src.h) continue
    const i = (sy * src.w + sx) * 4
    if (src.d[i + 3]) out.set(x, y, [src.d[i], src.d[i + 1], src.d[i + 2]])
  }
  return out
}

/** Scale2x (EPX): doubles resolution while rounding off stair-step diagonals, keeping hard edges */
function epx(src: Canvas) {
  const out = new Canvas(src.w * 2, src.h * 2)
  const key = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= src.w || y >= src.h) return -1
    const i = (y * src.w + x) * 4
    return src.d[i + 3] ? (src.d[i] << 16) | (src.d[i + 1] << 8) | src.d[i + 2] : -2
  }
  const put = (x: number, y: number, v: number) => {
    if (v >= 0) out.set(x, y, [(v >> 16) & 255, (v >> 8) & 255, v & 255])
  }
  for (let y = 0; y < src.h; y++)
    for (let x = 0; x < src.w; x++) {
      const p = key(x, y)
      const a = key(x, y - 1)
      const b = key(x + 1, y)
      const c = key(x - 1, y)
      const d = key(x, y + 1)
      let o1 = p
      let o2 = p
      let o3 = p
      let o4 = p
      if (c === a && c !== d && a !== b && a !== -1) o1 = a
      if (a === b && a !== c && b !== d && b !== -1) o2 = b
      if (d === c && d !== b && c !== a && c !== -1) o3 = c
      if (b === d && b !== a && d !== c && d !== -1) o4 = d
      put(x * 2, y * 2, o1)
      put(x * 2 + 1, y * 2, o2)
      put(x * 2, y * 2 + 1, o3)
      put(x * 2 + 1, y * 2 + 1, o4)
    }
  return out
}

function sheet(input: Canvas[]) {
  const frames = input.map(epx)
  const w = frames[0].w
  const out = new Canvas(w * frames.length, frames[0].h)
  frames.forEach((f, k) => {
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
      const i = (y * f.w + x) * 4
      if (f.d[i + 3]) out.set(k * w + x, y, [f.d[i], f.d[i + 1], f.d[i + 2]], f.d[i + 3])
    }
  })
  return out.url()
}

export function drawDummySheet() {
  const clean = drawDummy(false)
  const burnt = drawDummy(true)
  return sheet(DUMMY_ANGLES.map((deg, i) => (i === 0 ? clean : rotated(burnt, deg))))
}

/* ---------- Effect sprite sheets ---------- */

/** Classic pixel explosion: hot core → gold → orange → red → rolling smoke ring */
function explosion(size: number, frames: number, seed: number, smokeHeavy: number) {
  const n = noise2(seed)
  const out: Canvas[] = []
  const r0 = size / 2
  for (let f = 0; f < frames; f++) {
    const t = f / (frames - 1)
    const c = new Canvas(size, size)
    const radius = 0.3 + 0.7 * Math.sqrt(t)
    const heat = 1.35 - t * 1.25
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = (x + 0.5 - r0) / r0
      const dy = (y + 0.5 - r0) / r0
      const d = Math.hypot(dx, dy)
      const nz = n(x * 0.22 + f * 1.7, y * 0.22 - f * 1.1) * 0.65 + n(x * 0.5, y * 0.5 + f) * 0.35
      let v = (1 - d / radius) + (nz - 0.5) * 0.9
      if (v <= 0) continue
      const hollow = t > 0.45 && d < (t - 0.45) * 1.4 * radius
      const I = v * heat
      let col: RGB | null = null
      if (hollow || I < 0.2) col = v > 0.35 ? SMOKE[1 + (nz > 0.55 ? 1 : 0)] : v > 0.15 + (1 - smokeHeavy) * 0.2 ? SMOKE[0] : null
      else if (I > 1) col = WHITE
      else if (I > 0.78) col = CREAM
      else if (I > 0.6) col = GOLD
      else if (I > 0.44) col = ORANGE
      else if (I > 0.3) col = RED
      else col = RED_D
      if (col && !(t > 0.85 && BAYER[y & 3][x & 3] < (t - 0.85) * 6)) c.set(x, y, col)
      v = 0
    }
    out.push(c)
  }
  return sheet(out)
}

function chargeOrb() {
  const out: Canvas[] = []
  for (let f = 0; f < 4; f++) {
    const c = new Canvas(20, 20)
    const r = 5 + (f % 2)
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
      const d = Math.hypot(x - 9.5, y - 9.5)
      if (d < r - 2.5) c.set(x, y, WHITE)
      else if (d < r - 1) c.set(x, y, CREAM)
      else if (d < r) c.set(x, y, GOLD)
      else if (d < r + 1.5 && BAYER[y & 3][x & 3] > 0.45) c.set(x, y, ORANGE)
    }
    const len = 3 + (f % 2) * 2
    const dirs = f % 2 ? [[1, 1], [-1, 1], [1, -1], [-1, -1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]]
    for (const [dx, dy] of dirs) for (let k = 0; k < len; k++) c.set(9.5 + dx * (r + 1 + k), 9.5 + dy * (r + 1 + k), k < 2 ? GOLD : ORANGE)
    out.push(c)
  }
  return sheet(out)
}

function muzzle() {
  const out: Canvas[] = []
  for (let f = 0; f < 3; f++) {
    const c = new Canvas(24, 24)
    const r = [4, 8, 10][f]
    for (let y = 0; y < 24; y++) for (let x = 0; x < 24; x++) {
      const d = Math.hypot(x - 11.5, y - 11.5)
      if (f < 2 && d < r - 3) c.set(x, y, WHITE)
      else if (d < r - 1 && d > r - 3) c.set(x, y, f === 2 ? GOLD : CREAM)
      else if (d < r && d > r - 1.2 && BAYER[y & 3][x & 3] > 0.3) c.set(x, y, GOLD)
    }
    out.push(c)
  }
  return sheet(out)
}

export const BEAM_H = 11
function beam(len: number) {
  const out: Canvas[] = []
  for (let f = 0; f < 3; f++) {
    const c = new Canvas(len, BEAM_H)
    const r = rng(31 + f)
    for (let x = 0; x < len; x++) {
      const edge = r() > 0.7 ? 1 : 0
      for (let y = 0; y < BEAM_H; y++) {
        const d = Math.abs(y - 5)
        if (d <= 1) c.set(x, y, WHITE)
        else if (d <= 2) c.set(x, y, CREAM)
        else if (d <= 3) c.set(x, y, GOLD)
        else if (d <= 4 - edge) c.set(x, y, ORANGE)
        else if (d <= 5 - edge && (x + f) % 3 === 0) c.set(x, y, RED)
      }
    }
    out.push(c)
  }
  return sheet(out)
}

function smokePuff() {
  const out: Canvas[] = []
  const n = noise2(12)
  for (let f = 0; f < 6; f++) {
    const c = new Canvas(16, 16)
    const t = f / 5
    const r = 3 + t * 4.5
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const d = Math.hypot(x - 7.5, y - 7.5) / r + (n(x * 0.5 + f, y * 0.5) - 0.5) * 0.5
      if (d >= 1) continue
      if (BAYER[y & 3][x & 3] < t * 0.9) continue
      c.set(x, y, d < 0.4 ? SMOKE[3] : d < 0.75 ? SMOKE[2] : SMOKE[1])
    }
    out.push(c)
  }
  return sheet(out)
}

function swirl() {
  const out: Canvas[] = []
  for (let f = 0; f < 6; f++) {
    const c = new Canvas(28, 28)
    for (const base of [0, Math.PI]) {
      const a0 = base + (f / 6) * Math.PI * 2
      for (let k = 0; k <= 16; k++) {
        const a = a0 + (k / 16) * 1.9
        const x = 13.5 + Math.cos(a) * 11
        const y = 13.5 + Math.sin(a) * 11
        c.set(x, y, k > 12 ? CREAM : GOLD)
        c.set(x + Math.cos(a) * 1, y + Math.sin(a) * 1, K)
      }
      const a = a0 + 1.9
      const hx = 13.5 + Math.cos(a) * 11
      const hy = 13.5 + Math.sin(a) * 11
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]]) c.set(hx + dx, hy + dy, CREAM)
    }
    out.push(c)
  }
  return sheet(out)
}

/* ---------- Character: downsample the hand-drawn frames onto the pixel grid ---------- */
export const CHAR_W = 166 // drawn at 2 stage units per pixel
export const CHAR_H = 181

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function pixelateFrame(src: string) {
  const img = await loadImage(src)
  const cv = document.createElement('canvas')
  cv.width = CHAR_W
  cv.height = CHAR_H
  const ctx = cv.getContext('2d', { willReadFrequently: true })!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, CHAR_W, CHAR_H)
  const data = ctx.getImageData(0, 0, CHAR_W, CHAR_H)
  const d = data.data
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 120) {
      d[i + 3] = 0
      continue
    }
    d[i + 3] = 255
    // Posterise a little so shading reads as clean pixel bands, and push near-blacks to one ink
    for (let k = 0; k < 3; k++) d[i + k] = Math.round(d[i + k] / 16) * 16
    if (d[i] + d[i + 1] + d[i + 2] < 150) {
      d[i] = 18
      d[i + 1] = 13
      d[i + 2] = 12
    }
  }
  ctx.putImageData(data, 0, 0)
  return cv.toDataURL('image/png')
}

export type LabArt = {
  backdrop: string
  dummy: string
  frames: string[]
  fx: { orb: string; boom: string; hit: string; muzzle: string; beam: string; smoke: string; swirl: string }
}

let cache: Promise<LabArt> | null = null
export const BEAM_LEN = 90

export function buildLabArt(frameSrcs: string[]): Promise<LabArt> {
  cache ??= (async () => ({
    backdrop: drawBackdrop(),
    dummy: drawDummySheet(),
    frames: await Promise.all(frameSrcs.map(pixelateFrame)),
    fx: {
      orb: chargeOrb(),
      boom: explosion(52, 9, 5, 1),
      hit: explosion(34, 7, 17, 0.6),
      muzzle: muzzle(),
      beam: beam(BEAM_LEN),
      smoke: smokePuff(),
      swirl: swirl(),
    },
  }))()
  return cache
}
