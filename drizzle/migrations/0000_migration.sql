create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First account ever created becomes the admin
create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_role after insert on auth.users
for each row execute function public.handle_new_user_role();

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);
grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Anyone reads categories" on public.categories for select using (true);
create policy "Admins manage categories" on public.categories for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  cover_image_url text,
  category_id uuid references public.categories(id) on delete set null,
  content text not null default '',
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "Anyone reads published posts" on public.posts for select using (status = 'published');
create policy "Admins read all posts" on public.posts for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert posts" on public.posts for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update posts" on public.posts for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete posts" on public.posts for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create or replace function public.posts_before_write()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;
create trigger posts_before_write before insert or update on public.posts
for each row execute function public.posts_before_write();

insert into public.categories (name, slug) values
  ('Design', 'design'), ('Technology', 'technology'), ('Lifestyle', 'lifestyle');

insert into public.posts (title, slug, cover_image_url, category_id, content, status, published_at) values
('The Quiet Power of White Space', 'quiet-power-of-white-space',
 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80',
 (select id from public.categories where slug='design'),
 E'Good design is often about what you leave out.\n\n## Why space matters\n\nWhite space gives content room to breathe. It guides the eye, creates hierarchy, and makes reading feel effortless.\n\n## Practical tips\n\n- Increase line height for body text\n- Group related elements tightly, separate unrelated ones generously\n- Resist the urge to fill every pixel\n\n> Simplicity is the ultimate sophistication.\n\nNext time a layout feels cluttered, try removing something instead of adding.',
 'published', now() - interval '6 days'),
('A Gentle Introduction to Edge Computing', 'gentle-introduction-to-edge-computing',
 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1600&q=80',
 (select id from public.categories where slug='technology'),
 E'Edge computing moves work closer to the people using it.\n\n## The idea\n\nInstead of every request travelling to one distant data center, code runs in many locations around the world.\n\n## Benefits\n\n1. **Lower latency** — responses arrive faster\n2. **Resilience** — no single point of failure\n3. **Scale** — traffic spreads naturally\n\n```js\nexport default {\n  fetch() { return new Response(\"Hello from the edge\"); }\n}\n```\n\nIt''s not a silver bullet, but for many apps it''s a big win.',
 'published', now() - interval '3 days'),
('Slow Mornings: A Small Ritual Worth Keeping', 'slow-mornings-small-ritual',
 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80',
 (select id from public.categories where slug='lifestyle'),
 E'How you start the day shapes the rest of it.\n\n## My routine\n\n- Wake up without checking the phone\n- Brew coffee slowly, by hand\n- Ten minutes of reading or journaling\n\n## Why it works\n\nA calm start builds a buffer against the rush that follows. It''s less about productivity and more about presence.\n\nTry it for a week — you might be surprised.',
 'published', now() - interval '1 day');