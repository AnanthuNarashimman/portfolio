import { m, type Variants } from 'motion/react'
import { profile } from '../data/profile'
import PixelButton from './PixelButton'
import PixelIcon from './PixelIcon'
import PixelSocialLink from './PixelSocialLink'
import { socialLinks } from './socialLinks'
import TornPortrait from './TornPortrait'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

// Split the copy so numbers like "100+" and "1,000+" can get the pixel underline
const summaryParts = profile.summary.split(/(\d[\d,]*\+)/)

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-24 lg:py-0">
      {/* Left — name + story */}
      <m.div variants={container} initial="hidden" animate="show" className="min-w-0 max-w-2xl">
        <m.h1
          variants={item}
          className="font-display text-[clamp(2.75rem,min(6.2vw,10dvh),5.25rem)] leading-[0.95] font-semibold tracking-[-0.035em] text-accent-50"
        >
          {profile.firstName}
          <br />
          <span className="bg-gradient-to-r from-accent-300 via-accent-200 to-accent-100 bg-clip-text text-transparent">
            {profile.lastName}
          </span>
        </m.h1>

        <m.p
          variants={item}
          className="mt-[min(2.25rem,3.6dvh)] font-display text-2xl leading-tight font-medium tracking-[-0.015em] text-accent-50 sm:text-3xl xl:text-[2.125rem]"
        >
          {profile.headline.split(' ').slice(0, -1).join(' ')}{' '}
          {/* Last word + accent stay together so the accent never wraps onto a line by itself */}
          <span className="whitespace-nowrap">
            {profile.headline.split(' ').at(-1)}{' '}
            {/* Pixel highlight: gold block with stepped corners and a hard offset shadow */}
            <span className="relative ml-0.5 inline-block">
              <span aria-hidden="true" className="pixel-corners absolute inset-0 translate-x-1 translate-y-1 bg-accent-900/60" />
              <span className="pixel-corners relative inline-block bg-accent-300 px-2 pb-0.5 font-display leading-tight font-semibold tracking-[-0.01em] text-accent-800">
                {profile.headlineAccent}
              </span>
            </span>
          </span>
        </m.p>

        {/* White, not cream: the only tint that keeps ≥4.5:1 against the lightest red of the card */}
        <m.p
          variants={item}
          className="mt-[min(1.75rem,3dvh)] max-w-[26.5em] text-[1.125rem] leading-relaxed text-white sm:text-[1.1875rem] lg:text-[clamp(1.0625rem,2.1dvh,1.1875rem)]"
        >
          {summaryParts.map((part, i) =>
            i % 2 ? (
              <strong key={i} className="pixel-mark font-bold whitespace-nowrap">
                {part}
              </strong>
            ) : (
              part
            ),
          )}
        </m.p>

        <m.div variants={item} className="mt-[min(2.75rem,4.8dvh)] flex flex-wrap items-center gap-3">
          <PixelButton href="#projects">
            See my work
            <PixelIcon name="computer" className="h-[18px] w-5" />
          </PixelButton>

          {/* Below lg the card's right-edge rail is hidden, so the socials sit next to the button */}
          <div className="flex items-center gap-2 lg:hidden">
            {socialLinks.map(({ href, label, pixel }) => (
              <PixelSocialLink key={label} href={href} label={label} pixel={pixel} />
            ))}
          </div>
        </m.div>
      </m.div>

      {/* Right — portrait tearing through the card */}
      <TornPortrait />

    </section>
  )
}
