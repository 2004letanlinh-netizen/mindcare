-- Run in the Supabase SQL Editor before using the API.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'MindCare member' check (char_length(display_name) between 1 and 40),
  reputation integer not null default 0 check (reputation between 0 and 1000),
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_user_id uuid references public.profiles (id) on delete set null,
  topic text not null check (char_length(topic) between 1 and 40),
  content text not null check (char_length(content) between 3 and 3000),
  is_anonymous boolean not null default true,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  constraint anonymous_posts_have_no_author check (
    (is_anonymous and author_user_id is null) or (not is_anonymous and author_user_id is not null)
  )
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  check_in_date date not null default current_date,
  mood_score smallint not null check (mood_score between 1 and 5),
  sleep_hours numeric(4, 1) check (sleep_hours between 0 and 24),
  sleep_quality smallint check (sleep_quality between 1 and 5),
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  unique (user_id, check_in_date)
);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.check_ins enable row level security;

create policy "Approved posts are public" on public.posts
  for select using (status = 'approved');
create policy "Members can read own profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Authors of approved posts are visible" on public.profiles
  for select using (
    exists (
      select 1 from public.posts
      where posts.author_user_id = profiles.id and posts.status = 'approved'
    )
  );
revoke update on public.profiles from anon, authenticated;
revoke select on public.profiles from anon, authenticated;
grant select (id, display_name, reputation) on public.profiles to anon, authenticated;
grant update (display_name) on public.profiles to authenticated;
create policy "Members can update their own display name" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "Members can manage own check-ins" on public.check_ins
  for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Members can submit posts as themselves" on public.posts
  for insert to authenticated with check (
    status = 'pending' and (
      (is_anonymous and author_user_id is null) or
      (not is_anonymous and author_user_id = auth.uid())
    )
  );

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), 'MindCare member'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.create_profile_for_new_user();

create table if not exists public.user_relationships (
  follower_id uuid not null references public.profiles (id) on delete cascade,
  following_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (post_id, reporter_id)
);

create table if not exists public.reputation_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  points_delta integer not null check (points_delta between -1000 and 1000),
  reason text not null check (char_length(reason) between 1 and 120),
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null check (char_length(title) between 1 and 160),
  category text not null check (char_length(category) between 1 and 60),
  content text not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_relationships enable row level security;
alter table public.post_reports enable row level security;
alter table public.reputation_events enable row level security;
alter table public.knowledge_articles enable row level security;

create policy "Members can view relationships involving themselves" on public.user_relationships
  for select to authenticated using (auth.uid() = follower_id or auth.uid() = following_id);
create policy "Members can follow other members" on public.user_relationships
  for insert to authenticated with check (auth.uid() = follower_id);
create policy "Members can unfollow members" on public.user_relationships
  for delete to authenticated using (auth.uid() = follower_id);
create policy "Members can submit a report once per post" on public.post_reports
  for insert to authenticated with check (auth.uid() = reporter_id);
create policy "Members can view their own reports" on public.post_reports
  for select to authenticated using (auth.uid() = reporter_id);
create policy "Members can view their reputation history" on public.reputation_events
  for select to authenticated using (auth.uid() = user_id);
create policy "Published knowledge is public" on public.knowledge_articles
  for select using (is_published);
