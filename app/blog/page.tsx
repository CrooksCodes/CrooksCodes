import { PostList, TagCloud } from "@/components/PostList";
import { getAllPosts, getAllTags } from "@/lib/posts";

export default function BlogIndex() {
  const posts = getAllPosts();
  const tags = getAllTags();
  return (
    <>
      <header className="blog-hero">
        <p className="kicker">Learning in public</p>
        <h1 className="blog-hero-title">
          Notes from <span className="accent-text">school</span>{" & side projects"}
        </h1>
        <p className="blog-hero-desc">
          Short write-ups of what I&apos;m learning, what I&apos;m building, and what broke along the way.
        </p>
      </header>
      <section className="section">
        <div className="section-inner">
          <TagCloud tags={tags} />
          <PostList posts={posts} />
        </div>
      </section>
    </>
  );
}
