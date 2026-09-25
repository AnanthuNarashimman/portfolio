import { ArrowUpRight, Mail } from 'lucide-react'
import { profile } from '../data/profile'
import { socialLinks } from './socialLinks'

const links = [...socialLinks, { href: `mailto:${profile.email}`, label: 'Email', Icon: Mail }]

// Minimal contact block — the nav's "Contact" link scrolls here; the full contact section comes later
export default function Contact() {
  return (
    <section id="contact" className="mx-auto w-full max-w-7xl scroll-mt-4 px-5 pb-16 sm:px-8 lg:px-24">
      <div className="rounded-[2rem] bg-accent-50 p-8 ring-1 ring-accent-200 sm:p-12">
        <p className="font-mono text-xs tracking-[0.2em] text-accent-700 uppercase">Contact</p>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-[-0.03em] text-ink sm:text-5xl">
          Let's build something.
        </h2>
        <a
          href={`mailto:${profile.email}`}
          className="group mt-6 inline-flex items-center gap-1.5 text-lg font-medium text-accent-700 underline decoration-accent-300 underline-offset-4 hover:text-accent-800"
        >
          {profile.email}
          <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>

        <ul className="mt-8 flex flex-wrap gap-3">
          {links.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-accent-200 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent-300 hover:text-accent-700"
              >
                <Icon className="size-4" />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
