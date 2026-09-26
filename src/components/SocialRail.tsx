import { m } from 'motion/react'
import PixelSocialLink from './PixelSocialLink'
import { socialLinks } from './socialLinks'

// Short trail of pulsing pixels above/below the rail, echoing the corner pixel waves
function PixelTrail({ flip = false }: { flip?: boolean }) {
  const pixels = [0.15, 0.3, 0.5, 0.75]
  return (
    <span aria-hidden="true" className={`flex flex-col items-center gap-1.5 ${flip ? 'flex-col-reverse' : ''}`}>
      {pixels.map((opacity, i) => (
        // opacity lives on the wrapper so the pulse animation (which animates opacity) layers on top of it
        <span key={i} style={{ opacity }}>
          <span
            className="pixel-wave block size-1.5 bg-accent-300"
            style={{ animationDelay: `${(flip ? i : pixels.length - i) * 0.18}s` }}
          />
        </span>
      ))}
    </span>
  )
}

// Vertical strip of social links pinned to the hero card's right edge (lg and up)
export default function SocialRail() {
  return (
    <m.nav
      aria-label="Social links"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 1.1 }}
      className="absolute top-1/2 right-5 z-20 hidden -translate-y-1/2 flex-col items-center gap-2.5 lg:flex xl:right-7"
    >
      <PixelTrail />
      {socialLinks.map(({ href, label, pixel }) => (
        <PixelSocialLink key={label} href={href} label={label} pixel={pixel} />
      ))}
      <PixelTrail flip />
    </m.nav>
  )
}
