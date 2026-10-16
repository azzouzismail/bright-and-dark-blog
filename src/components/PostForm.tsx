import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Markdown } from "@/components/Markdown";
import { fetchCategories, slugify, type Post } from "@/lib/blog";

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
  slug: z.string().trim().min(1, "Slug is required").max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers and hyphens"),
  cover_image_url: z.union([z.literal(""), z.string().trim().url("Cover image must be a valid URL")]),
  category_id: z.string().min(1, "Please choose a category"),
  content: z.string().trim().min(1, "Content is required").max(100000),
});

export function PostForm({ post }: { post?: Post }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const cats = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const [f, setF] = useState({
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    cover_image_url: post?.cover_image_url ?? "",
    category_id: post?.category_id ?? "",
    content: post?.content ?? "",
  });
  const [published, setPublished] = useState(post?.status === "published");
  const [slugTouched, setSlugTouched] = useState(!!post);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(f);
    if (!parsed.success) {
      parsed.error.issues.forEach((i) => toast.error(i.message));
      return;
    }
    setSaving(true);
    const values = {
      ...parsed.data,
      cover_image_url: parsed.data.cover_image_url || null,
      status: (published ? "published" : "draft") as "published" | "draft",
    };
    const { error } = post
      ? await supabase.from("posts").update(values).eq("id", post.id)
      : await supabase.from("posts").insert(values);
    setSaving(false);
    if (error) {
      toast.error(error.code === "23505" ? "That slug is already used by another post" : error.message);
      return;
    }
    toast.success(post ? "Post updated" : "Post created");
    qc.invalidateQueries();
    navigate({ to: "/admin" });
  };

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={f.title} onChange={(e) => { set("title", e.target.value); if (!slugTouched) set("slug", slugify(e.target.value)); }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value); }} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cover">Cover image URL</Label>
          <Input id="cover" placeholder="https://…" value={f.cover_image_url} onChange={(e) => set("cover_image_url", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={f.category_id} onValueChange={(v) => set("category_id", v)}>
            <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
            <SelectContent>
              {cats.data?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {f.cover_image_url && /^https?:\/\//.test(f.cover_image_url) && (
        <img src={f.cover_image_url} alt="" className="h-48 w-full rounded-xl object-cover" />
      )}

      <div className="space-y-2">
        <Label>Content (Markdown)</Label>
        <Tabs defaultValue="write">
          <TabsList><TabsTrigger value="write">Write</TabsTrigger><TabsTrigger value="preview">Preview</TabsTrigger></TabsList>
          <TabsContent value="write">
            <Textarea value={f.content} onChange={(e) => set("content", e.target.value)} className="min-h-[420px] font-mono text-sm" placeholder="## Start writing…" />
          </TabsContent>
          <TabsContent value="preview">
            <div className="min-h-[420px] rounded-md border bg-card p-6">
              {f.content.trim() ? <Markdown>{f.content}</Markdown> : <p className="text-muted-foreground">Nothing to preview yet.</p>}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3">
          <Switch checked={published} onCheckedChange={setPublished} />
          <span className="text-sm font-medium">{published ? "Published" : "Draft"}</span>
        </label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin" })}>Cancel</Button>
          <Button disabled={saving}>{saving ? "Saving…" : "Save post"}</Button>
        </div>
      </div>
    </form>
  );
}
