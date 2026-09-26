import { profile } from '../data/profile'

/*
 * Outgoing mail from the site's forms. For now everything opens a pre-filled email; swap the body
 * of `deliver` for EmailJS / Resend later and none of the forms need to change.
 */
async function deliver(subject: string, body: string): Promise<void> {
  window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export type MailValues = Record<string, string>

/** Hackathon invite (Hackathons section) */
export function sendInvite(v: MailValues) {
  return deliver(
    `Hackathon invite: ${v.hackathon || 'an upcoming hackathon'}`,
    [v.message, '', `Hackathon: ${v.hackathon}`, `When: ${v.when}`, '', `From: ${v.name}`, `Reply to: ${v.email}`].join('\n'),
  )
}

/** "Tell me something" (footer) */
export function sendNote(v: MailValues) {
  return deliver(v.subject || `Hello from ${v.name || 'your portfolio'}`, [v.message, '', `From: ${v.name}`, `Reply to: ${v.email}`].join('\n'))
}
