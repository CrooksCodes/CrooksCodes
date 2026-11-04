import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostList, TagCloud } from "@/components/PostList";
import { getAllTags, getPostsByTag, tagSlug } from "@/lib/posts";

type Params = { tag: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllTags().map(({ tag }) => ({ tag: tagSlug(tag) }));
}

function resolveTag(slug: string): string | undefined {
  return getAllTags().find((t) => tagSlug(t.tag) === slug)?.tag;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { tag } = await params;
  const name = resolveTag(tag);
  return name
    ? { title: `${name} · Blog`, alternates: { canonical: `/blog/tag/${tag}` } }
    : {};
}

export default async function TagPage({ params }: { params: Promise<Params> }) {
  const { tag } = await params;
  const name = resolveTag(tag);
  if (!name) notFound();
  const posts = getPostsByTag(name);
  return (
    <>
      <header className="blog-hero blog-hero--compact">
        <p className="kicker">Tagged</p>
        <h1 className="blog-hero-title">{name}</h1>
      </header>
      <section className="section">
        <div className="section-inner">
          <TagCloud tags={getAllTags()} active={name} />
          <PostList posts={posts} />
        </div>
      </section>
    </>
  );
}
