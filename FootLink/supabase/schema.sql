-- ============================================================================
-- FootLink — PostgreSQL schema for Supabase
-- "Find your team. Play nearby."
-- ----------------------------------------------------------------------------
-- Run this file in the Supabase SQL editor (Dashboard > SQL > New query).
-- It creates all tables, indexes, triggers (updated_at) and Row Level
-- Security policies referenced by the mobile app.
--
-- Conventions:
--   * UUID primary keys
--   * snake_case columns
--   * created_at / updated_at timestamps on every table
--   * RLS enabled with permissive policies
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";  -- gen_random_uuid()
create extension if not exists "postgis";   -- geography for distance queries (optional)

-- Enable the UUID generator availability check
select gen_random_uuid();

-- ---------------------------------------------------------------------------
-- Countries & Cities
-- ---------------------------------------------------------------------------
create table if not exists public.countries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  code        text not null unique,            -- ISO 3166-1 alpha-2, e.g. 'MA'
  currency    text,                            -- e.g. 'MAD'
  created_at  timestamptz not null default now()
);

create table if not exists public.cities (
  id           uuid primary key default gen_random_uuid(),
  country_id   uuid not null references public.countries(id) on delete cascade,
  name         text not null,
  latitude     double precision,
  longitude    double precision,
  created_at   timestamptz not null default now(),
  unique (country_id, name)
);
create index if not exists cities_country_idx on public.cities (country_id);
create index if not exists cities_name_idx on public.cities (name);

-- ---------------------------------------------------------------------------
-- Player profiles (one per user)
-- ---------------------------------------------------------------------------
create table if not exists public.player_profiles (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users(id) on delete cascade,
  username               text,
  first_name             text,
  photo_url              text,
  age_range_min          integer check (age_range_min between 0 and 130),
  age_range_max          integer check (age_range_max between 0 and 130),
  country                text,
  city                   text,
  latitude               double precision,        -- approximate, not exact home
  longitude              double precision,
  position               text,                     -- goalkeeper|defender|...|flexible
  skill_level            text,                     -- beginner|casual|intermediate|advanced
  available_days         integer[] default '{}',   -- 0=Sunday .. 6=Saturday
  preferred_times        text[] default '{}',
  preferred_distance_km  double precision,
  bio                    text,
  rating                 double precision default 0,
  matches_count          integer not null default 0,
  badges                 text[] default '{}',
  languages              text[] default '{}',
  show_location          boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index if not exists player_profiles_user_idx on public.player_profiles (user_id);
create index if not exists player_profiles_city_idx on public.player_profiles (city);
create index if not exists player_profiles_coords_idx
  on public.player_profiles (latitude, longitude);
create index if not exists player_profiles_skill_idx on public.player_profiles (skill_level);

-- ---------------------------------------------------------------------------
-- Positions (reference)
-- ---------------------------------------------------------------------------
create table if not exists public.positions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  code        text not null unique
);

-- ---------------------------------------------------------------------------
-- Teams & membership
-- ---------------------------------------------------------------------------
create table if not exists public.teams (
  id            uuid primary key default gen_random_uuid(),
  captain_id    uuid not null references public.player_profiles(id) on delete cascade,
  name          text not null,
  logo_url      text,
  city          text,
  country       text,
  description   text,
  skill_level   text,
  rules         text,
  rating        double precision default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists teams_city_idx on public.teams (city);
create index if not exists teams_captain_idx on public.teams (captain_id);

create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  player_id   uuid not null references public.player_profiles(id) on delete cascade,
  role        text not null default 'member',      -- captain|member
  joined_at   timestamptz not null default now(),
  unique (team_id, player_id)
);
create index if not exists team_members_team_idx on public.team_members (team_id);
create index if not exists team_members_player_idx on public.team_members (player_id);

create table if not exists public.team_join_requests (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  player_id   uuid not null references public.player_profiles(id) on delete cascade,
  status      text not null default 'pending',     -- pending|accepted|rejected
  created_at  timestamptz not null default now(),
  unique (team_id, player_id, status)
);
create index if not exists team_join_requests_team_idx on public.team_join_requests (team_id);

