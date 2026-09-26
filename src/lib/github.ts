/*
 * Live GitHub activity for the "Now" section.
 * - Daily contribution counts for the last year: github-contributions-api.jogruber.de (scrapes the
 *   public profile graph, CORS-enabled, no token).
 * - What happened on each day (repos pushed to, PRs…): GitHub's public events API, which only
 *   reaches back ~90 days / 100 events, so older days show counts only.
 * Results are cached in sessionStorage for half an hour so navigating around doesn't refetch.
 */

export type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }
export type RepoActivity = { repo: string; actions: Record<string, number> }
export type EventsByDay = Record<string, RepoActivity[]>

export type GitHubActivity = {
  days: Day[]
  events: EventsByDay
  eventsSince?: string // earliest date the events API covers
}

const CACHE_KEY = 'gh-activity-v1'
const CACHE_MS = 30 * 60 * 1000

// Event type → the word shown in the day tooltip
const ACTION: Record<string, string> = {
  PushEvent: 'push',
  PullRequestEvent: 'pull request',
  PullRequestReviewEvent: 'review',
  IssuesEvent: 'issue',
  IssueCommentEvent: 'comment',
  CreateEvent: 'branch',
  PublicEvent: 'open-sourced',
  ReleaseEvent: 'release',
  ForkEvent: 'fork',
}

type RawEvent = { type: string; created_at: string; repo: { name: string }; payload?: { ref_type?: string } }

function groupEvents(user: string, raw: RawEvent[]): EventsByDay {
  const byDay: EventsByDay = {}
  for (const e of raw) {
    let action = ACTION[e.type]
    if (!action) continue // stars etc. aren't contributions
    if (e.type === 'CreateEvent' && e.payload?.ref_type === 'repository') action = 'new repo'
    const date = e.created_at.slice(0, 10)
    const repo = e.repo.name.startsWith(`${user}/`) ? e.repo.name.slice(user.length + 1) : e.repo.name
    const list = (byDay[date] ??= [])
    let entry = list.find((r) => r.repo === repo)
    if (!entry) list.push((entry = { repo, actions: {} }))
    entry.actions[action] = (entry.actions[action] ?? 0) + 1
  }
  // Busiest repo first
  for (const list of Object.values(byDay)) list.sort((a, b) => total(b) - total(a))
  return byDay
}

const total = (r: RepoActivity) => Object.values(r.actions).reduce((a, b) => a + b, 0)

function readCache(): GitHubActivity | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { t, data } = JSON.parse(raw) as { t: number; data: GitHubActivity }
    return Date.now() - t < CACHE_MS ? data : null
  } catch {
    return null
  }
}

function writeCache(data: GitHubActivity) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), data }))
  } catch {
    /* private mode etc. — just skip the cache */
  }
}

export async function fetchGitHubActivity(user: string, signal?: AbortSignal): Promise<GitHubActivity> {
  const cached = readCache()
  if (cached) return cached

  const [contrib, events] = await Promise.all([
    fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`, { signal }).then((r) => {
      if (!r.ok) throw new Error(`contributions ${r.status}`)
      return r.json() as Promise<{ contributions: Day[] }>
    }),
    // The events feed is a nice-to-have; the heatmap still works without it (e.g. rate-limited)
    fetch(`https://api.github.com/users/${user}/events/public?per_page=100`, { signal })
      .then((r) => (r.ok ? (r.json() as Promise<RawEvent[]>) : []))
      .catch(() => [] as RawEvent[]),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const data: GitHubActivity = {
    days: contrib.contributions.filter((d) => d.date <= today),
    events: groupEvents(user, events),
    eventsSince: events.length ? events[events.length - 1].created_at.slice(0, 10) : undefined,
  }
  writeCache(data)
  return data
}

/* ---------- Derived stats ---------- */

export function streaks(days: Day[]) {
  // Streak length ending at each index, and starting at each index, so any day can report its run
  const back = days.map(() => 0)
  const fwd = days.map(() => 0)
  days.forEach((d, i) => (back[i] = d.count ? (back[i - 1] ?? 0) + 1 : 0))
  for (let i = days.length - 1; i >= 0; i--) fwd[i] = days[i].count ? (fwd[i + 1] ?? 0) + 1 : 0
  const runAt = (i: number) => (days[i]?.count ? back[i] + fwd[i] - 1 : 0)
  const longest = Math.max(0, ...back)
  // Today may not have a commit yet; a streak through yesterday still counts as current
  const last = days.length - 1
  const current = days[last]?.count ? back[last] : (back[last - 1] ?? 0)
  return { runAt, longest, current }
}

export function monthStats(days: Day[], ref = new Date()) {
  const ym = ref.toISOString().slice(0, 7)
  const prev = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - 1, 1)).toISOString().slice(0, 7)
  const month = days.filter((d) => d.date.startsWith(ym))
  const sum = (list: Day[]) => list.reduce((a, d) => a + d.count, 0)
  const best = month.reduce<Day | undefined>((b, d) => (d.count > (b?.count ?? 0) ? d : b), undefined)
  return {
    total: sum(month),
    previous: sum(days.filter((d) => d.date.startsWith(prev))),
    activeDays: month.filter((d) => d.count > 0).length,
    daysSoFar: month.length,
    best,
  }
}

/** Repo with the most pushes in the given month, from the events feed */
export function mostPushed(events: EventsByDay, ym: string) {
  const pushes: Record<string, number> = {}
  for (const [date, list] of Object.entries(events)) {
    if (!date.startsWith(ym)) continue
    for (const r of list) pushes[r.repo] = (pushes[r.repo] ?? 0) + (r.actions.push ?? 0)
  }
  const top = Object.entries(pushes).sort((a, b) => b[1] - a[1])[0]
  return top && top[1] > 0 ? { repo: top[0], pushes: top[1] } : undefined
}
