import { motion, type Variants } from 'motion/react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { profile } from '../data/profile'
import TornPortrait from './TornPortrait'
import { GithubIcon, LinkedinIcon, XIcon } from './SocialIcons'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
}

const socials = [
  { href: profile.socials.github, label: 'GitHub', Icon: GithubIcon },
  { href: profile.socials.linkedin, label: 'LinkedIn', Icon: LinkedinIcon },
  { href: profile.socials.x, label: 'X', Icon: XIcon },
]

export default function Hero() {
  return (
    <section className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 py-8 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-24 lg:py-0">
      {/* Left — name + story */}
      <motion.div variants={container} initial="hidden" animate="show" className="min-w-0 max-w-2xl">
        <motion.div
          variants={item}
          className="mb-[min(1.5rem,2.5dvh)] inline-flex items-center gap-2 rounded-full border border-accent-200/25 bg-accent-200/10 py-1 pr-3.5 pl-1.5 text-xs font-medium text-accent-100"
        >
          <span className="relative flex size-5 items-center justify-center rounded-full bg-accent-200/15">
            <span className="absolute size-2 animate-ping rounded-full bg-accent-300/70" />
            <span className="size-2 rounded-full bg-accent-300" />
          </span>
          Currently · {profile.role}
        </motion.div>

        <motion.p variants={item} className="font-serif text-2xl text-accent-200/80 italic sm:text-3xl">
          Hi, I'm
        </motion.p>

        <motion.h1
          variants={item}
          className="font-display text-[clamp(2.75rem,min(7vw,11dvh),6.25rem)] leading-[0.92] font-extrabold tracking-[-0.04em] text-accent-50"
        >
          {profile.firstName}
          <br />
          <span className="bg-gradient-to-r from-accent-300 via-accent-200 to-accent-100 bg-clip-text text-transparent">
            {profile.lastName}
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-[min(1.5rem,2.5dvh)] font-display text-xl font-medium tracking-tight text-accent-50 sm:text-2xl"
        >
          {profile.headline}{' '}
          <span className="inline-block -rotate-2 rounded-lg bg-ink px-2 font-serif text-[1.2em] leading-tight font-normal text-accent-300 italic">
            {profile.headlineAccent}
          </span>
        </motion.p>

        <motion.p variants={item} className="mt-4 max-w-lg text-base leading-relaxed text-accent-100/75 sm:text-lg">
          {profile.summary} <span className="font-semibold text-accent-300">{profile.summaryAccent}</span>
        </motion.p>

        <motion.div variants={item} className="mt-[min(2rem,3.5dvh)] flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${profile.email}`}
            className="group inline-flex items-center gap-2 rounded-full bg-accent-300 px-6 py-3 text-sm font-semibold text-accent-800 shadow-lg shadow-accent-900/30 transition-all hover:-translate-y-0.5 hover:bg-accent-200 hover:shadow-xl hover:shadow-accent-900/30"
          >
            Let's Connect
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a
            href="#projects"
            className="inline-flex items-center gap-2 rounded-full border border-accent-200/30 bg-white/5 px-6 py-3 text-sm font-semibold text-accent-50 transition-colors hover:border-accent-200/50 hover:bg-white/10"
          >
            See my work
          </a>
          <div className="ml-1 flex items-center gap-1">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid size-10 place-items-center rounded-full text-accent-100/70 transition-colors hover:bg-white/10 hover:text-accent-300"
              >
                <Icon className="size-[18px]" />
              </a>
            ))}
          </div>
        </motion.div>

        <motion.dl variants={item} className="mt-[min(2.5rem,4dvh)] flex gap-8 border-t border-accent-200/20 pt-6 sm:gap-12">
          {profile.stats.map((s) => (
            <div key={s.label}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-3xl font-bold tracking-tight text-accent-50 sm:text-4xl">
                {s.value.replace(/\+$/, '')}
                <span className="text-accent-300">+</span>
              </dd>
              <dd className="mt-1 text-xs tracking-wide text-accent-100/60 uppercase">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </motion.div>

      {/* Right — portrait tearing through the card */}
      <TornPortrait />

      <motion.a
        href="#build-log"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs tracking-[0.2em] text-accent-100/60 uppercase transition-colors hover:text-accent-50 lg:tall:flex"
      >
        <ArrowDown className="size-3.5 animate-bounce" />
        Scroll for the story
      </motion.a>
    </section>
  )
}
