import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import avatar from '../assets/avatar.webp'
import { navLinks, profile } from '../data/profile'
import PixelButton from './PixelButton'

// One pill: avatar on the left, section links in the middle, "Let's talk" on the right
export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-20 mx-auto flex w-full max-w-7xl justify-center px-5 pt-5 sm:px-8 lg:px-24"
    >
      <div className="flex w-full items-center gap-1 rounded-full border border-accent-200/20 bg-white/5 p-1.5 backdrop-blur-md md:w-auto">
        <a href="#" aria-label={`${profile.firstName} ${profile.lastName} — home`} className="shrink-0 rounded-full">
          <img
            src={avatar}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full ring-2 ring-accent-200/40 transition-shadow hover:ring-accent-300"
          />
        </a>

        <nav className="mx-1 hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="rounded-full px-4 py-1.5 text-sm text-accent-100/75 transition-colors hover:bg-white/10 hover:text-accent-50"
            >
              {link}
            </a>
          ))}
        </nav>

        <PixelButton href={`mailto:${profile.email}`} variant="cream" className="mr-1 ml-auto md:ml-1">
          Let's talk
          <ArrowUpRight className="size-4" />
        </PixelButton>
      </div>
    </motion.header>
  )
}
