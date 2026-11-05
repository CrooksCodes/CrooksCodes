/**
 * Product truth shared by every world under app/<world>/.
 * Facts only. No visual decisions live here.
 */

export const person = {
  name: "Jeremy Crooks",
  brand: "CrooksCodes",
  domain: "crookscodes.com",
  email: "jeremy@crookscodes.com",
  city: "Halifax, Nova Scotia",
  role: "Full-stack developer",
  github: { handle: "CrooksJeremy", url: "https://github.com/CrooksJeremy" },
  linkedin: { handle: "jeremygcrooks", url: "https://www.linkedin.com/in/jeremygcrooks" },
  /** The hiring goal this page serves. Keep the copy honest about year 1. */
  goal: "cyber security co-op",
};

export type Project = {
  id: string;
  title: string;
  year: string;
  /** One-line, specific, no adjectives. */
  summary: string;
  /** What it does in two or three sentences. */
  body: string;
  stack: string[];
  href?: string;
  /** Real captures of the live site, taken 2026-11-04. */
  image?: { desktop: string; mobile: string };
  status: "live" | "building";
};

export const projects: Project[] = [
  {
    id: "table4two",
    title: "Table4Two",
    year: "2026",
    summary: "A shared-decision app for pairs. Ends the \"wherever you want\" standoff.",
    body: "Two people swipe through nearby restaurants on their own phones. The first place both say yes to is the match. Live sessions, no account needed to join one.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    href: "https://table4two-crookscodes.vercel.app",
    image: { desktop: "/projects/table4two.png", mobile: "/projects/table4two-mobile.png" },
    status: "live",
  },
  {
    id: "truecast",
    title: "Truecast",
    year: "2026",
    summary: "A weather app that doesn't pick favourites.",
    body: "Asks seven forecast models at once, surfaces the consensus, and shows where they disagree, so you can see how sure the forecast actually is.",
    stack: ["Svelte 5", "TypeScript", "Vite"],
    href: "https://truecast-crookscodes.vercel.app",
    image: { desktop: "/projects/truecast.png", mobile: "/projects/truecast-mobile.png" },
    status: "live",
  },
  {
    id: "streetwear",
    title: "Streetwear Storefront",
    year: "2026",
    summary: "An online store for a clothing brand, built instead of themed.",
    body: "Filterable shop, product pages, and a cart that remembers what you added. A hand-built alternative to an off-the-shelf Shopify theme.",
    stack: ["Next.js", "TypeScript", "Prisma", "Tailwind"],
    href: "https://streetwear-crookscodes.vercel.app",
    image: { desktop: "/projects/streetwear.png", mobile: "/projects/streetwear-mobile.png" },
    status: "live",
  },
  {
    id: "proving-ground",
    title: "Proving Ground",
    year: "2026",
    summary: "A player development app for youth soccer coaching staff.",
    body: "Evaluations seed development plans, which drive session plans and track progress, shared live across coaches. In progress.",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
    status: "building",
  },
];

export type TimelineEntry = {
  from: string; // "2026-06"
  to: string | null; // null = present
  label: string; // display dates, e.g. "Jun 2026 to present"
  role: string;
  org: string;
  body: string;
};

export const experience: TimelineEntry[] = [
  {
    from: "2026-06", to: null, label: "Jun 2026 to present",
    role: "Co-founder and web developer",
    org: "Dory Digital",
    body: "Co-run a Halifax web business. I build every client site from scratch, design through deployment.",
  },
  {
    from: "2026-05", to: null, label: "May 2026 to present",
    role: "Web developer",
    org: "One North End",
    body: "Maintain the One North End website and build internal tools for their programs and staff.",
  },
];

export const education: TimelineEntry[] = [
  {
    from: "2026-09", to: null, label: "Sep 2026 to 2030",
    role: "Bachelor of Computer Science",
    org: "Dalhousie University",
    body: "Year 1 of 4. Working toward cyber security.",
  },
  {
    from: "2024-09", to: "2026-06", label: "2024 to 2026",
    role: "Matrix Code",
    org: "One North End with Dalhousie University",
    body: "Full-stack development program combining hands-on project work with university coursework.",
  },
];

export type SkillGroup = { title: string; items: string[] };

export const skills: SkillGroup[] = [
  { title: "Languages", items: ["TypeScript", "JavaScript", "Java", "SQL", "HTML", "CSS"] },
  { title: "Frameworks", items: ["React", "React Native", "Next.js", "Node.js", "Express", "Svelte 5", "Tailwind CSS"] },
  { title: "Data and tools", items: ["PostgreSQL", "Prisma", "Supabase", "Git", "GitHub", "Postman", "Vite", "Vercel"] },
];

/** Section ids every world uses, so deep links are stable across worlds. */
export const sectionIds = ["about", "projects", "skills", "experience", "education", "contact"] as const;
export type SectionId = (typeof sectionIds)[number];
