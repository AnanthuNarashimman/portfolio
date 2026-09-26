// Hackathons, oldest to newest. Each card gets a pixel scene of its city; repeat cities vary the time of day.
export type SceneKind = 'namakkal' | 'chennai' | 'delhi' | 'bengaluru' | 'online'
export type TimeOfDay = 'dawn' | 'noon' | 'dusk' | 'night'

export type Hackathon = {
  name: string
  tagline: string
  date: string
  city: string
  result: string
  great?: boolean // "One of the greats"
  scene: SceneKind
  time: TimeOfDay
}

export const hackathons: Hackathon[] = [
  { name: 'Hack With GDG', tagline: 'My first ever hackathon', date: 'Nov 2024', city: 'Namakkal', result: 'First ever', scene: 'namakkal', time: 'dawn' },
  { name: 'HackVerse', tagline: 'Web3 hackathon', date: 'Mar 2025', city: 'Chennai', result: 'Top 10', scene: 'chennai', time: 'noon' },
  { name: 'FutureX Hackathon', tagline: '6-hour MVP sprint', date: 'Apr 2025', city: 'Namakkal', result: 'Intern offer', scene: 'namakkal', time: 'dusk' },
  { name: 'ETHGlobal', tagline: 'Invite-only global hackathon', date: 'Sep 2025', city: 'New Delhi', result: 'Invite only', great: true, scene: 'delhi', time: 'dusk' },
  { name: 'Monad Blitz', tagline: 'Invite-only 6-hour blitz', date: 'Nov 2025', city: 'Bengaluru', result: 'Curated 84', great: true, scene: 'bengaluru', time: 'night' },
  { name: 'Gemini 3 Hackathon', tagline: 'Remote build challenge', date: 'Dec 2025', city: 'Online', result: 'Participant', scene: 'online', time: 'night' },
  { name: 'Google TechSprint', tagline: 'Campus innovation sprint', date: 'Jan 2026', city: 'Namakkal', result: 'Winner', scene: 'namakkal', time: 'noon' },
  { name: 'EVM Capital Hackathon', tagline: 'Web3 × AI builder hackathon', date: 'Jul 2026', city: 'Bengaluru', result: 'Shipped', scene: 'bengaluru', time: 'dawn' },
]
