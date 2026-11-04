import Link from "next/link";
import { formatDate, tagSlug, type PostMeta } from "@/lib/posts";

/** Editorial list of posts: same visual grammar as the homepage project index. */
export function PostList({ posts }: { posts: PostMeta[] }) {
  if (posts.length === 0) {
    return <p className="post-empty">Nothing here yet.</p>;
  }
  return (
    <ul className="post-index">
      {posts.map((p, i) => (
        <li key={p.slug} className="post-row">
          <Link href={`/blog/${p.slug}`} className="post-row-link" data-cursor="Read">
            <span className="post-row-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="post-row-date">{formatDate(p.date)}</span>
            <span className="post-row-main">
              <span className="post-row-title">{p.title}</span>
              <span className="post-row-summary">{p.summary}</span>
              <span className="post-row-meta">
                {p.words} words · {p.minutes} min
                {p.tags.length > 0 && (
                  <span className="post-row-tags">
                    {p.tags.map((t) => (
                      <span key={t} className="project-row-tag">{t}</span>
                    ))}
                  </span>
                )}
              </span>
            </span>
            <span className="project-row-arrow" aria-hidden="true">↗</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function TagCloud({ tags, active }: { tags: { tag: string; count: number }[]; active?: string }) {
  if (tags.length === 0) return null;
  return (
    <div className="tag-cloud">
      <Link href="/blog" className={active ? "tag-pill" : "tag-pill tag-pill--active"} data-cursor="All">
        All
      </Link>
      {tags.map(({ tag, count }) => (
        <Link
          key={tag}
          href={`/blog/tag/${tagSlug(tag)}`}
          className={active && tagSlug(active) === tagSlug(tag) ? "tag-pill tag-pill--active" : "tag-pill"}
          data-cursor="Filter"
        >
          {tag} <span className="tag-pill-count">{count}</span>
        </Link>
      ))}
    </div>
  );
}
