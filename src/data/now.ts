// The "Now" section's hand-written month log. Update this once a month; everything else on the
// section (heatmap, month stats, most-pushed repo) comes live from GitHub.
export type NowKind = 'shipping' | 'work' | 'contributing' | 'building' | 'learning' | 'interviewing'

export type NowEntry = {
  kind: NowKind
  title: string
  text: string
  href?: string
}

export const now = {
  month: 'October 2026',
  updated: '2026-10-14',
  entries: [
    {
      kind: 'work',
      title: 'Wrapping up at the stealth AI startup',
      text: 'My time on the founding team ends this October, after three months of voice AI agents in production and the backend underneath them.',
    },
    {
      kind: 'interviewing',
      title: 'Interviewing with startups',
      text: 'Talking to multiple startups about the next step up in my career.',
    },
    {
      kind: 'shipping',
      title: 'shipstat',
      text: 'Making it better: sharper stats, nicer cards, fewer rough edges.',
      href: 'https://github.com/AnanthuNarashimman/shipstat',
    },
    {
      kind: 'building',
      title: 'This portfolio',
      text: 'Still improving it, pixel by pixel.',
    },
  ] satisfies NowEntry[],
}
