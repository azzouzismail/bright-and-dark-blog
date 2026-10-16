<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Admin access is decided by the `user_roles` table via `has_role()`; the first account to sign up becomes admin (DB trigger). Why: roles must never live in user-editable data.
- Blog data is read/written from the browser client under RLS (published posts public, everything else admin-only). Why: no server secrets needed.
