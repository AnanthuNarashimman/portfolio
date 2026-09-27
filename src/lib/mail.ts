/*
 * Outgoing mail from the site's forms. Both forms post to the /api/contact Vercel Function, which
 * sends the email through Resend (see api/contact.ts), so no mail app ever opens.
 */

export type MailValues = Record<string, string>

/** Extra fields the dialog adds for spam protection: a hidden honeypot and how long the form took */
export type MailMeta = { company: string; elapsed: number }

async function deliver(kind: 'note' | 'invite', values: MailValues, meta: MailMeta): Promise<void> {
  let res: Response
  try {
    res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, ...values, ...meta }),
    })
  } catch {
    throw new Error('Couldn’t reach the server. Check your connection and try again.')
  }
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(data?.error ?? 'Couldn’t send right now. Please try again.')
  }
}

/** Hackathon invite (Hackathons section) */
export const sendInvite = (v: MailValues, meta: MailMeta) => deliver('invite', v, meta)

/** "Tell me something" (footer) */
export const sendNote = (v: MailValues, meta: MailMeta) => deliver('note', v, meta)
