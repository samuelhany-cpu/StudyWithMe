# Study With Me v1 Tasks

## 1. Repo Setup
- [x] Finalize pnpm workspace with web, mobile, and shared packages
- [x] Add root scripts for dev, build, lint, and typecheck
- [x] Normalize generated app scaffolds for monorepo use

## 2. Shared Packages And Design System
- [x] Create shared domain package for types, presets, metrics, and sample data
- [x] Create shared design-tokens package for colors, spacing, and copy constants
- [x] Create shared Supabase helper package for configuration and environment checks

## 3. Supabase Schema And Auth
- [x] Define `profiles`, `focus_sessions`, `study_tasks`, `focus_rooms`, and notification preferences
- [x] Configure Supabase clients for web and mobile
- [ ] Implement auth flows on both clients for email magic link and Google

## 4. Web App Shell And Routing
- [x] Replace starter page with branded Study With Me dashboard shell
- [x] Add sections for timer, stats, live presence, tasks, and rooms
- [x] Prepare route structure for auth and dashboard flows

## 5. Mobile App Shell And Navigation
- [x] Replace Expo starter screen with mobile dashboard shell
- [x] Add timer-first mobile layout with stats, tasks, and rooms
- [x] Prepare navigation structure for dashboard and future auth/settings screens

## 6. Shared Timer Engine And Persistence
- [x] Build timer presets, state machine, and status transitions
- [x] Restore active timer state after refresh or app reopen
- [x] Enforce one active focus session per user

## 7. Dashboard Metrics And Charts
- [x] Add streak computation by timezone
- [x] Show today totals, longest streak, and weekly focus trends
- [x] Surface recent sessions and subject tags

## 8. Realtime Global Presence
- [ ] Subscribe to global presence channel
- [x] Show active user count and avatar strip
- [ ] Expire stale presence safely on disconnect

## 9. Ambient Rooms With Synced Timers
- [x] Define room cards and room metadata
- [x] Add occupancy and synced timer state
- [x] Keep room interaction quiet and presence-based

## 10. Tasks And Task-Linked Sessions
- [x] Add optional task selection before starting a session
- [x] Track task progress from completed focus sessions
- [x] Support task tags or study subjects in analytics

## 11. Notifications On Web And Mobile
- [x] Add browser notifications for timer events
- [x] Add Expo notifications for timer events and reminders
- [ ] Verify deep-link or resume behavior after notification taps

## 12. QA, Polish, Deploy
- [x] Ship responsive web dashboard and polished mobile home
- [x] Run lint and typecheck across the workspace
- [x] Prepare web deployment for Vercel and mobile delivery through Expo
