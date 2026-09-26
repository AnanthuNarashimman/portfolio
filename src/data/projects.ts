import syntaxShot from '../assets/projects/syntax.webp'
import algoflowShot from '../assets/projects/algoflow.webp'
import damnjsShot from '../assets/projects/damnjs.webp'
import vibeauditShot from '../assets/projects/vibeaudit.webp'
import shipstatShot from '../assets/projects/shipstat.webp'
import orchatShot from '../assets/projects/orchat.webp'
import trimtweetShot from '../assets/projects/trimtweet.webp'
import genteachShot from '../assets/projects/genteach.webp'
import pingmyphoneShot from '../assets/projects/pingmyphone.webp'
import termiShot from '../assets/projects/termi.webp'

// Featured projects. `detail` powers the /projects/:slug "How it works" page; projects without it
// show the card only. Screenshots drop in via `image`; a pixel placeholder shows until then.

export type ProjectDetail = {
  problem: string
  build: string
  highlights: { title: string; text: string }[]
  flowTitle?: string // defaults to "How it flows"
  flow: { title: string; text: string }[]
  stack: { group: string; items: string[] }[]
  rolesTitle?: string // defaults to "Who does what"
  roles?: { role: string; can: string[] }[]
  takeaway: string
  // Forward-looking plan, shown as "Where it's going"
  next?: {
    status: string
    headline: string
    summary: string
    ideas: { title: string; text: string }[]
    phases: { title: string; text: string }[]
  }
}

// Category badges; the /projects page filters by these
export const categories = ['AI & agents', 'Developer tools', 'Learning', 'Utilities'] as const
export type Category = (typeof categories)[number]

export type Project = {
  slug: string
  category: Category
  featured?: boolean // shown on the home page
  title: string
  tagline: string
  description: string
  stack: string[]
  status: 'Live' | 'Offline' | 'Local'
  image?: string
  github?: string
  demo?: string
  detail?: ProjectDetail
}

