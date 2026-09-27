/*
 * POST /api/contact: the site's forms ("Tell me something" and the hackathon invite) send here.
 * Runs as a Vercel Function; the Resend key lives only in Vercel's environment variables.
 *
 * Email goes to my inbox from hello@ananthu.xyz, with Reply-To set to the visitor, so replying in
 * Gmail answers them directly. Plain text only: nothing a visitor types is ever rendered as HTML.
 *
 * Env: RESEND_API_KEY (required), CONTACT_TO (optional), CONTACT_FROM (optional)
 */

const TO = process.env.CONTACT_TO ?? 'ananthu.narashimman@gmail.com'
const FROM = process.env.CONTACT_FROM ?? 'Ananthu Portfolio <hello@ananthu.xyz>'

type Kind = 'note' | 'invite'

// Field → max length. Anything else in the body is ignored.
const LIMITS: Record<string, number> = { name: 100, email: 200, subject: 150, message: 4000, hackathon: 150, when: 150 }
const REQUIRED: Record<Kind, string[]> = { note: ['name', 'email', 'message'], invite: ['name', 'email', 'hackathon'] }
const LABEL: Record<string, string> = { name: 'your name', email: 'your email', subject: 'the subject', message: 'your message', hackathon: 'the hackathon name', when: 'the date and place' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_FILL_MS = 2500 // humans take longer than this to fill a form; most bots don't

// Best-effort rate limit per IP (per warm instance): 5 messages per 10 minutes
const WINDOW_MS = 10 * 60 * 1000
const hits = new Map<string, number[]>()
function limited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  return recent.length > 5
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

// Strip line breaks from anything that ends up in a header-like field (subject, names)
const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ').trim()

export async function POST(request: Request): Promise<Response> {
  const key = process.env.RESEND_API_KEY
  if (!key) return json(500, { error: 'Mail is not configured yet.' })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json(400, { error: 'Invalid request.' })
  }

  // Bots: the honeypot field is hidden from people, and real people take a few seconds to type.
  // Pretend success so the bot learns nothing.
  if (typeof body.company === 'string' && body.company.trim() !== '') return json(200, { ok: true })
  if (typeof body.elapsed !== 'number' || body.elapsed < MIN_FILL_MS) return json(200, { ok: true })

  const kind: Kind = body.kind === 'invite' ? 'invite' : 'note'
  const f: Record<string, string> = {}
  for (const [field, max] of Object.entries(LIMITS)) {
    const v = typeof body[field] === 'string' ? (body[field] as string).trim() : ''
    if (v.length > max) return json(400, { error: `Please shorten ${LABEL[field]}.` })
    f[field] = v
  }
  for (const field of REQUIRED[kind]) {
    if (!f[field]) return json(400, { error: `Please add ${LABEL[field]}.` })
  }
  if (!EMAIL.test(f.email)) return json(400, { error: 'That email address doesn’t look right.' })

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (limited(ip)) return json(429, { error: 'Too many messages. Please try again in a few minutes.' })

  const subject =
    kind === 'invite'
      ? `Hackathon invite: ${oneLine(f.hackathon)} (from ${oneLine(f.name)})`
      : `${oneLine(f.subject) || 'New message'} (from ${oneLine(f.name)})`

  const text = [
    f.message || '(no message)',
    '',
    '---',
    kind === 'invite' ? `Hackathon: ${f.hackathon}\nWhen & where: ${f.when || 'not given'}` : null,
    `From: ${f.name} <${f.email}>`,
    `Sent via the ${kind === 'invite' ? 'hackathon invite' : '“Tell me something”'} form on ananthu.xyz`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [TO], reply_to: f.email, subject: subject.slice(0, 200), text }),
  })

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text().catch(() => ''))
    return json(502, { error: 'Couldn’t send right now. Please try again.' })
  }
  return json(200, { ok: true })
}
