# Study With Me Plan

## Product Summary
Study With Me is a cross-platform focus app for web and React Native. The product combines a personal productivity dashboard with live community presence, ambient focus rooms, task-linked study sessions, and clean UI that feels calm and motivating instead of clinical.

## Technical Architecture
- Monorepo with `Next.js` for web, `Expo React Native` for mobile, and shared packages for domain logic, types, UI tokens, and Supabase helpers
- `Supabase` for auth, database, and realtime presence
- `Vercel` for web deployment
- Shared business rules across clients with platform-native presentation where appropriate

## Core Entities
- `profiles`
- `focus_sessions`
- `study_tasks`
- `focus_rooms`
- `notification_preferences`

## v1 Features
- Email magic link and Google auth
- Pomodoro presets plus custom focus and break durations
- Streaks, daily totals, weekly trends, and longest streak
- Dashboard on web and mobile
- Global live user count with avatar strip
- Task-linked focus sessions
- Quiet ambient rooms with synced timers
- Notifications for session end, break end, scheduled study, and streak-risk reminders

## v1.5 Candidates
- Friend and favorite users
- Recurring room sessions
- Achievements and badges
- Richer analytics by subject and time of day
- Manual session editing

## Product Rules
- One active focus session per user at a time
- Only completed focus sessions count toward streaks and focus totals
- Presence is realtime and ephemeral, not a permanent table
- v1 excludes chat and live video
- Web and mobile should share capabilities even if the layouts differ

## Acceptance Criteria
- Users can sign in on web and mobile and reach the dashboard
- Users can start, pause, resume, and complete focus sessions on both platforms
- Dashboards show streaks, today totals, and trend data consistently across platforms
- Live presence updates in near real time when users enter or leave
- Ambient rooms support synced timers and occupancy without introducing chat
- Notifications work for session timing and reminders on web and mobile
