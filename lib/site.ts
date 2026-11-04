/**
 * SITE CONSTANTS
 *
 * Single place for identity + social handles so the homepage, the blog
 * chrome, the RSS feed and the metadata all agree.
 *
 * TODO(jeremy): replace the X handle below with your real one once the
 * account exists; it is referenced by the homepage social card, the blog
 * footer and the `twitter:creator` meta tag.
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
    x: { handle: "CrooksJeremy", url: "https://x.com/CrooksJeremy" },
  },
} as const;
