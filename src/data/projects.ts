// Featured projects (placeholder content — swap images/links in as they're ready)
export type Project = {
  title: string
  tagline: string
  description: string
  stack: string[]
  status: 'Live' | 'Coming up'
  image?: string // screenshot path; a pixel placeholder shows until this is set
  howItWorks: string
  demo?: string
}

export const projects: Project[] = [
  {
    title: 'VibeAudit',
    tagline: 'AI design auditor for any website',
    description:
      'Replaces manual design QA with automated analysis. A browser agent crawls your site viewport by viewport, scores CTAs, theme consistency and intent alignment, and returns a screenshot-backed report from 0 to 100.',
    stack: ['React', 'Flask', 'Gemini', 'Browser-use', 'Playwright', 'Socket.io'],
    status: 'Live',
    howItWorks: '#',
    demo: 'https://vibeaudit-delta.vercel.app',
  },
  {
    title: 'AlgoFlow',
    tagline: 'Code to interactive flowcharts, in real time',
    description:
      'Turns Python or JavaScript into explorable flowcharts as you type, mapping conditionals, loops and recursion. An AI tutor with memory explains each branch and remembers what you have already learned.',
    stack: ['React', 'Node.js', 'Gemini', 'Mem0', 'React Flow'],
    status: 'Live',
    howItWorks: '#',
    demo: 'https://algo-flow-roan.vercel.app',
  },
  {
    title: 'Syntax',
    tagline: 'Contest platform for campuses and coding clubs',
    description:
      'Timed quizzes, coding challenges and multi-round competitions with a multi-level admin system. Judge0 runs and grades submissions securely, and live leaderboards update in real time for 100+ students.',
    stack: ['React', 'Node.js', 'Firebase', 'Judge0'],
    status: 'Live',
    howItWorks: '#',
    demo: 'https://syntax-nu.vercel.app/',
  },
  {
    title: 'damn.js',
    tagline: 'Chrome DevTools extension that explains your errors',
    description:
      'Mirrors console errors into a DevTools panel in real time. Hit Explain for contextual AI analysis with docs, or Spell to get a ready-to-paste debugging prompt for Claude, Cursor or ChatGPT.',
    stack: ['Manifest V3', 'JavaScript', 'Node.js', 'Gemini', 'Vercel'],
    status: 'Live',
    howItWorks: '#',
    demo: 'https://damn-js-lp.vercel.app/',
  },
]
