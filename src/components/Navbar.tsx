import { motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { navLinks, profile } from '../data/profile'

export default function Navbar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 pt-5 sm:px-8 lg:px-24"
    >
      <a href="#" className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-ink font-display text-sm font-bold text-accent-300">
          AN
        </span>
        <span className="hidden font-display text-base font-semibold tracking-tight text-accent-50 sm:block">
          ananthu<span className="text-accent-300">.xyz</span>
        </span>
      </a>

      <nav className="hidden items-center gap-1 rounded-full border border-accent-200/20 bg-white/5 p-1 backdrop-blur-md md:flex">
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

      <a
        href={`mailto:${profile.email}`}
        className="group inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-4 py-2 text-sm font-medium text-accent-800 transition-colors hover:bg-accent-200"
      >
        Let's talk
        <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    </motion.header>
  )
}
