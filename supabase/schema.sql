-- NetUp demo schema bootstrap for a brand-new Supabase project.
-- Safe to run multiple times (idempotent where possible).
-- NOTE: This setup uses permissive demo policies for anon/authenticated users.
-- Tighten RLS policies before going to production.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('player', 'owner', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'sport_type') then
    create type public.sport_type as enum ('Badminton', 'Football', 'Tennis');
  end if;

  if not exists (select 1 from pg_type where typname = 'skill_level') then
    create type public.skill_level as enum ('Beginner', 'Intermediate', 'Advanced');
  end if;

  if not exists (select 1 from pg_type where typname = 'court_status') then
    create type public.court_status as enum ('active', 'maintenance');
  end if;

  if not exists (select 1 from pg_type where typname = 'session_post_type') then
    create type public.session_post_type as enum ('pool', 'rental');
  end if;

  if not exists (select 1 from pg_type where typname = 'booking_mode') then
    create type public.booking_mode as enum ('solo', 'full_court');
  end if;

  if not exists (select 1 from pg_type where typname = 'booking_status') then
    create type public.booking_status as enum ('confirmed', 'checked_in', 'completed', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'pool_status') then
    create type public.pool_status as enum ('open', 'closed', 'cancelled');
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_session_ends_at()
returns trigger
language plpgsql
as $$
begin
  new.ends_at = new.starts_at + (new.duration_minutes || ' minutes')::interval;
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  role public.user_role not null default 'player',
  full_name text not null,
  city text,
  district text,
  age integer check (age between 10 and 100),
  favorite_sports public.sport_type[] not null default '{}'::public.sport_type[],
  skill_level public.skill_level not null default 'Beginner',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.court_complexes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  district text not null,
  address text not null,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table if not exists public.courts (
  id uuid primary key default gen_random_uuid(),
  complex_id uuid not null references public.court_complexes(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete restrict,
  name text not null,
  sub_court_name text not null,
  sport public.sport_type not null,
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  is_pickup_enabled boolean not null default true,
  status public.court_status not null default 'active',
  amenities text[] not null default '{}',
  base_price_vnd integer not null check (base_price_vnd >= 0),
  max_rental_duration_minutes integer not null default 120 check (
    max_rental_duration_minutes in (30, 60, 90, 120, 150, 180, 210, 240, 270, 300)
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (complex_id, sub_court_name)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  court_id uuid not null references public.courts(id) on delete cascade,
  title text not null,
  post_type public.session_post_type not null default 'pool',
  starts_at timestamptz not null,
  duration_minutes integer not null check (
    duration_minutes in (30, 60, 90, 120, 150, 180, 210, 240, 270, 300)
  ),
  ends_at timestamptz not null,
  open_slots integer not null check (open_slots >= 0),
  max_slots integer not null check (max_slots > 0 and open_slots <= max_slots),
  required_skill_min public.skill_level not null default 'Beginner',
  required_skill_max public.skill_level not null default 'Advanced',
  slot_price_vnd integer not null check (slot_price_vnd >= 0),
  full_court_price_vnd integer not null check (full_court_price_vnd >= 0),
  is_peak_hour boolean not null default false,
  allows_solo_join boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    array_position(enum_range(null::public.skill_level), required_skill_min)
    <= array_position(enum_range(null::public.skill_level), required_skill_max)
  )
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'sessions_no_overlap_per_court'
  ) then
    alter table public.sessions
      add constraint sessions_no_overlap_per_court
      exclude using gist (
        court_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      );
  end if;
end;
$$;

create table if not exists public.pool_posts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  created_by_player_id uuid not null references public.profiles(id) on delete restrict,
  total_slots integer not null check (total_slots >= 2),
  host_slots integer not null check (host_slots >= 1 and host_slots <= total_slots),
  status public.pool_status not null default 'open',
  created_at timestamptz not null default now(),
  unique (session_id)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_code text not null unique,
  session_id uuid not null references public.sessions(id) on delete restrict,
  court_id uuid not null references public.courts(id) on delete restrict,
  player_id uuid not null references public.profiles(id) on delete restrict,
  mode public.booking_mode not null,
  seats_booked integer not null check (seats_booked > 0),
  status public.booking_status not null default 'confirmed',
  created_at timestamptz not null default now(),
  base_price_vnd integer not null check (base_price_vnd >= 0),
  floor_fee_vnd integer not null default 0 check (floor_fee_vnd >= 0),
  platform_fee_vnd integer not null default 0 check (platform_fee_vnd >= 0),
  total_price_vnd integer not null check (total_price_vnd >= 0),
  qr_payload text not null
);

