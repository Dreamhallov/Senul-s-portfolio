import lightLmsImg from '../assets/images/light_teacher_lms_showcase_1794644799161.jpg';
import lightTutesImg from '../assets/images/light_tutes_creation_desk_1794644797659.jpg';
import lightWebImg from '../assets/images/light_daily_web_studio_1794644798405.jpg';
import lightPortalImg from '../assets/images/light_student_portal_architecture_1794644799099.jpg';

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface ProjectCaseStudy {
  id: string;
  index: string;
  title: string;
  client: string;
  year: string;
  category: 'Teacher LMS' | 'Tutes & EdTech' | 'Web Systems';
  summary: string;
  challenge: string;
  solution: string;
  image: string;
  imageAlt: string;
  stack: string[];
  metrics: ProjectMetric[];
  liveUrl: string;
}

export interface ServiceBlueprint {
  stack: string[];
  freeTierNote: string;
  checklist: string[];
}

export interface ServiceItem {
  id: string;
  index: string;
  title: string;
  turnaround: string;
  description: string;
  deliverables: string[];
  iconName: 'GraduationCap' | 'BookOpenCheck' | 'LayoutTemplate' | 'Headphones';
  promptSeed: string;
  blueprint?: ServiceBlueprint;
}

export interface TechStackNode {
  id: string;
  name: string;
  discipline: string;
  description: string;
  experience: string;
}

export const PROFILE = {
  name: 'Senul Jayaweera',
  role: 'Creative Developer · Teacher LMS & Web Studio',
  location: 'Colombo, Sri Lanka',
  timeZone: 'Asia/Colombo',
  email: 'senuljayaweera47@gmail.com',
  social: {
    x: 'https://x.com/S28308Senul',
    instagram: 'https://www.instagram.com/dreamhallow/',
  },
  studioImage: lightWebImg,
};

export const MARQUEE_ITEMS = [
  'Aesthetic Teacher LMS',
  'Tutes Creation Systems',
  'Daily Website Building',
  'Student Cohort Portals',
  '3D Scroll Interactions',
  'Customer Care & AI Concierge',
  'Modern Geometric Typography',
  'Clean Productivity UI',
];