export const projects: Project[] = [
  {
    slug: 'syntax',
    category: 'Learning',
    featured: true,
    title: 'Syntax',
    tagline: 'Contest platform for campuses and coding clubs',
    description:
      'Quizzes and coding contests with live proctoring, encrypted submissions and real-time leaderboards. Judge0 grades code in five languages, and a three-tier admin system runs it all.',
    stack: ['React', 'Node.js', 'Express', 'Firebase', 'Judge0', 'Cloud Run'],
    status: 'Live',
    image: syntaxShot,
    github: 'https://github.com/AnanthuNarashimman/Syntax',
    demo: 'https://syntax-nu.vercel.app/',
    detail: {
      problem:
        'Colleges run coding assessments on tools built for recruiters or hobbyists: no proctoring, no control over who sees what, and no way to rescue a student whose Wi-Fi dropped mid-exam. Faculty end up juggling spreadsheets, Google Forms and a separate judge.',
      build:
        'Syntax puts the whole assessment loop in one place. Admins build a quiz or a multi-problem coding contest, schedule it for a department, and watch it live. Students code in a VS Code–style editor, run against sample tests, and submit into an exam mode that notices when they leave the tab.',
      highlights: [
        { title: 'Live proctoring', text: 'Tab switches, window blur and fullscreen exits are logged with timestamps; repeated violations auto-submit in strict exam mode.' },
        { title: 'Encrypted submissions', text: 'Code is RSA-encrypted in the browser before it leaves, so answers can’t be read or tampered with in transit.' },
        { title: 'Real code execution', text: 'Judge0 compiles and runs Python, Java, C++, C and JavaScript in a sandbox against visible and hidden test cases.' },
        { title: 'Failsafe reopen', text: 'If a student’s network or browser dies, an admin can reset just their attempt, score and proctoring log.' },
      ],
      flowTitle: 'How a submission travels',
      flow: [
        { title: 'Write', text: 'Student solves in the Monaco editor; progress auto-saves.' },
        { title: 'Encrypt', text: 'Submission is RSA-encrypted client-side with a per-session key.' },
        { title: 'Judge', text: 'Backend decrypts and Judge0 runs it against hidden tests.' },
        { title: 'Record', text: 'Score and proctoring log land in Firestore.' },
        { title: 'Rank', text: 'Leaderboard updates live; admins export to Excel.' },
      ],
      stack: [
        { group: 'Frontend', items: ['React 18', 'Vite', 'Monaco Editor', 'React Router', 'Axios'] },
        { group: 'Backend', items: ['Node.js', 'Express', 'Firebase Admin SDK', 'Firestore'] },
        { group: 'Code execution', items: ['Judge0 CE', 'RapidAPI'] },
        { group: 'Security', items: ['RSA-2048', 'JWT (httpOnly)', 'bcrypt', 'CORS allow-list'] },
        { group: 'Infra', items: ['Google Cloud Run', 'Docker', 'Secret Manager', 'Vercel'] },
      ],
      roles: [
        { role: 'Student', can: ['Take quizzes and coding contests', 'Run code against samples', 'Read practice articles'] },
        { role: 'Admin', can: ['Build and schedule contests', 'Watch leaderboards and proctoring logs', 'Reopen attempts, bulk-import students'] },
        { role: 'Super admin', can: ['Create and remove admins', 'See every contest on the platform', 'Delete contests at the database level'] },
      ],
      takeaway:
        'The hard part wasn’t running code, it was trust: making a browser-based exam that faculty could rely on. Most of the work went into the unglamorous edges: encryption, violation logs and the “my internet died” failsafe.',
    },
  },
  {
    slug: 'vibeaudit',
    category: 'AI & agents',
    featured: true,
    title: 'VibeAudit',
    tagline: 'AI design auditor for any website',
    description:
      'Replaces manual design QA with automated analysis. A browser agent crawls your site viewport by viewport, scores CTAs, theme consistency and intent alignment, and returns a screenshot-backed report.',
    stack: ['React', 'Flask', 'Gemini', 'Browser-use', 'Playwright', 'Socket.io'],
    status: 'Live',
    image: vibeauditShot,
    github: 'https://github.com/AnanthuNarashimman/QAI',
    demo: 'https://vibeaudit-delta.vercel.app',
    detail: {
      problem:
        'Web QA has a tool for everything except design. Lighthouse checks performance, Ahrefs checks SEO, ZAP checks security, but “does this CTA stand out?” and “does this still look like one brand?” are answered by someone scrolling and squinting. It is slow, subjective and doesn’t scale.',
      build:
        'VibeAudit audits the design-facing side of a site the way a reviewer would. You give it a URL and describe what the site is meant to achieve; an AI agent crawls the pages, scrolls each one viewport by viewport like a real visitor, and returns a scored report where every issue points at the screenshot it came from.',
      highlights: [
        { title: 'Intent-aware', text: 'Your plain-English goal is parsed into structured criteria (type, tone, audience, theme) that the agent checks every page against.' },
        { title: 'Viewport by viewport', text: 'The agent scrolls section by section like a visitor, instead of judging one full-page screenshot.' },
        { title: 'Live agent timeline', text: 'Every thought, action and finding streams to the UI over WebSockets while the audit runs.' },
        { title: 'Evidence + export', text: 'Issues are tied to the screenshot where they were found, graded 0–100 with A–F, and exportable as a PDF.' },
      ],
      flowTitle: 'How an audit runs',
      flow: [
        { title: 'Configure', text: 'URL, up to 5 pages, and your design intent in plain English.' },
        { title: 'Parse', text: 'Gemini 2.5 Flash Lite turns the intent into structured criteria.' },
        { title: 'Crawl', text: 'A BFS crawler queues same-domain pages.' },
        { title: 'Analyse', text: 'Gemini 3 Pro drives a browser agent through each viewport.' },
        { title: 'Report', text: 'Scored breakdown with screenshot evidence, streamed live, exported to PDF.' },
      ],
      stack: [
        { group: 'Frontend', items: ['React 19', 'Vite 7', 'Socket.io client', 'React Router 7', 'html2pdf.js'] },
        { group: 'Backend', items: ['Python', 'Flask', 'Flask-SocketIO', 'NetworkX (BFS)'] },
        { group: 'AI', items: ['Gemini 2.5 Flash Lite', 'Gemini 3 Pro Preview'] },
        { group: 'Browser', items: ['browser-use', 'Browser Use Cloud', 'Playwright'] },
        { group: 'Infra', items: ['Vercel', 'Render'] },
      ],
      rolesTitle: 'What it audits',
      roles: [
        { role: 'CTA effectiveness', can: ['Button visibility and contrast', 'Placement and copywriting', 'Conversion potential'] },
        { role: 'Theme consistency', can: ['Palette coherence across pages', 'Typography and spacing', 'Overall visual harmony'] },
        { role: 'Intent alignment', can: ['Does the design match the brief?', 'Tone and audience fit', 'Whether the main action leads'] },
      ],
      takeaway:
        'It demos beautifully, and that is exactly the trap. Run it twice and the scores move, because the model is doing detection, scoring and explanation all at once. A number nobody can reproduce is a number nobody acts on, which is why it is being rebuilt.',
      next: {
        status: 'Proposal · not started',
        headline: 'From AI vibe-scores to a design-drift detector',
        summary:
          'Contrast checkers, visual-regression tools and “AI roasts your landing page” wrappers already exist. What doesn’t: intent-aware critique backed by evidence, and design drift measured over time, like “your site broke its own design system between Tuesday and Friday, and here’s exactly where.”',
        ideas: [
          { title: 'The model never emits a score', text: 'Playwright plus a rule engine detects, plain arithmetic scores, and Gemini only explains. Reproducibility comes from the model no longer being load-bearing.' },
          { title: 'Rules calibrated by the site itself', text: 'Infer the real palette, type scale and spacing unit from what’s rendered, then flag deviation. It measures inconsistency, not taste, with zero config.' },
          { title: 'Scores that show their maths', text: '“Theme 68: −12 for 4 off-palette colours, −10 for 19 font sizes…” Anyone can argue with a weight; nobody can say it was made up.' },
          { title: 'History and diffs', text: 'Persist every run, fingerprint each violation, and diff runs into new, fixed and persisting, with a score-over-time line per category.' },
        ],
        phases: [
          { title: 'Strip', text: 'One Playwright load per page; halve cost and latency.' },
          { title: 'Probe', text: 'Harvest computed styles, CTAs and a11y per viewport.' },
          { title: 'Rules', text: 'Self-calibrated, WCAG and CTA rules with a pure scorer.' },
          { title: 'Persist', text: 'Postgres + object storage; reports survive a refresh.' },
          { title: 'Explain', text: 'Gemini narrates violations and judges intent, never scores.' },
          { title: 'Diff', text: 'New / fixed / persisting across runs; real history page.' },
          { title: 'Rule packs', text: 'Declare your design system in vibeaudit.yml.' },
        ],
      },
    },
  },
  {
    slug: 'algoflow',
    category: 'Learning',
    featured: true,
    title: 'AlgoFlow',
    tagline: 'Code to interactive flowcharts, in real time',
    description:
      'Turns Python or JavaScript into explorable flowcharts, mapping conditionals, loops and recursion, with Big-O complexity. An AI tutor with memory explains each branch. Bring your own Gemini key.',
    stack: ['React', 'Express', 'Gemini', 'Mem0', 'React Flow', 'Monaco'],
    status: 'Live',
    image: algoflowShot,
    github: 'https://github.com/AnanthuNarashimman/AlgoFlow',
    demo: 'https://algo-flow-roan.vercel.app',
    detail: {
      problem:
        'Writing code is easy; understanding what it actually does is hard. Students trace loops and recursion in their heads (or on paper), and when the mental model breaks, they don’t know where. Most visualisers only work on canned examples, not the code you just wrote.',
      build:
        'AlgoFlow takes whatever Python or JavaScript you type and turns it into a flowchart you can zoom, pan and explore, with the time and space complexity alongside. Stuck on a branch? An AI tutor answers in the context of your code, and remembers what you have already learned across sessions.',
      highlights: [
        { title: 'Your code, not examples', text: 'Paste or write anything in the Monaco editor; Gemini maps declarations, branches, loops, calls, returns and recursion into nodes and edges.' },
        { title: 'Interactive flowcharts', text: 'React Flow renders the graph so you can zoom, pan and follow a path instead of squinting at a static image.' },
        { title: 'Complexity built in', text: 'Every chart comes with Big-O time and space, plus a one-line reason for each.' },
        { title: 'A tutor that remembers', text: 'Mem0 stores past conversations, so the tutor knows which concepts you have covered and which mistakes keep coming back.' },
      ],
      flowTitle: 'From code to chart',
      flow: [
        { title: 'Write', text: 'Code goes into the Monaco editor with syntax highlighting.' },
        { title: 'Analyse', text: 'POST /api/generate sends it to Gemini 2.5 Flash Lite.' },
        { title: 'Structure', text: 'The model returns nodes, edges and complexity as JSON.' },
        { title: 'Render', text: 'React Flow draws the interactive flowchart.' },
        { title: 'Ask', text: 'The tutor recalls past context from Mem0, answers, and remembers.' },
      ],
      stack: [
        { group: 'Frontend', items: ['React 19', 'Vite 7', 'Monaco Editor', 'React Flow', 'GSAP', 'Framer Motion'] },
        { group: 'Backend', items: ['Node.js', 'Express 5'] },
        { group: 'AI', items: ['Gemini 2.5 Flash Lite', 'Mem0 memory'] },
        { group: 'Security', items: ['BYOK', 'AES-256-GCM', 'HttpOnly cookies'] },
        { group: 'Infra', items: ['Vercel', 'Render'] },
      ],
      rolesTitle: 'Bring your own key',
      roles: [
        { role: 'Your key', can: ['Paste a Gemini key from AI Studio', 'Free-tier keys work', 'No credit card to start'] },
        { role: 'Never stored', can: ['Validated over HTTPS', 'Encrypted with AES-256-GCM', 'Returned as an HttpOnly cookie, never written to a DB or log'] },
        { role: 'Always yours', can: ['Remove it with one click', 'Expires automatically in 7 days', 'Decrypted in memory per request only'] },
      ],
      takeaway:
        'Running an AI tool on my own key doesn’t scale past a demo. Letting people bring theirs meant designing for trust first: the server can use the key for one request, but it never gets to keep it.',
    },
  },
  {
    slug: 'damn-js',
    category: 'Developer tools',
    featured: true,
    title: 'damn.js',
    tagline: 'Chrome DevTools extension that explains your errors',
    description:
      'Mirrors console errors into a DevTools panel in real time. Hit Explain for contextual AI analysis with docs, or Spell to get a ready-to-paste debugging prompt for Claude, Cursor or ChatGPT.',
    stack: ['Manifest V3', 'JavaScript', 'DevTools API', 'Express', 'Gemini', 'Vercel'],
    status: 'Live',
    image: damnjsShot,
    github: 'https://github.com/AnanthuNarashimman/damn.js',
    demo: 'https://damn-js-lp.vercel.app/',
    detail: {
      problem:
        'An error shows up in the console and the ritual starts: copy it, search it, open three tabs, paste it into an AI chat, then go back and add the stack trace and context you forgot. The error lives in DevTools, but all the help lives somewhere else.',
      build:
        'damn.js puts the help next to the error. A DevTools panel mirrors every console error, uncaught exception and rejected promise as it happens. One click explains it with likely causes and docs; another writes a structured “spell” you can paste straight into Claude, Cursor or ChatGPT. It doesn’t auto-fix anything; it helps you understand.',
      highlights: [
        { title: 'Real-time mirroring', text: 'Hooks console.error, window.onerror and unhandled promise rejections, and streams them into a dedicated panel with filters.' },
        { title: 'Explain', text: 'Sends the error to the backend for a plain explanation, likely causes, practical fixes and links to MDN and Stack Overflow.' },
        { title: 'Spell', text: 'Builds a structured debugging prompt with the error, stack trace, recent history and pointed questions, ready to copy.' },
        { title: 'Stays in DevTools', text: 'No tab-hopping: capture, explanation and prompt all live in the same panel as your console.' },
      ],
      flowTitle: 'How an error travels',
      flow: [
        { title: 'Capture', text: 'An injected script hooks the page’s error sources.' },
        { title: 'Bridge', text: 'window.postMessage hands it to the content script.' },
        { title: 'Display', text: 'The damn.js DevTools panel shows it in real time.' },
        { title: 'Ask', text: 'Explain or Spell calls the serverless API.' },
        { title: 'Answer', text: 'Gemini returns an explanation or a ready-to-paste prompt.' },
      ],
      stack: [
        { group: 'Extension', items: ['Manifest V3', 'Vanilla JS + CSS', 'chrome.devtools.panels', 'chrome.runtime', 'window.postMessage'] },
        { group: 'Backend', items: ['Node.js', 'Express', 'Vercel serverless'] },
        { group: 'AI', items: ['Gemini'] },
        { group: 'Landing', items: ['HTML', 'CSS', 'Vercel'] },
      ],
      rolesTitle: 'Explain vs Spell',
      roles: [
        { role: 'Explain', can: ['What the error actually means', 'Likely causes and practical fixes', 'Docs from MDN and Stack Overflow'] },
        { role: 'Spell', can: ['Error details and stack trace', 'Recent error history for context', 'Specific questions for your AI tool'] },
        { role: 'Neither auto-fixes', can: ['You stay in charge of the change', 'Works with whichever assistant you use', 'Built to teach, not to hide the bug'] },
      ],
      takeaway:
        'It came out of hackathon debugging, where every minute spent switching tabs is a minute not shipping. The best tool turned out not to be one that fixes the bug for you, but one that gets the right context to the right place in one click.',
      next: {
        status: 'v1 works · v2 in progress',
        headline: 'From load-unpacked to the Web Store',
        summary:
          'v1 is fully functional with a hosted backend, installed via “Load unpacked” since it isn’t on the Chrome Web Store yet. The next stretch is about smarter context and shipping it properly.',
        ideas: [
          { title: 'Pattern recognition', text: 'Recognise the usual suspects (CORS, TypeError, failed 500s) and answer them faster and more precisely.' },
          { title: 'Framework-aware errors', text: 'Understand React, Vue and Next.js error shapes instead of treating everything as a raw stack trace.' },
          { title: 'Source maps', text: 'Map minified production errors back to the original source so explanations point at real code.' },
          { title: 'Network failures', text: 'Optionally pull in failed requests alongside console errors for fuller context.' },
        ],
        phases: [
          { title: 'Mirror', text: 'Capture pipeline and live DevTools panel. Done.' },
          { title: 'Explain + Spell', text: 'Backend API and Gemini integration.' },
          { title: 'Polish', text: 'UI refinements, DevTools theme sync, cleaner parsing.' },
          { title: 'Publish', text: 'Production backend and Chrome Web Store release.' },
        ],
      },
    },
  },
  {
    slug: 'shipstat',
    category: 'Developer tools',
    title: 'shipstat',
    tagline: 'Honest npm download stats, with cards worth sharing',
    description:
      'All-time and weekly downloads, release impact and version adoption for any npm package, straight from npm with nothing estimated. npm’s zero-data days are flagged instead of drawn as crashes, and every package gets a share card that unfurls anywhere.',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind 4', 'SVG charts', 'ISR'],
    status: 'Live',
    image: shipstatShot,
    github: 'https://github.com/AnanthuNarashimman/shipstat',
    demo: 'https://shipstat.ananthu.xyz',
  },
  {
    slug: 'trimtweet',
    category: 'AI & agents',
    title: 'TrimTweet',
    tagline: 'AI post optimizer for X',
    description:
      'Paste a long post and get one that fits X’s 280 characters while keeping your voice, with 3–5 smart hashtags and one-click copy. Gemini 2.5 Flash Lite does the trimming on Vercel serverless functions.',
    stack: ['React 19', 'Vite', 'Gemini', 'Vercel Functions'],
    status: 'Live',
    image: trimtweetShot,
    github: 'https://github.com/AnanthuNarashimman/trim_tweet',
    demo: 'https://trim-tweetx.vercel.app/',
  },
  {
    slug: 'termi',
    category: 'AI & agents',
    title: 'Termi',
    tagline: 'Natural language to PowerShell, with a human in the loop',
    description:
      'Describe what you want and a Gemini-powered CLI agent proposes the PowerShell command with a plain-English explanation. Nothing runs until you confirm, and everything executes inside a sandboxed workspace folder.',
    stack: ['Python', 'Gemini 2.5 Flash', 'PowerShell', 'google-genai'],
    status: 'Local',
    image: termiShot,
    github: 'https://github.com/AnanthuNarashimman/Termi',
  },
  {
    slug: 'or-chat',
    category: 'AI & agents',
    title: 'OR Chat',
    tagline: 'Local LLM chat with semantic memory',
    description:
      'Built to try out OpenRouter: switch between free NVIDIA, Arcee and StepFun models in one chat, while Pinecone gives conversations long-term semantic memory. A small, finished experiment that runs locally.',
    stack: ['Node.js', 'Express', 'OpenRouter', 'Pinecone'],
    status: 'Local',
    image: orchatShot,
    github: 'https://github.com/AnanthuNarashimman/or-chat',
  },
  {
    slug: 'genteach',
    category: 'Learning',
    title: 'GenTeach',
    tagline: 'AI studio for bite-sized learning content',
    description:
      'Turns a prompt into scripts, quizzes, audio summaries and short videos: Gemini writes, Vertex AI draws, Google TTS narrates and MoviePy stitches it together, with an admin approval queue in front to keep costs in check.',
    stack: ['React', 'Flask', 'Gemini', 'Vertex AI', 'Cloud TTS', 'MoviePy', 'Firebase'],
    status: 'Offline',
    image: genteachShot,
    github: 'https://github.com/AnanthuNarashimman/GenTeach',
  },
  {
    slug: 'pingmyphone',
    category: 'Utilities',
    title: 'Ping My Phone',
    tagline: 'Scheduled reminders, delivered on Telegram',
    description:
      'Set a reminder for any date and time in IST and a Telegram bot delivers it. GitHub Actions trigger the sends on a schedule, so each reminder lands within 15 minutes of its time, with full create, edit and delete from a dashboard.',
    stack: ['Flask', 'Firebase', 'Telegram Bot API', 'GitHub Actions'],
    status: 'Offline',
    image: pingmyphoneShot,
    github: 'https://github.com/AnanthuNarashimman/PingMyPhone',
  },
]

// Published npm packages (shown as their own block under the project cards)
export type NpmPackage = {
  name: string
  oneLiner: string
  downloads: number
  npm: string
}

export const npmPackages: NpmPackage[] = [
  {
    name: 'tracetel',
    oneLiner: 'Turns every Composio tool call into an OpenTelemetry span, streamed to Agnost or any OTel backend.',
    downloads: 983,
    npm: 'https://www.npmjs.com/package/tracetel',
  },
  {
    name: '@flash_dev/agent-smith',
    oneLiner: 'A goal-fidelity watchdog for AI coding agents: flags every risky action that contradicts what you said you were building.',
    downloads: 105,
    npm: 'https://www.npmjs.com/package/@flash_dev/agent-smith',
  },
]
