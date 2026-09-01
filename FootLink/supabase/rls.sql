-- ============================================================================
-- FootLink — Row Level Security policies (Supabase)
-- ----------------------------------------------------------------------------
-- Run AFTER schema.sql. Enables RLS on every table and adds permissive
-- policies matching the mobile app's access rules.
--
-- Security model:
--   * Registered players (auth.users) read public content.
--   * A user manages their own profile.
--   * Organizers own their matches / teams / venues.
--   * Match participants can post messages in the match chat.
--   * No exact private home addresses are stored (only approximate coords).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Helper: current authenticated user id
-- ---------------------------------------------------------------------------
-- auth.uid() is provided by Supabase. We reference it directly in policies.

-- ---------------------------------------------------------------------------
-- countries & cities — readable by everyone, written by admins
-- ---------------------------------------------------------------------------
alter table public.countries enable row level security;
alter table public.cities enable row level security;

create policy "countries are public"
  on public.countries for select using (true);

create policy "cities are public"
  on public.cities for select using (true);

-- ---------------------------------------------------------------------------
-- player_profiles
-- ---------------------------------------------------------------------------
alter table public.player_profiles enable row level security;

create policy "profiles are visible to authenticated users"
  on public.player_profiles for select
  using (auth.role() = 'authenticated');

create policy "user can insert own profile"
  on public.player_profiles for insert
  with check (auth.uid() = user_id);

create policy "user can update own profile"
  on public.player_profiles for update
  using (auth.uid() = user_id);

create policy "user can delete own profile"
  on public.player_profiles for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- positions — public
-- ---------------------------------------------------------------------------
alter table public.positions enable row level security;
create policy "positions are public" on public.positions for select using (true);

-- ---------------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------------
alter table public.teams enable row level security;

create policy "teams are readable"
  on public.teams for select using (auth.role() = 'authenticated');

create policy "captain creates team"
  on public.teams for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = captain_id));

create policy "captain updates team"
  on public.teams for update
  using (auth.uid() = (select user_id from public.player_profiles where id = captain_id));

create policy "captain deletes team"
  on public.teams for delete
  using (auth.uid() = (select user_id from public.player_profiles where id = captain_id));

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------
alter table public.team_members enable row level security;

create policy "team members readable"
  on public.team_members for select using (auth.role() = 'authenticated');

create policy "players can join"
  on public.team_members for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = player_id));

create policy "captain manages members"
  on public.team_members for all
  using (
    auth.uid() = (
      select pp.user_id from public.teams t
      join public.player_profiles pp on pp.id = t.captain_id
      where t.id = team_id
    )
  )
  with check (
    auth.uid() = (
      select pp.user_id from public.teams t
      join public.player_profiles pp on pp.id = t.captain_id
      where t.id = team_id
    )
  );

-- ---------------------------------------------------------------------------
-- team_join_requests
-- ---------------------------------------------------------------------------
alter table public.team_join_requests enable row level security;

create policy "requests readable by team captain"
  on public.team_join_requests for select
  using (
    auth.uid() = (
      select pp.user_id from public.teams t
      join public.player_profiles pp on pp.id = t.captain_id
      where t.id = team_id
    )
  );

create policy "player can request to join"
  on public.team_join_requests for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = player_id));

create policy "captain approves or rejects"
  on public.team_join_requests for update
  using (
    auth.uid() = (
      select pp.user_id from public.teams t
      join public.player_profiles pp on pp.id = t.captain_id
      where t.id = team_id
    )
  );

-- ---------------------------------------------------------------------------
-- matches
-- ---------------------------------------------------------------------------
alter table public.matches enable row level security;

create policy "matches readable by authenticated players"
  on public.matches for select
  using (auth.role() = 'authenticated');

create policy "players create matches"
  on public.matches for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = organizer_id));

create policy "organizer updates match"
  on public.matches for update
  using (auth.uid() = (select user_id from public.player_profiles where id = organizer_id));

create policy "organizer deletes match"
  on public.matches for delete
  using (auth.uid() = (select user_id from public.player_profiles where id = organizer_id));

-- ---------------------------------------------------------------------------
-- match_players
-- ---------------------------------------------------------------------------
alter table public.match_players enable row level security;

create policy "match players readable"
  on public.match_players for select using (auth.role() = 'authenticated');

create policy "players join matches"
  on public.match_players for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = player_id));

