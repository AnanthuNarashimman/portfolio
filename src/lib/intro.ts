import { useEffect, useState, useSyncExternalStore } from 'react'

/*
 * Whether the opening animation has finished revealing the page. index.html decides before first
 * paint whether the intro plays (first visit this session, motion allowed) by adding `intro` to
 * <html>; page entrance animations wait on this so they play as the intro clears, not behind it.
 */
let done = typeof document === 'undefined' || !document.documentElement.classList.contains('intro')
const listeners = new Set<() => void>()

export function introPlaying() {
  return !done
}

export function markIntroDone() {
  if (done) return
  done = true
  listeners.forEach((l) => l())
}

export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => done,
  )
}

/**
 * True once the intro has finished, the page's own entrance has had `settleMs` to play, and the
 * browser is idle. Heavy below-the-fold work waits on this, so it never competes with the animations.
 */
export function useAfterIntro(settleMs = 700) {
  const done = useIntroDone()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!done || ready) return
    const hasIdle = typeof requestIdleCallback === 'function'
    let idle = 0
    const t = setTimeout(() => {
      idle = hasIdle ? requestIdleCallback(() => setReady(true), { timeout: 1000 }) : setTimeout(() => setReady(true), 0)
    }, settleMs)
    return () => {
      clearTimeout(t)
      if (hasIdle) cancelIdleCallback(idle)
      else clearTimeout(idle)
    }
  }, [done, ready, settleMs])
  return ready
}
