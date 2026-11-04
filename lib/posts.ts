/**
 * BLOG POSTS (server-only)
 *
 * Posts are plain Markdown files in `content/posts/<slug>.md` with YAML
 * front-matter. This module reads them at build time (the blog routes are
 * statically generated) and exposes typed helpers for listing, tagging and
 * looking up a single post.
 *
 * Front-matter contract:
 *   title:    string            (required)
 *   date:     YYYY-MM-DD        (required — used for ordering)
 *   summary:  string            (required — card + meta description)
 *   tags:     string[]          (optional)
 *   draft:    boolean           (optional — hidden in production builds)
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type PostMeta = {
  slug: string;
  title: string;
  date: string;       // ISO date, YYYY-MM-DD
  summary: string;
  tags: string[];
  words: number;
  minutes: number;
  draft: boolean;
};

export type Post = PostMeta & { content: string };

const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const WORDS_PER_MINUTE = 220;

function readPostFile(file: string): Post {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);

  const title = String(data.title ?? slug);
  const date = toIsoDate(data.date);
  const summary = String(data.summary ?? "");
  const tags = Array.isArray(data.tags) ? data.tags.map(String) : [];
  const draft = Boolean(data.draft);

  const words = content.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / WORDS_PER_MINUTE));

  return { slug, title, date, summary, tags, words, minutes, draft, content };
}

/** gray-matter parses unquoted dates into Date objects; normalise either form. */
function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  return "1970-01-01";
}

function isVisible(post: PostMeta): boolean {
  return !post.draft || process.env.NODE_ENV !== "production";
}

function stripContent({ content: _content, ...meta }: Post): PostMeta {
  void _content;
  return meta;
}

/** All visible posts, newest first. */
export function getAllPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".md"))
    .map(readPostFile)
    .map(stripContent)
    .filter(isVisible)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getPost(slug: string): Post | null {
  const file = path.join(POSTS_DIR, `${slug}.md`);
  if (!fs.existsSync(file)) return null;
  const post = readPostFile(`${slug}.md`);
  return isVisible(post) ? post : null;
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getPostsByTag(tag: string): PostMeta[] {
  const wanted = tag.toLowerCase();
  return getAllPosts().filter((p) => p.tags.some((t) => t.toLowerCase() === wanted));
}

/** URL-safe tag slug: "Data Engineering" → "data-engineering". */
export function tagSlug(tag: string): string {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function formatDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-CA", {
    year: "numeric", month: "short", day: "numeric", timeZone: "UTC",
  });
}
