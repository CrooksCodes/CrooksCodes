import Home from "./home-client";
import { getAllPosts } from "@/lib/posts";

// Server wrapper: reads the Markdown posts at build time and hands the latest
// few to the (client) homepage so the "Writing" section stays in sync.
export default function Page() {
  return <Home posts={getAllPosts().slice(0, 3)} />;
}
