import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import me from '../assets/me/hackathon-me.png'
import { introPlaying, markIntroDone } from '../lib/intro'
import { PIXEL_FONT } from './pixelFont'
import './intro.css'

/*
 * Opening animation, once per session (index.html paints the crimson cover before any JS loads):
 *   1. pixel me pops in, "ANANTHU" rises letter by letter, a pixel loading bar fills
 *   2. the crimson cover, which is a grid of pixel blocks, dissolves from the centre outward
 *      while the page's own entrance plays underneath
 * Everything animates transform/opacity only, so it stays smooth on slow machines.
 */

const NAME = 'ANANTHU'
const BAR = 18
const HOLD_MS = 950 // name + bar, then the reveal starts
const BLOCK = 96 // target block size in px (fewer, bigger blocks = fewer GPU layers)
const SPREAD_MS = 420 // centre-to-corner delay across the dissolve
const BLOCK_MS = 380

const vars = (v: Record<string, string>) => v as CSSProperties

function Letter({ ch, i }: { ch: string; i: number }) {
  const rows = PIXEL_FONT[ch]
  return (
    <svg viewBox="0 0 6.2 7.2" shapeRendering="crispEdges" className="intro-letter h-full w-auto" style={vars({ '--i': String(i) })} aria-hidden="true">
      {rows.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '#' ? (
            <g key={`${x}-${y}`}>
              <rect x={x + 0.2} y={y + 0.2} width={1} height={1} fill="#4a0b0b" />
              <rect x={x} y={y} width={1} height={1} fill="#fff7ef" />
            </g>
          ) : null,
        ),
      )}
    </svg>
  )
}

function Blocks({ leaving }: { leaving: boolean }) {
  const [grid] = useState(() => {
    const cols = Math.max(4, Math.round(window.innerWidth / BLOCK))
    const rows = Math.max(4, Math.round(window.innerHeight / BLOCK))
    const cx = (cols - 1) / 2
    const cy = (rows - 1) / 2
    const far = Math.hypot(cx, cy)
    const cells = Array.from({ length: cols * rows }, (_, k) => {
      const x = k % cols
      const y = Math.floor(k / cols)
      // Centre first, corners last, with a little jitter so the edge reads as pixels, not a circle
      const jitter = ((x * 7 + y * 13) % 5) * 12
      return Math.round((Math.hypot(x - cx, y - cy) / far) * SPREAD_MS + jitter)
    })
    return { cols, rows, cells }
  })
  return (
    <div
      className={`intro-blocks absolute inset-0 grid ${leaving ? 'is-leaving' : ''}`}
      style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)`, gridTemplateRows: `repeat(${grid.rows}, 1fr)` }}
    >
      {grid.cells.map((delay, k) => (
        <span key={k} style={vars({ '--d': `${delay}ms` })} />
      ))}
    </div>
  )
}

export default function Intro() {
  // The cover is only ours if index.html armed the intro and the failsafe hasn't already cleared it
  const [host] = useState(() => (introPlaying() && document.documentElement.classList.contains('intro') ? document.getElementById('intro') : null))
  const [phase, setPhase] = useState<'in' | 'out' | 'gone'>('in')

  useEffect(() => {
    if (!host) {
      markIntroDone() // no intro this time: let the page animate straight away
      return
    }
    // The blocks now cover the screen, so the static cover can step aside for them
    host.classList.add('is-live')
    const out = setTimeout(() => setPhase('out'), HOLD_MS)
    // The page's entrance starts a beat after the blocks begin to go, so the two don't start in the same frame
    const page = setTimeout(markIntroDone, HOLD_MS + 140)
    const gone = setTimeout(
      () => {
        setPhase('gone')
        document.documentElement.classList.remove('intro')
        try {
          sessionStorage.setItem('intro-seen', '1')
        } catch {
          /* private mode: it'll just play again next time */
        }
        host.remove()
      },
      HOLD_MS + SPREAD_MS + 60 + BLOCK_MS + 40,
    )
    return () => {
      clearTimeout(out)
      clearTimeout(page)
      clearTimeout(gone)
    }
  }, [host])

  if (!host || phase === 'gone') return null

  return createPortal(
    <>
      <Blocks leaving={phase === 'out'} />
      <div className={`intro-stage pointer-events-none absolute inset-0 grid place-items-center ${phase === 'out' ? 'is-leaving' : ''}`}>
        <div className="flex flex-col items-center">
          <div className="flex items-end gap-5 sm:gap-7">
            <img src={me} alt="" width={86} height={120} className="intro-me hidden h-[120px] w-auto sm:block lg:h-[160px]" />
            <div className="flex h-12 gap-[0.45rem] sm:h-[4.5rem] sm:gap-[0.6rem] lg:h-24 lg:gap-3" role="img" aria-label="Ananthu">
              {[...NAME].map((ch, i) => (
                <Letter key={i} ch={ch} i={i} />
              ))}
            </div>
          </div>
          <div className="mt-7 flex gap-[3px]" aria-hidden="true">
            {Array.from({ length: BAR }, (_, i) => (
              <span key={i} className="intro-bar size-2.5 sm:size-3 lg:size-3.5" style={vars({ '--i': String(i) })} />
            ))}
          </div>
          <p className="intro-label mt-3 font-mono text-[11px] tracking-[0.3em] text-accent-200/80 uppercase">Loading pixels</p>
        </div>
      </div>
    </>,
    host,
  )
}
