import { motion, type Variants } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { profile } from '../data/profile'
import PixelButton from './PixelButton'
import PixelSocialLink from './PixelSocialLink'
import { socialLinks } from './socialLinks'
import TornPortrait from './TornPortrait'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-24 lg:py-0">
      {/* Left — name + story */}
      <motion.div variants={container} initial="hidden" animate="show" className="min-w-0 max-w-2xl">
        <motion.h1
          variants={item}
          className="font-display text-[clamp(2.75rem,min(7vw,11dvh),6.25rem)] leading-[0.92] font-extrabold tracking-[-0.035em] text-accent-50"
        >
          {profile.firstName}
          <br />
          <span className="bg-gradient-to-r from-accent-300 via-accent-200 to-accent-100 bg-clip-text text-transparent">
            {profile.lastName}
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-[min(1.5rem,2.5dvh)] font-display text-2xl leading-tight font-bold tracking-[-0.01em] text-accent-50 sm:text-3xl xl:text-[2.125rem]"
        >
          {profile.headline.split(' ').slice(0, -1).join(' ')}{' '}
          {/* Last word + accent stay together so the accent never wraps onto a line by itself */}
          <span className="whitespace-nowrap">
            {profile.headline.split(' ').at(-1)}{' '}
            {/* Pixel highlight: gold block with stepped corners and a hard offset shadow */}
            <span className="relative ml-0.5 inline-block">
              <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/60" />
              <span className="pixel-corners relative inline-block bg-accent-300 px-2 pb-0.5 font-display leading-tight font-extrabold tracking-[-0.01em] text-accent-800">
                {profile.headlineAccent}
              </span>
            </span>
          </span>
        </motion.p>

        {/* White, not cream: the only tint that keeps ≥4.5:1 against the lightest red of the card */}
        <motion.p
          variants={item}
          className="mt-4 max-w-[31em] text-[1.0625rem] leading-relaxed text-white sm:text-lg lg:text-[clamp(1rem,2.05dvh,1.1875rem)]"
        >
          {profile.summary}
        </motion.p>

        <motion.div variants={item} className="mt-[min(2rem,3.5dvh)] flex flex-wrap items-center gap-3">
          <PixelButton href="#projects">
            See my work
            <ArrowRight className="size-4" />
          </PixelButton>

          {/* Below lg the card's right-edge rail is hidden, so the socials sit next to the button */}
          <div className="flex items-center gap-2 lg:hidden">
            {socialLinks.map(({ href, label, pixel }) => (
              <PixelSocialLink key={label} href={href} label={label} pixel={pixel} />
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Right — portrait tearing through the card */}
      <TornPortrait />

    </section>
  )
}
