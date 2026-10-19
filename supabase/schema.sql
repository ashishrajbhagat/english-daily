-- English Daily: Supabase schema. SAFE TO RUN MORE THAN ONCE (existing tables and policies are kept or replaced).

-- Run in Supabase: SQL Editor
create table if not exists public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
drop policy if exists "own read" on public.progress;
create policy "own read" on public.progress for select using (auth.uid() = user_id);
drop policy if exists "own insert" on public.progress;
create policy "own insert" on public.progress for insert with check (auth.uid() = user_id);
drop policy if exists "own update" on public.progress;
create policy "own update" on public.progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Optional leaderboard (nickname + XP only, opt-in)
create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nick text not null check (char_length(nick) between 2 and 20),
  xp int not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.leaderboard enable row level security;
drop policy if exists "lb read" on public.leaderboard;
create policy "lb read" on public.leaderboard for select using (true);
drop policy if exists "lb insert" on public.leaderboard;
create policy "lb insert" on public.leaderboard for insert with check (auth.uid() = user_id);
drop policy if exists "lb update" on public.leaderboard;
create policy "lb update" on public.leaderboard for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "lb delete" on public.leaderboard;
create policy "lb delete" on public.leaderboard for delete using (auth.uid() = user_id);

-- Admin panel: content added by admins (visible to everyone)
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;
drop policy if exists "admin self read" on public.admins;
create policy "admin self read" on public.admins for select using (lower(auth.jwt() ->> 'email') = lower(email));

create table if not exists public.custom_items (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('phrase','word','phrasal','quiz')),
  level int not null check (level between 0 and 3),
  data jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.custom_items enable row level security;
drop policy if exists "ci read" on public.custom_items;
create policy "ci read" on public.custom_items for select using (true);
drop policy if exists "ci admin insert" on public.custom_items;
create policy "ci admin insert" on public.custom_items for insert with check (exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email')));
drop policy if exists "ci admin update" on public.custom_items;
create policy "ci admin update" on public.custom_items for update using (exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email'))) with check (exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email')));
drop policy if exists "ci admin delete" on public.custom_items;
create policy "ci admin delete" on public.custom_items for delete using (exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email')));
-- Make yourself an admin (run once with your own email):
-- insert into public.admins (email) values ('you@example.com');

-- Background reminders (push notifications)
create table if not exists public.push_subs (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  sub jsonb not null,
  time text not null default '19:00',
  tz text not null default 'UTC',
  last_sent text not null default '',
  updated_at timestamptz not null default now()
);
alter table public.push_subs enable row level security;
drop policy if exists "ps own all" on public.push_subs;
create policy "ps own all" on public.push_subs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