create policy "players leave matches"
  on public.match_players for delete
  using (auth.uid() = (select user_id from public.player_profiles where id = player_id));

-- ---------------------------------------------------------------------------
-- venues & bookings
-- ---------------------------------------------------------------------------
alter table public.venues enable row level security;

create policy "venues readable"
  on public.venues for select using (auth.role() = 'authenticated');

create policy "owner creates venue"
  on public.venues for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = owner_id));

create policy "owner manages venue"
  on public.venues for all
  using (auth.uid() = (select user_id from public.player_profiles where id = owner_id))
  with check (auth.uid() = (select user_id from public.player_profiles where id = owner_id));

alter table public.venue_bookings enable row level security;

create policy "bookings readable by owner/users"
  on public.venue_bookings for select
  using (
    auth.uid() in (
      select pp.user_id from public.venues v
      join public.player_profiles pp on pp.id = v.owner_id
      where v.id = venue_id
    )
    or auth.uid() = (select user_id from public.player_profiles where id = user_id)
  );

create policy "users request bookings"
  on public.venue_bookings for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = user_id));

create policy "venue owner confirms bookings"
  on public.venue_bookings for update
  using (
    auth.uid() = (
      select pp.user_id from public.venues v
      join public.player_profiles pp on pp.id = v.owner_id
      where v.id = venue_id
    )
  );

-- ---------------------------------------------------------------------------
-- player_availability
-- ---------------------------------------------------------------------------
alter table public.player_availability enable row level security;
create policy "availability readable" on public.player_availability for select using (auth.role() = 'authenticated');
create policy "owner manages availability" on public.player_availability for all
  using (auth.uid() = (select user_id from public.player_profiles where id = player_id))
  with check (auth.uid() = (select user_id from public.player_profiles where id = player_id));

-- ---------------------------------------------------------------------------
-- ratings & reviews
-- ---------------------------------------------------------------------------
alter table public.ratings enable row level security;
create policy "ratings readable" on public.ratings for select using (auth.role() = 'authenticated');
create policy "players rate after matches" on public.ratings for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = reviewer_id));

alter table public.reviews enable row level security;
create policy "reviews readable" on public.reviews for select using (auth.role() = 'authenticated');
create policy "players write reviews" on public.reviews for insert
  with check (auth.uid() = (select user_id from public.player_profiles where id = reviewer_id));

-- ---------------------------------------------------------------------------
-- messages (match chat)
-- ---------------------------------------------------------------------------
alter table public.messages enable row level security;

create policy "participants read match chat"
  on public.messages for select
  using (
    auth.role() = 'authenticated' and exists (
      select 1 from public.match_players mp
      join public.player_profiles pp on pp.id = mp.player_id
      where mp.match_id = messages.match_id and pp.user_id = auth.uid()
    )
  );

create policy "participants post messages"
  on public.messages for insert
  with check (
    auth.uid() = (select user_id from public.player_profiles where id = sender_id)
    and exists (
      select 1 from public.match_players mp
      join public.player_profiles pp on pp.id = mp.player_id
      where mp.match_id = messages.match_id and pp.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- notifications — only visible to their owner
-- ---------------------------------------------------------------------------
alter table public.notifications enable row level security;
create policy "users see own notifications" on public.notifications for select
  using (auth.uid() = user_id);
create policy "users update own notifications" on public.notifications for update
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
alter table public.favorites enable row level security;
create policy "users see own favorites" on public.favorites for select using (auth.uid() = user_id);
create policy "users add favorites" on public.favorites for insert with check (auth.uid() = user_id);
create policy "users remove favorites" on public.favorites for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reports & blocked_users — self-managed
-- ---------------------------------------------------------------------------
alter table public.reports enable row level security;
create policy "users create reports" on public.reports for insert
  with check (auth.uid() = reporter_id);
create policy "admins/reporter read reports" on public.reports for select
  using (auth.uid() = reporter_id);

alter table public.blocked_users enable row level security;
create policy "users manage own blocks" on public.blocked_users for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

-- ---------------------------------------------------------------------------
-- badges & user_badges
-- ---------------------------------------------------------------------------
alter table public.badges enable row level security;
create policy "badges are public" on public.badges for select using (true);

alter table public.user_badges enable row level security;
create policy "badges visible" on public.user_badges for select using (auth.role() = 'authenticated');
