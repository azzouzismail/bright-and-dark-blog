import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { excerpt, fetchCategories, fetchPublishedPosts, formatDate } from "@/lib/blog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Margin — Essays on design, technology & life" },
      { name: "description", content: "Thoughtful essays on design, technology, and everyday living." },
      { property: "og:title", content: "Margin — Essays on design, technology & life" },
      { property: "og:description", content: "Thoughtful essays on design, technology, and everyday living." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const posts = useQuery({ queryKey: ["posts", "published"], queryFn: fetchPublishedPosts });
  const cats = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.toLowerCase().trim();
    return (posts.data ?? []).filter(
      (p) =>
        (!cat || p.category_id === cat) &&
        (!term || p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term)),
    );
  }, [posts.data, q, cat]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <section className="py-14 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">The journal</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">
            Notes from the margins of design, tech & life.
          </h1>
        </section>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <Chip active={!cat} onClick={() => setCat(null)}>All</Chip>
            {cats.data?.map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>{c.name}</Chip>
            ))}
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles…" className="pl-9" />
          </div>
        </div>

        {posts.isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">No articles found.</p>
        ) : (
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link key={p.id} to="/posts/$slug" params={{ slug: p.slug }} className="group block">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                  {p.cover_image_url && (
                    <img src={p.cover_image_url} alt={p.title} loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {p.categories && <span className="text-primary">{p.categories.name}</span>}
                  <span>{formatDate(p.published_at)}</span>
                </div>
                <h2 className="mt-2 text-2xl font-semibold leading-snug group-hover:text-primary">{p.title}</h2>
                <p className="mt-2 text-muted-foreground">{excerpt(p.content)}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary hover:text-primary"}`}>
      {children}
    </button>
  );
}
