import { createFileRoute } from "@tanstack/react-router";
import { PostForm } from "@/components/PostForm";

export const Route = createFileRoute("/admin/posts/new")({
  component: () => (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">New post</h1>
      <PostForm />
    </div>
  ),
});
