import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate, getAllPosts, getPost, tagSlug } from "@/lib/posts";
import { SITE } from "@/lib/site";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return getAllPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      authors: [SITE.author],
      tags: post.tags,
      url: `/blog/${slug}`,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary },
  };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const all = getAllPosts();
  const idx = all.findIndex((p) => p.slug === slug);
  const newer = idx > 0 ? all[idx - 1] : null;
  const older = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    author: { "@type": "Person", name: SITE.author, url: SITE.url },
    keywords: post.tags.join(", "),
    url: `${SITE.url}/blog/${slug}`,
  };

  return (
    <article className="post">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="post-header">
        <Link href="/blog" className="post-back" data-cursor="Back">← All posts</Link>
        <p className="post-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span className="post-meta-sep">·</span>
          {post.words} words
          <span className="post-meta-sep">·</span>
          {post.minutes} min read
        </p>
        <h1 className="post-title">{post.title}</h1>
        <p className="post-summary">{post.summary}</p>
        {post.tags.length > 0 && (
          <div className="post-tags">
            {post.tags.map((t) => (
              <Link key={t} href={`/blog/tag/${tagSlug(t)}`} className="project-row-tag" data-cursor="Tag">{t}</Link>
            ))}
          </div>
        )}
      </header>

      <div className="post-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>

      <footer className="post-footer">
        <div className="post-share">
          <span className="post-share-label">Found this useful?</span>
          <a
            href={`https://x.com/intent/post?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${SITE.url}/blog/${slug}`)}&via=${SITE.socials.x.handle}`}
            target="_blank" rel="noreferrer" data-cursor="Share"
          >Share on X ↗</a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${SITE.url}/blog/${slug}`)}`}
            target="_blank" rel="noreferrer" data-cursor="Share"
          >Share on LinkedIn ↗</a>
        </div>
        <nav className="post-nav" aria-label="Adjacent posts">
          {older ? (
            <Link href={`/blog/${older.slug}`} className="post-nav-link" data-cursor="Older">
              <span className="post-nav-kicker">← Older</span>
              <span className="post-nav-title">{older.title}</span>
            </Link>
          ) : <span />}
          {newer ? (
            <Link href={`/blog/${newer.slug}`} className="post-nav-link post-nav-link--next" data-cursor="Newer">
              <span className="post-nav-kicker">Newer →</span>
              <span className="post-nav-title">{newer.title}</span>
            </Link>
          ) : <span />}
        </nav>
      </footer>
    </article>
  );
}
