import type { PixelIconName } from '../components/pixelIcons'

// Journey, oldest to newest: campus build → client work → founding team
export type Experience = {
  role: string
  org: string
  icon: PixelIconName // pixel-art icon for the card's tile
  dates: string
  meta?: string
  current?: boolean
  summary: string
  chips: string[]
  context: string
  owned: string
  decision: string
  impact: string
  stack: string[]
}

export const experience: Experience[] = [
  {
    role: 'Independent Developer',
    org: 'Syntax',
    icon: 'trophy',
    dates: 'Independent project',
    summary: 'Built and deployed a coding assessment platform for my college, leading a team from idea to production.',
    chips: ['Team lead', '100+ students', 'Deployed on campus'],
    context: 'My college needed a way to run quizzes and coding contests without juggling spreadsheets and third-party tools.',
    owned:
      'Led the team, set the architecture, and built the core systems: live proctoring, encrypted submissions, real-time leaderboards, and Judge0 grading across five languages.',
    decision: 'Designed a three-tier admin system so institutions, organisers and students each got exactly the control they needed, and no more.',
    impact: 'Used by 100+ students for real assessments and contests.',
    stack: ['React', 'Node.js', 'Express', 'Firebase', 'Judge0', 'Cloud Run'],
  },
  {
    role: 'Software Engineering Intern',
    org: 'Praskla Technologies',
    icon: 'window',
    dates: 'Jul 2025 – Dec 2025',
    meta: 'Coimbatore',
    summary: 'Owned the entire application side of a client-facing textile CAD desktop app, working directly with clients.',
    chips: ['Client-facing', 'Electron', 'Full ownership'],
    context: 'A six-person team building production software for textile-industry clients, on client deadlines.',
    owned:
      'The full application side of an Electron CAD app, end to end: turning client feedback into shipped features, and a rebuild of the company’s public website in React and Tailwind.',
    decision:
      'Migrated the app’s routing architecture so it stayed maintainable as features grew, and reviewed every change before release instead of patching symptoms.',
    impact: 'Each client iteration shipped stable across multiple feedback cycles, which taught me what building for real users actually means.',
    stack: ['Electron', 'React', 'JavaScript', 'Tailwind CSS'],
  },
  {
    role: 'Software Engineer Intern',
    org: 'Stealth AI startup',
    icon: 'robot',
    dates: 'Aug 2026 – Present',
    meta: 'Founding team · Bangalore',
    current: true,
    summary: 'Founding-team engineer at a stealth AI startup, across production, backend foundations and voice AI.',
    chips: ['Founding team', 'Voice AI', 'Backend & infra'],
    context: 'An early-stage, multi-tenant SaaS company where a small team owns everything, including production.',
    owned:
      'First responder for production, six voice AI agents running live, and the backend foundations of a schema-per-tenant FastAPI and Postgres platform: migrations, caching and scheduled jobs.',
    decision:
      'Killed a pod crash loop on AWS EKS by tracing it through the logs to a runaway query starving Postgres, then fixing it with a query rewrite and targeted indices.',
    impact:
      'Replaced an LLM-based evaluation pipeline with a cheaper, deterministic sweep job, after benchmarking three LLMs on code-mixed Indian-language call transcripts.',
    stack: ['FastAPI', 'PostgreSQL', 'AWS EKS', 'Voice AI', 'LLMs'],
  },
]