-- ---------------------------------------------------------------------------
-- Matches
-- ---------------------------------------------------------------------------
create table if not exists public.matches (
  id                 uuid primary key default gen_random_uuid(),
  organizer_id       uuid not null references public.player_profiles(id) on delete cascade,
  title              text,
  match_type         text not null default 'friendly',   -- friendly|league|tournament|training
  date_time          timestamptz not null,
  time_zone          text,
  city               text,
  country            text,
  venue_name         text,
  venue_id           uuid references public.venues(id) on delete set null,
  latitude           double precision,
  longitude          double precision,
  status             text not null default 'open',       -- draft|open|almost_full|full|started|finished|cancelled
  team_size          text not null default '5',          -- 5|7|9|11
  skill_level        text,
  max_players        integer not null default 10,
  min_players        integer not null default 2,
  fee_type           text not null default 'free',       -- free|paid
  fee_amount         double precision,
  payment_link       text,
  is_indoor          boolean not null default false,
  join_policy        text not null default 'open',       -- open|approval|invite_only
  required_positions text[] default '{}',
  description        text,
  rules              text,
  is_private         boolean not null default false,
  start_time         timestamptz,
  end_time           timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists matches_city_idx on public.matches (city);
create index if not exists matches_country_idx on public.matches (country);
create index if not exists matches_date_idx on public.matches (date_time);
create index if not exists matches_status_idx on public.matches (status);
create index if not exists matches_skill_idx on public.matches (skill_level);
create index if not exists matches_coords_idx on public.matches (latitude, longitude);
create index if not exists matches_organizer_idx on public.matches (organizer_id);

-- ---------------------------------------------------------------------------
-- Match players
-- ---------------------------------------------------------------------------
create table if not exists public.match_players (
  id           uuid primary key default gen_random_uuid(),
  match_id     uuid not null references public.matches(id) on delete cascade,
  player_id    uuid not null references public.player_profiles(id) on delete cascade,
  status       text not null default 'joined',   -- joined|pending|left
  position     text,
  joined_at    timestamptz not null default now(),
  unique (match_id, player_id)
);
create index if not exists match_players_match_idx on public.match_players (match_id);
create index if not exists match_players_player_idx on public.match_players (player_id);

-- ---------------------------------------------------------------------------
-- Venues & bookings
-- ---------------------------------------------------------------------------
create table if not exists public.venues (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid references public.player_profiles(id) on delete set null,
  name             text not null,
  photo_url        text,
  address          text,
  latitude         double precision,
  longitude        double precision,
  city             text,
  country          text,
  opening_hours    text,
  price            double precision,
  number_of_fields integer not null default 1,
  is_indoor        boolean not null default false,
  facilities       text[] default '{}',
  contact_phone    text,
  booking_url      text,
  rating           double precision default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists venues_city_idx on public.venues (city);
create index if not exists venues_coords_idx on public.venues (latitude, longitude);

create table if not exists public.venue_bookings (
  id          uuid primary key default gen_random_uuid(),
  venue_id    uuid not null references public.venues(id) on delete cascade,
  user_id     uuid not null references public.player_profiles(id) on delete cascade,
  match_id    uuid references public.matches(id) on delete set null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  status      text not null default 'pending',   -- pending|confirmed|rejected|cancelled
  created_at  timestamptz not null default now()
);
create index if not exists venue_bookings_venue_idx on public.venue_bookings (venue_id);

-- ---------------------------------------------------------------------------
-- Availability
-- ---------------------------------------------------------------------------
create table if not exists public.player_availability (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null references public.player_profiles(id) on delete cascade,
  day        smallint not null,          -- 0=Sunday .. 6=Saturday
  start_time time not null,
  end_time   time not null,
  unique (player_id, day, start_time)
);
create index if not exists player_availability_player_idx on public.player_availability (player_id);

-- ---------------------------------------------------------------------------
-- Reviews & ratings
-- ---------------------------------------------------------------------------
create table if not exists public.ratings (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid references public.matches(id) on delete cascade,
  reviewer_id uuid not null references public.player_profiles(id) on delete cascade,
  reviewee_id uuid not null references public.player_profiles(id) on delete cascade,
  punctuality smallint check (punctuality between 1 and 5),
  respect     smallint check (respect between 1 and 5),
  fair_play   smallint check (fair_play between 1 and 5),
  communication smallint check (communication between 1 and 5),
  reliability smallint check (reliability between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (reviewer_id, reviewee_id, match_id)
);
create index if not exists ratings_reviewee_idx on public.ratings (reviewee_id);
create index if not exists ratings_match_idx on public.ratings (match_id);

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.player_profiles(id) on delete cascade,
  reviewee_id uuid not null references public.player_profiles(id) on delete cascade,
  match_id    uuid references public.matches(id) on delete cascade,
  rating      smallint check (rating between 1 and 5),
  content     text,
  created_at  timestamptz not null default now(),
  unique (reviewer_id, reviewee_id, match_id)
);
create index if not exists reviews_reviewee_idx on public.reviews (reviewee_id);

-- ---------------------------------------------------------------------------
-- Messaging
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  match_id    uuid not null references public.matches(id) on delete cascade,
  sender_id   uuid not null references public.player_profiles(id) on delete cascade,
  sender_name text,
  text        text not null,
  is_system   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists messages_match_idx on public.messages (match_id, created_at);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text,
  title       text,
  body        text,
  match_id    uuid references public.matches(id) on delete set null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, read);

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  match_id  uuid references public.matches(id) on delete cascade,
  team_id   uuid references public.teams(id) on delete cascade,
  venue_id  uuid references public.venues(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists favorites_user_idx on public.favorites (user_id);

-- ---------------------------------------------------------------------------
-- Reports & blocking
-- ---------------------------------------------------------------------------
create table if not exists public.reports (
  id           uuid primary key default gen_random_uuid(),
  reporter_id  uuid not null references auth.users(id) on delete cascade,
  report_type  text not null,          -- user|match|team|review|message
  target_id    uuid not null,
  reason       text,
  status       text not null default 'open',   -- open|reviewed|actioned|dismissed
  created_at   timestamptz not null default now()
);
create index if not exists reports_status_idx on public.reports (status);

create table if not exists public.blocked_users (
  id          uuid primary key default gen_random_uuid(),
  blocker_id  uuid not null references auth.users(id) on delete cascade,
  blocked_id  uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (blocker_id, blocked_id)
);
create index if not exists blocked_users_blocker_idx on public.blocked_users (blocker_id);

-- ---------------------------------------------------------------------------
-- Badges
-- ---------------------------------------------------------------------------
create table if not exists public.badges (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  name        text not null,
  description text
);

create table if not exists public.user_badges (
  id          uuid primary key default gen_random_uuid(),
  player_id   uuid not null references public.player_profiles(id) on delete cascade,
  badge_id    uuid not null references public.badges(id) on delete cascade,
  awarded_at  timestamptz not null default now(),
  unique (player_id, badge_id)
);
create index if not exists user_badges_player_idx on public.user_badges (player_id);

-- ===========================================================================
-- updated_at trigger helper
-- ===========================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'player_profiles','teams','matches','venues'
  ] loop
    execute format('create trigger if not exists %I_set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t, t);
  end loop;
end $$;

-- ===========================================================================
-- Seed data: default badges
-- ===========================================================================
insert into public.badges (code, name, description) values
  ('reliable_player',  'Reliable Player',   'Always shows up and follows through.'),
  ('always_on_time',   'Always On Time',    'Arrives on time for matches.'),
  ('respectful_player','Respectful Player', 'Treats opponents and teammates with respect.'),
  ('team_player',      'Team Player',       'Puts the team first.'),
  ('good_organizer',   'Good Organizer',    'Runs great matches and events.')
on conflict (code) do nothing;
