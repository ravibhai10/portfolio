// Single source of truth for portfolio content.
//
// REAL-DATA POLICY: every URL/contact below was verified against the repo.
// Nothing real was found (no socials, emails, or project links exist in the
// codebase), so all link fields are null and the UI hides those buttons or
// marks the section editable. Fill these in to go live — no code changes needed.
export interface Project {
  no: string
  name: string
  category: string
  description: string
  stack: string[]
  accent: string
  liveUrl: string | null
  githubUrl: string | null
}

export const PROFILE = {
  name: 'ravikumar gupta',
  role: 'Creative Full-Stack Developer',
  headline: ['Building digital', 'experiences that', 'people remember.'],
  intro:
    'I build premium websites, AI-powered products, interactive experiences and modern full-stack applications.',
  aboutStatement: ['MORE', 'THAN', 'CODE.'],
  aboutBody:
    'I build digital experiences that combine engineering, design and interaction. B.Tech Electronics & Computer Engineering student working across full-stack development, AI / Generative AI, computer vision, interactive web experiences and embedded systems.',
  interests: [
    'Full-stack development',
    'AI / Generative AI',
    'Computer vision',
    'Interactive web',
    'Embedded systems',
  ],
  email: null as string | null,
  phone: null as string | null,
  socials: {
    linkedin: null as string | null,
    github: null as string | null,
    instagram: null as string | null,
  },
}

// Project list comes from the site brief (descriptions are the brief's own
// words). No repository/demo URLs exist in the repo, so links stay null and
// the UI renders "Case study on request" instead of inventing URLs.
export const PROJECTS: Project[] = [
  {
    no: '01',
    name: 'Apex Vision',
    category: 'Computer Vision · Multi-Camera System',
    description:
      'Multi-camera spatial synchronization and cinematic sports highlights — an auto-director system that fuses views into one complete picture.',
    stack: ['Python', 'OpenCV', 'Tracking', 'Video'],
    accent: '#b8532b',
    liveUrl: null,
    githubUrl: null,
  },
  {
    no: '02',
    name: 'Context-Aware Lip Reading',
    category: 'Deep Learning · Speech',
    description:
      'Computer vision plus deep learning plus speech generation — LipNet-style visual speech recognition with context awareness.',
    stack: ['Python', 'TensorFlow', 'Keras', 'OpenCV'],
    accent: '#6b8f71',
    liveUrl: null,
    githubUrl: null,
  },
  {
    no: '03',
    name: 'Smart Wheelchair',
    category: 'Embedded · Voice Control',
    description:
      'Voice-controlled wheelchair built on the LPC1768 microcontroller — assistive mobility through embedded speech control.',
    stack: ['Embedded C', 'LPC1768', 'Speech'],
    accent: '#7a6cae',
    liveUrl: null,
    githubUrl: null,
  },
  {
    no: '04',
    name: 'Medical Supply Manager',
    category: 'Database · Inventory',
    description:
      'Database-driven medical inventory system — stock tracking, requirements and reporting for clinical supplies.',
    stack: ['PostgreSQL', 'Node.js', 'Express'],
    accent: '#4a7fa5',
    liveUrl: null,
    githubUrl: null,
  },
  {
    no: '05',
    name: 'Student Manager',
    category: 'Database · DBMS',
    description:
      'Student management DBMS project — records, queries and reporting over a relational schema.',
    stack: ['PostgreSQL', 'SQL', 'Node.js'],
    accent: '#c0892e',
    liveUrl: null,
    githubUrl: null,
  },
]

/** Backend practice — revealed as the hero turntable shows its back side. */
export const BACKEND = {
  eyebrow: 'Backend Development',
  title: 'Systems behind the surface',
  copy: 'Node.js and Express APIs, Golang services, event streaming, and data models across PostgreSQL, MariaDB, MongoDB and Redis — built to stay fast, correct and legible.',
  tags: [
    'Node.js',
    'Express',
    'Golang',
    'REST APIs',
    'Event Streaming',
    'PostgreSQL',
    'MongoDB',
    'Redis',
    'Auth & Security',
  ],
} as const

export const SKILL_GROUPS: { title: string; items: string[] }[] = [
  { title: 'Frontend', items: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind CSS'] },
  { title: 'Backend', items: ['Node.js', 'Express', 'Golang'] },
  {
    title: 'AI / Computer Vision',
    items: ['Python', 'TensorFlow', 'Keras', 'OpenCV', 'MediaPipe', 'Generative AI'],
  },
  { title: 'Database', items: ['MongoDB', 'PostgreSQL', 'Redis'] },
  { title: 'Tools', items: ['Git', 'GitHub', 'VS Code', 'Figma', 'MATLAB', 'LTspice', 'Proteus'] },
  { title: 'Interaction', items: ['GSAP', 'Framer Motion', 'Three.js', 'React Three Fiber', 'Lenis'] },
]

export const SERVICES: { no: string; title: string; detail: string }[] = [
  { no: '01', title: 'Premium Portfolios', detail: 'Personal sites with editorial craft and motion.' },
  { no: '02', title: 'Business Websites', detail: 'Fast, credible sites that convert visitors.' },
  { no: '03', title: 'Interactive Experiences', detail: 'Scroll stories, canvases and playful UI.' },
  { no: '04', title: 'AI Web Applications', detail: 'Generative AI and vision features in the browser.' },
  { no: '05', title: 'Full-Stack Development', detail: 'APIs, databases and deploys, end to end.' },
]
