/**
 * SITE CONSTANTS
 *
 * Single place for identity + social handles so the homepage, the blog
 * chrome, the RSS feed and the metadata all agree.
 */
export const SITE = {
  name: "CrooksCodes",
  author: "Jeremy Crooks",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://crookscodes.com",
  email: "jeremy@crookscodes.com",
  location: "Halifax, Nova Scotia",
  socials: {
    github: { handle: "CrooksJeremy", url: "https://github.com/CrooksJeremy" },
    linkedin: { handle: "jeremygcrooks", url: "https://www.linkedin.com/in/jeremygcrooks" },
    x: { handle: "JermDots", url: "https://x.com/JermDots" },
  },
} as const;