create table if not exists public.player_assessments (
  player_id uuid primary key references public.profiles(id) on delete cascade,
  preferred_sport public.sport_type not null,
  preferred_district text not null,
  budget_per_session_vnd integer not null check (budget_per_session_vnd >= 0),
  sessions_per_week integer not null check (sessions_per_week between 1 and 14),
  experience_years integer not null check (experience_years >= 0),
  stamina_score integer not null check (stamina_score between 1 and 5),
  technique_score integer not null check (technique_score between 1 and 5),
  tactical_score integer not null check (tactical_score between 1 and 5),
  calculated_level public.skill_level not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_configs (
  id smallint primary key default 1 check (id = 1),
  platform_fee_rate numeric(6, 4) not null check (platform_fee_rate between 0 and 1),
  floor_fee_vnd integer not null check (floor_fee_vnd >= 0),
  matching_radius_km numeric(6, 2) not null check (matching_radius_km > 0),
  no_show_strike_limit integer not null check (no_show_strike_limit >= 1),
  auto_release_minutes integer not null check (auto_release_minutes between 1 and 180),
  support_hotline_enabled boolean not null default true,
  deposit_percent numeric(5, 2) not null check (deposit_percent between 0 and 100),
  updated_at timestamptz not null default now()
);

insert into public.admin_configs (
  id,
  platform_fee_rate,
  floor_fee_vnd,
  matching_radius_km,
  no_show_strike_limit,
  auto_release_minutes,
  support_hotline_enabled,
  deposit_percent
)
values (1, 0.10, 3000, 5, 3, 15, true, 30)
on conflict (id) do nothing;

create index if not exists idx_court_complexes_owner_id on public.court_complexes(owner_id);
create index if not exists idx_courts_owner_id on public.courts(owner_id);
create index if not exists idx_courts_sport on public.courts(sport);
create index if not exists idx_sessions_court_id_starts_at on public.sessions(court_id, starts_at);
create index if not exists idx_sessions_post_type_starts_at on public.sessions(post_type, starts_at);
create index if not exists idx_pool_posts_created_at on public.pool_posts(created_at desc);
create index if not exists idx_bookings_player_id_created_at on public.bookings(player_id, created_at desc);
create index if not exists idx_bookings_session_id on public.bookings(session_id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_court_complexes_updated_at on public.court_complexes;
create trigger trg_court_complexes_updated_at
before update on public.court_complexes
for each row
execute function public.set_updated_at();

drop trigger if exists trg_courts_updated_at on public.courts;
create trigger trg_courts_updated_at
before update on public.courts
for each row
execute function public.set_updated_at();

drop trigger if exists trg_sessions_updated_at on public.sessions;
create trigger trg_sessions_updated_at
before update on public.sessions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_sessions_set_ends_at on public.sessions;
create trigger trg_sessions_set_ends_at
before insert or update of starts_at, duration_minutes on public.sessions
for each row
execute function public.set_session_ends_at();

drop trigger if exists trg_admin_configs_updated_at on public.admin_configs;
create trigger trg_admin_configs_updated_at
before update on public.admin_configs
for each row
execute function public.set_updated_at();

drop trigger if exists trg_player_assessments_updated_at on public.player_assessments;
create trigger trg_player_assessments_updated_at
before update on public.player_assessments
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.court_complexes enable row level security;
alter table public.courts enable row level security;
alter table public.sessions enable row level security;
alter table public.pool_posts enable row level security;
alter table public.bookings enable row level security;
alter table public.player_assessments enable row level security;
alter table public.admin_configs enable row level security;

drop policy if exists profiles_demo_full_access on public.profiles;
create policy profiles_demo_full_access
on public.profiles
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists court_complexes_demo_full_access on public.court_complexes;
create policy court_complexes_demo_full_access
on public.court_complexes
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists courts_demo_full_access on public.courts;
create policy courts_demo_full_access
on public.courts
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists sessions_demo_full_access on public.sessions;
create policy sessions_demo_full_access
on public.sessions
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists pool_posts_demo_full_access on public.pool_posts;
create policy pool_posts_demo_full_access
on public.pool_posts
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists bookings_demo_full_access on public.bookings;
create policy bookings_demo_full_access
on public.bookings
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists player_assessments_demo_full_access on public.player_assessments;
create policy player_assessments_demo_full_access
on public.player_assessments
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists admin_configs_demo_full_access on public.admin_configs;
create policy admin_configs_demo_full_access
on public.admin_configs
for all
to anon, authenticated
using (true)
with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

create or replace view public.v_court_calendar as
select
  s.id as session_id,
  s.post_type,
  s.starts_at,
  s.ends_at,
  s.duration_minutes,
  s.open_slots,
  s.max_slots,
  s.slot_price_vnd,
  s.full_court_price_vnd,
  s.allows_solo_join,
  c.id as court_id,
  c.sub_court_name,
  c.sport,
  cc.name as complex_name,
  cc.address
from public.sessions s
join public.courts c on c.id = s.court_id
join public.court_complexes cc on cc.id = c.complex_id;

grant select on public.v_court_calendar to anon, authenticated;
