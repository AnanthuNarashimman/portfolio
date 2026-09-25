import PixelIcon from './PixelIcon'
import type { PixelIconName } from './pixelIcons'

// Square social button with stepped "pixel" corners; fills gold on hover
export default function PixelSocialLink({ href, label, pixel }: { href: string; label: string; pixel: PixelIconName }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="pixel-corners group grid size-11 place-items-center bg-accent-200/15 text-accent-100 transition-colors hover:bg-accent-300 hover:text-accent-800 focus-visible:bg-accent-300 focus-visible:text-accent-800 focus-visible:outline-none"
    >
      <PixelIcon name={pixel} className="size-6 transition-transform group-hover:-translate-y-px" />
    </a>
  )
}
