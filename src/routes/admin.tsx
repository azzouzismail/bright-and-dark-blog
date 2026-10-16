import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin — Margin" },
      { name: "description", content: "Manage Margin's articles." },
      { property: "og:title", content: "Admin — Margin" },
      { property: "og:description", content: "Manage Margin's articles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

type State = { loading: boolean; session: Session | null; isAdmin: boolean };

function AdminLayout() {
  const [s, setS] = useState<State>({ loading: true, session: null, isAdmin: false });
  const qc = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    const check = async (session: Session | null) => {
      if (!session) return setS({ loading: false, session: null, isAdmin: false });
      const { data } = await supabase.rpc("has_role", { _user_id: session.user.id, _role: "admin" });
      setS({ loading: false, session, isAdmin: !!data });
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setTimeout(() => check(session), 0);
    });
    supabase.auth.getSession().then(({ data }) => check(data.session));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/admin", replace: true });
  };

  if (s.loading) return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  if (!s.session) return <LoginForm />;
  if (!s.isAdmin)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-3xl font-semibold">Access denied</h1>
        <p className="text-muted-foreground">This account doesn't have admin access.</p>
        <Button variant="outline" onClick={signOut}>Sign out</Button>
      </div>
    );

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/admin" className="font-display text-xl font-semibold">
            Margin<span className="text-primary">.</span> <span className="text-sm font-normal text-muted-foreground">admin</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link to="/" className="px-3 text-sm text-muted-foreground hover:text-foreground">View site</Link>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="h-5 w-5" /></Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><Outlet /></main>
    </div>
  );
}

function LoginForm() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) { toast.error("Please enter a valid email"); return; }
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email, password, options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) toast.error(error.message);
      else if (!data.session) toast.success("Check your email to confirm your account");
    }
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl border bg-card p-8 shadow-sm">
        <div>
          <h1 className="text-3xl font-semibold">{mode === "in" ? "Admin sign in" : "Create admin account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "in" ? "Only the site admin can access this area." : "The first account created becomes the admin."}
          </p>
        </div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="pw">Password</Label>
          <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button className="w-full" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</Button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-center text-sm text-muted-foreground hover:text-primary">
          {mode === "in" ? "First time? Create the admin account" : "Already have an account? Sign in"}
        </button>
      </form>
    </div>
  );
}
