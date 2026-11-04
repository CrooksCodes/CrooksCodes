import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags, tagSlug } from "@/lib/posts";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newest = posts[0]?.date ?? "2026-01-01";
  return [
    { url: SITE.url, lastModified: new Date(newest), changeFrequency: "monthly", priority: 1 },
    { url: `${SITE.url}/blog`, lastModified: new Date(newest), changeFrequency: "weekly", priority: 0.8 },
    ...posts.map((p) => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: new Date(p.date), priority: 0.7 })),
    ...getAllTags().map(({ tag }) => ({ url: `${SITE.url}/blog/tag/${tagSlug(tag)}`, priority: 0.4 })),
  ];
}
