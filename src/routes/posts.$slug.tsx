import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Markdown } from "@/components/Markdown";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPostBySlug, formatDate, readingTime } from "@/lib/blog";

export const Route = createFileRoute("/posts/$slug")({
  head: () => ({
    meta: [
      { title: "Article — Margin" },
      { name: "description", content: "Read the full article on Margin." },
      { property: "og:title", content: "Article — Margin" },
      { property: "og:description", content: "Read the full article on Margin." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading } = useQuery({ queryKey: ["post", slug], queryFn: () => fetchPostBySlug(slug) });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-10 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> All articles
        </Link>
        {isLoading ? (
          <div className="mt-8 space-y-4"><Skeleton className="h-12 w-3/4" /><Skeleton className="h-80" /></div>
        ) : !post ? (
          <p className="py-20 text-center text-muted-foreground">This article doesn't exist.</p>
        ) : (
          <article className="mt-8">
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {post.categories && <span className="text-primary">{post.categories.name}</span>}
              <span>{formatDate(post.published_at)}</span>
              <span>· {readingTime(post.content)} min read</span>
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">{post.title}</h1>
            {post.cover_image_url && (
              <img src={post.cover_image_url} alt={post.title} className="mt-10 aspect-[16/9] w-full rounded-2xl object-cover" />
            )}
            <div className="mt-12"><Markdown>{post.content}</Markdown></div>
          </article>
        )}
      </main>
    </div>
  );
}