export const PROJECTS: ProjectCaseStudy[] = [
  {
    id: 'atelier-teacher-lms',
    index: '01',
    title: 'Atelier Teacher LMS',
    client: 'Demo Showcase · Educators',
    year: '2026',
    category: 'Teacher LMS',
    summary:
      'A calm daylight-first Teacher LMS concept built for batch attendance, live class schedules, assignment grading, and student progress tracking.',
    challenge:
      'Traditional LMS tools feel cluttered and fatiguing during daily teaching sessions and grading workflows.',
    solution:
      'Designed an airy paper-tone workspace with distraction-free student analytics, one-click class rosters, and crisp typographic hierarchy.',
    image: lightLmsImg,
    imageAlt: 'Silver aluminum monitor on warm travertine desk displaying a clean light-mode Teacher LMS overview dashboard',
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'Motion'],
    metrics: [
      { label: 'Instructor Speed', value: '3.2x faster' },
      { label: 'Student Clarity', value: '96% score' },
      { label: 'First Paint', value: '0.6 s' },
    ],
    liveUrl: 'https://x.com/S28308Senul',
  },
  {
    id: 'linen-tutes-vault',
    index: '02',
    title: 'Linen Tutes & Study Vault',
    client: 'Demo Showcase · Tutes Creation',
    year: '2026',
    category: 'Tutes & EdTech',
    summary:
      'Modular digital tutes library pairing structured lesson chapters, printable worksheets, video timestamps, and interactive study cards.',
    challenge:
      'Loose PDF links and scattered folders interrupt student revision and make self-paced learning difficult.',
    solution:
      'Crafted an editorial tutes publishing flow with organized module grids, clear reading typography, and instant checkpoint reviews.',
    image: lightTutesImg,
    imageAlt: 'Minimalist overhead desk layout on warm paper showing modular tutorial cards and silver tablet',
    stack: ['React', 'GSAP', 'MDX Engine', 'TypeScript', 'Edge Storage'],
    metrics: [
      { label: 'Sample Tute Packs', value: '120+ units' },
      { label: 'Focus Dwell', value: '42 min' },
      { label: 'Mobile Friendly', value: '100%' },
    ],
    liveUrl: 'https://www.instagram.com/dreamhallow/',
  },
  {
    id: 'daily-web-craft',
    index: '03',
    title: 'Daily Studio Web Builds',
    client: 'Demo Showcase · Web Craft',
    year: '2026',
    category: 'Web Systems',
    summary:
      'High-craft daily websites featuring crisp geometric sans-serif grids, 3D scroll sculptures, and fast responsive execution.',
    challenge:
      'Launching bespoke websites daily without falling back on rigid, generic templates.',
    solution:
      'Built a clean modular design system powered by Lenis inertial scroll, Three.js light sculptures, and purposeful motion.',
    image: lightWebImg,
    imageAlt: 'Modern daylight creative studio table with laptop showing minimalist wireframe layout grids',
    stack: ['Next.js', 'Three.js', 'GSAP ScrollTrigger', 'Lenis', 'Tailwind CSS'],
    metrics: [
      { label: 'Turnaround', value: '1–3 days' },
      { label: 'Lighthouse Perf', value: '99 / 100' },
      { label: 'Frame Rate', value: '60 fps' },
    ],
    liveUrl: 'https://x.com/S28308Senul',
  },
  {
    id: 'lumina-study-pavilion',
    index: '04',
    title: 'Lumina Student Space',
    client: 'Demo Showcase · Campus Portal',
    year: '2025',
    category: 'Teacher LMS',
    summary:
      'Unified cohort portal combining live class links, downloadable tutes, weekly study schedules, and direct teacher feedback.',
    challenge:
      'Students juggling multiple classes need a single calm home for lessons, recordings, and upcoming deadlines.',
    solution:
      'Created a daylight-calibrated student workspace with instant timetable clarity and direct teacher messaging.',
    image: lightPortalImg,
    imageAlt: 'Bright sunlit architectural study pavilion with pale travertine tables and modern laptop workspace',
    stack: ['React 19', 'TypeScript', 'Framer Motion', 'AI Concierge'],
    metrics: [
      { label: 'Cohort Capacity', value: '2,400+' },
      { label: 'Uptime Target', value: '99.9%' },
      { label: 'Support Coverage', value: '24/7 AI' },
    ],
    liveUrl: 'https://www.instagram.com/dreamhallow/',
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'service-lms',
    index: '01',
    title: 'Aesthetic Teacher LMS',
    turnaround: '5–10 Days · Custom Built',
    description:
      'Calm, modern learning management systems tailored for teachers and academies—with batch management, attendance, grading, and student analytics.',
    deliverables: ['Teacher & Student Portals', 'Class Schedules & Attendance', 'Assignment & Grade Tracking'],
    iconName: 'GraduationCap',
    promptSeed: 'I want to build an Aesthetic Teacher LMS for my classes. Tell me how it works and what details you need.',
    blueprint: {
      stack: ['React / Next.js', 'TypeScript', 'PostgreSQL or Supabase', 'Tailwind CSS'],
      freeTierNote: 'Deployable on Vercel + Supabase / Cloudflare free tiers with $0 AI concierge fees.',
      checklist: ['Role-based Teacher & Student login', 'CSV batch attendance export', 'Instant deadline & class timetable cards'],
    },
  },
  {
    id: 'service-tutes',
    index: '02',
    title: 'Tutes & Study Creation',
    turnaround: '3–7 Days · Modular System',
    description:
      'Structured digital tutes hubs that organize notes, PDF packs, video lessons, and revision checkpoints into an inviting study workflow.',
    deliverables: ['Interactive Tute Packs', 'PDF & Video Lesson Pairing', 'Chapter Progress Checks'],
    iconName: 'BookOpenCheck',
    promptSeed: 'I need a Tutes & Study Creation platform for my students. Can you share options?',
    blueprint: {
      stack: ['React', 'MDX Chapter Engine', 'Watermark PDF Guard', 'Edge CDN'],
      freeTierNote: 'Runs cleanly on GitHub Pages, Cloudflare Pages, or Vercel static edge ($0/mo hosting).',
      checklist: ['Unit chapter & topic tagging', 'Video timestamp jump-links', 'Printable A4 summary cards'],
    },
  },
  {
    id: 'service-web',
    index: '03',
    title: 'Daily Website Building',
    turnaround: '1–4 Days · Rapid Launch',
    description:
      'Clean, distinctive websites crafted daily—combining modern geometric typography, light editorial layouts, and subtle 3D scroll craft.',
    deliverables: ['Custom Brand Landing Pages', '3D & Scroll Choreography', 'Mobile & SEO Optimization'],
    iconName: 'LayoutTemplate',
    promptSeed: 'I want a modern custom website built fast. What information do you need to start?',
    blueprint: {
      stack: ['Vite / React', 'Three.js WebGL', 'GSAP ScrollTrigger', 'Space Grotesk + DM Sans'],
      freeTierNote: 'Static-ready architecture deploys directly to GitHub Pages with custom domain SSL included.',
      checklist: ['60fps WebGL & pointer parallax', 'OpenGraph social share metadata', '99+ mobile Lighthouse score target'],
    },
  },
  {
    id: 'service-support',
    index: '04',
    title: 'Customer Care & AI Support',
    turnaround: 'Ongoing · Dedicated Care',
    description:
      'Reliable post-launch maintenance, daily tutes/content updates, speed tuning, and unlimited 24/7 AI customer helper integration.',
    deliverables: ['Unlimited AI Customer Helper', 'Direct Email Inquiry Routing', 'Priority Updates & Care'],
    iconName: 'Headphones',
    promptSeed: 'Tell me about your ongoing customer service and AI helper integration.',
    blueprint: {
      stack: ['Unlimited Browser AI Engine', 'Image Brief Attachments', 'Direct Mail Dispatch'],
      freeTierNote: 'Zero paid LLM tokens—runs unlimited client chats locally + routes full briefs via email.',
      checklist: ['24/7 FAQ & scope memory extraction', 'Screenshot/mockup upload forwarding', 'Same-day UI & copy refreshes'],
    },
  },
];

