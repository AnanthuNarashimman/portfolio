/*
 * GET /api/contributions?user=<login>: the last year of daily contribution counts for the "Now"
 * heatmap, read straight from GitHub's public contributions graph (no token needed).
 * Each day is a <td data-date data-level id>, and its count lives in the matching <tool-tip for=id>.
 * Cached at Vercel's edge for an hour so GitHub only sees a handful of requests a day.
 */

const LOGIN = /^[A-Za-z0-9-]{1,39}$/

const json = (body: unknown, status = 200, cache = false) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      ...(cache && { 'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400' }),
    },
  })

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1]

export async function GET(request: Request): Promise<Response> {
  const user = new URL(request.url).searchParams.get('user') ?? ''
  if (!LOGIN.test(user)) return json({ error: 'Invalid user' }, 400)

  const res = await fetch(`https://github.com/users/${user}/contributions`, { headers: { 'user-agent': 'ananthu.xyz' } })
  if (!res.ok) return json({ error: `GitHub ${res.status}` }, 502)
  const html = await res.text()

  // Tooltip text per cell id: "3 contributions on October 12th." or "No contributions on …"
  const counts = new Map<string, number>()
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    counts.set(m[1], Number(m[2].match(/^(\d[\d,]*)/)?.[1].replace(/,/g, '') ?? 0))
  }

  const contributions = [...html.matchAll(/<td\b[^>]*\bdata-date="[^"]*"[^>]*>/g)]
    .map(([tag]) => ({
      date: attr(tag, 'data-date')!,
      count: counts.get(attr(tag, 'id') ?? '') ?? 0,
      level: Math.min(4, Math.max(0, Number(attr(tag, 'data-level') ?? 0))),
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (!contributions.length) return json({ error: 'No contribution graph found' }, 502)
  return json({ contributions }, 200, true)
}
