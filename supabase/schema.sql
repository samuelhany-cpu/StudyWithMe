create table if not exists profiles (
  id uuid primary key,
  display_name text,
  avatar_url text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create table if not exists study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  subject text not null,
  estimated_pomodoros integer not null default 1,
  completed_pomodoros integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists focus_rooms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  vibe text not null,
  synced_preset_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  task_id uuid references study_tasks (id) on delete set null,
  room_id uuid references focus_rooms (id) on delete set null,
  subject text not null,
  focus_minutes integer not null,
  break_minutes integer not null,
  status text not null check (status in ('active', 'paused', 'completed')),
  started_at timestamptz not null,
  completed_at timestamptz
);

create table if not exists notification_preferences (
  user_id uuid primary key,
  timer_end_enabled boolean not null default true,
  break_end_enabled boolean not null default true,
  streak_risk_enabled boolean not null default true,
  daily_reminder_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Row level security

alter table profiles enable row level security;
alter table study_tasks enable row level security;
alter table focus_sessions enable row level security;
alter table focus_rooms enable row level security;
alter table notification_preferences enable row level security;

create policy "users manage own profile" on profiles
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "users read own tasks" on study_tasks
  for select using (auth.uid() = user_id);
create policy "users insert own tasks" on study_tasks
  for insert with check (auth.uid() = user_id);
create policy "users update own tasks" on study_tasks
  for update using (auth.uid() = user_id);
create policy "users delete own tasks" on study_tasks
  for delete using (auth.uid() = user_id);

create policy "users read own sessions" on focus_sessions
  for select using (auth.uid() = user_id);
create policy "users insert own sessions" on focus_sessions
  for insert with check (auth.uid() = user_id);
create policy "users update own sessions" on focus_sessions
  for update using (auth.uid() = user_id);

create policy "authenticated users read rooms" on focus_rooms
  for select using (auth.role() = 'authenticated');

create policy "users manage own notification prefs" on notification_preferences
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
