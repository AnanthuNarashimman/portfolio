import { profile } from '../data/profile'
import type { PixelIconName } from './pixelIcons'
import { GithubIcon, LinkedinIcon, XIcon } from './SocialIcons'

export const socialLinks: { href: string; label: string; Icon: typeof GithubIcon; pixel: PixelIconName }[] = [
  { href: profile.socials.github, label: 'GitHub', Icon: GithubIcon, pixel: 'github' },
  { href: profile.socials.linkedin, label: 'LinkedIn', Icon: LinkedinIcon, pixel: 'linkedin' },
  { href: profile.socials.x, label: 'X', Icon: XIcon, pixel: 'x' },
]
