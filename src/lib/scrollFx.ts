/*
 * Page-wide scroll effects, set up once (main.tsx) and kept in sync with lazily mounted content:
 *
 * 1. Reveal: elements marked `data-reveal` ease up and fade in the first time they enter the
 *    viewport (stagger with a `--reveal-delay` style). Skipped entirely for reduced motion, and
 *    only armed once JS runs, so content is never hidden without it.
 * 2. Pause: every <section>, <footer> and [data-pause] block gets `is-offscreen` while it's out of view, which pauses
 *    all CSS animations inside it (marquees, pixel rain, blinking cells…) so offscreen decoration
 *    costs nothing while you scroll.
 */
export function initScrollFx() {
  const root = document.documentElement
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  const revealIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        e.target.classList.add('is-revealed')
        revealIO.unobserve(e.target)
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  )

  const pauseIO = new IntersectionObserver(
    (entries) => {
      for (const e of entries) e.target.classList.toggle('is-offscreen', !e.isIntersecting)
    },
    { rootMargin: '150px 0px' },
  )

  const scan = (node: Element | Document) => {
    if (!reduced) node.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => revealIO.observe(el))
    node.querySelectorAll('section, footer, [data-pause]').forEach((el) => pauseIO.observe(el))
    if (node instanceof Element) {
      if (!reduced && node.matches('[data-reveal]:not(.is-revealed)')) revealIO.observe(node)
      if (node.matches('section, footer, [data-pause]')) pauseIO.observe(node)
    }
  }

  if (!reduced) root.classList.add('reveal-on')
  scan(document)

  // Lazy sections, route changes and expanding panels mount later: pick them up as they appear
  new MutationObserver((mutations) => {
    for (const m of mutations) for (const n of m.addedNodes) if (n instanceof Element) scan(n)
  }).observe(document.body, { childList: true, subtree: true })
}
