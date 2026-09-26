import type { ReactNode } from 'react'
import './arcade.css'

/** Full-width dark "arcade" band: stepped pixel edges, crimson line grid, scanlines. Lifts to maroon in dark mode. */
export default function ArcadeBand({ id, label, children, className = '' }: { id: string; label: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} aria-label={label} className={`arcade relative isolate mt-24 scroll-mt-4 ${className}`}>
      <div aria-hidden="true" className="tech-steps-top h-6 w-full" />
      <div className="tech-band relative py-16">
        <div aria-hidden="true" className="tech-grid pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="tech-scan pointer-events-none absolute inset-0" />
        {children}
      </div>
      <div aria-hidden="true" className="tech-steps-bottom h-6 w-full" />
    </section>
  )
}
