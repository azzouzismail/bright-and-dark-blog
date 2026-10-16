import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostForm } from "@/components/PostForm";
import type { Post } from "@/lib/blog";

export const Route = createFileRoute("/admin/posts/$id")({ component: EditPost });

function EditPost() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "post", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data as Post | null;
    },
  });
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Edit post</h1>
      {isLoading ? <p className="text-muted-foreground">Loading…</p> : !data ? <p>Post not found.</p> : <PostForm key={data.id} post={data} />}
    </div>
  );
}