export const STACK_NODES: TechStackNode[] = [
  {
    id: 'lms',
    name: 'Teacher LMS Systems',
    discipline: 'Productivity & Cohorts',
    description:
      'Clean teacher command centers, batch enrollment, attendance logs, and distraction-free student portals crafted for everyday teaching.',
    experience: 'Core Focus',
  },
  {
    id: 'tutes',
    name: 'Aesthetic Tutes Creation',
    discipline: 'Structured Learning UI',
    description:
      'Editorial lesson layouts, modular PDF/video study packs, and clear progress indicators that keep learners focused.',
    experience: 'Core Focus',
  },
  {
    id: 'web-daily',
    name: 'Daily Website Building',
    discipline: 'Rapid High-Craft Delivery',
    description:
      'Purpose-built websites shipped rapidly with modern geometric sans-serif typography, crisp spacing, and zero bloat.',
    experience: 'Daily Craft',
  },
  {
    id: 'threejs',
    name: '3D Scroll Sculptures',
    discipline: 'Three.js & WebGL',
    description:
      'Light-theme translucent crystal and pearlescent 3D scenes that react effortlessly to scroll depth and pointer motion.',
    experience: 'Interactive 3D',
  },
  {
    id: 'ai-care',
    name: 'AI Customer Helper',
    discipline: 'Unlimited Concierge & Mail',
    description:
      'Built-in intelligent customer assistant with unlimited chat availability and direct inquiry email dispatch to senuljayaweera47@gmail.com.',
    experience: 'Automation',
  },
  {
    id: 'gsap',
    name: 'GSAP & Lenis Physics',
    discipline: 'Inertial Motion Systems',
    description:
      'Silky-smooth wheel interpolation, pinned horizontal showcases, and accessible reduced-motion compliance.',
    experience: 'Motion Stack',
  },
];
