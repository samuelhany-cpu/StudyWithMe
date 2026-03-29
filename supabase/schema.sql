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
