// The "Now" section's hand-written month log. Update this once a month; everything else on the
// section (heatmap, month stats, most-pushed repo) comes live from GitHub.
export type NowKind = 'shipping' | 'work' | 'contributing' | 'building' | 'learning'

export type NowEntry = {
  kind: NowKind
  title: string
  text: string
  href?: string
}

export const now = {
  month: 'September 2026',
  updated: '2026-09-26',
  entries: [
    {
      kind: 'work',
      title: 'Founding team, stealth AI startup',
      text: 'Second month in. Voice AI agents running in production, and the backend foundations underneath them.',
    },
    {
      kind: 'shipping',
      title: 'shipstat',
      text: 'Honest npm download stats, with cards worth sharing. Went from an empty repo to twenty pushes in a single day.',
      href: 'https://github.com/AnanthuNarashimman/shipstat',
    },
    {
      kind: 'contributing',
      title: 'agent-orchestrator',
      text: 'Opened pull requests to an open-source agent orchestrator.',
      href: 'https://github.com/Untrivial-ai/agent-orchestrator',
    },
    {
      kind: 'building',
      title: 'This portfolio',
      text: 'Pixel by pixel, including the section you’re reading.',
    },
  ] satisfies NowEntry[],
}
