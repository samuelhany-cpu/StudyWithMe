# Study With Me v1 Tasks

## 1. Repo Setup
- [ ] Finalize pnpm workspace with web, mobile, and shared packages
- [ ] Add root scripts for dev, build, lint, and typecheck
- [ ] Normalize generated app scaffolds for monorepo use

## 2. Shared Packages And Design System
- [ ] Create shared domain package for types, presets, metrics, and sample data
- [ ] Create shared design-tokens package for colors, spacing, and copy constants
- [ ] Create shared Supabase helper package for configuration and environment checks

## 3. Supabase Schema And Auth
- [ ] Define `profiles`, `focus_sessions`, `study_tasks`, `focus_rooms`, and notification preferences
- [ ] Configure Supabase clients for web and mobile
- [ ] Implement auth flows on both clients for email magic link and Google

## 4. Web App Shell And Routing
- [ ] Replace starter page with branded Study With Me dashboard shell
- [ ] Add sections for timer, stats, live presence, tasks, and rooms
- [ ] Prepare route structure for auth and dashboard flows

## 5. Mobile App Shell And Navigation
- [ ] Replace Expo starter screen with mobile dashboard shell
- [ ] Add timer-first mobile layout with stats, tasks, and rooms
- [ ] Prepare navigation structure for dashboard and future auth/settings screens

## 6. Shared Timer Engine And Persistence
- [ ] Build timer presets, state machine, and status transitions
- [ ] Restore active timer state after refresh or app reopen
- [ ] Enforce one active focus session per user

## 7. Dashboard Metrics And Charts
- [ ] Add streak computation by timezone
- [ ] Show today totals, longest streak, and weekly focus trends
- [ ] Surface recent sessions and subject tags

## 8. Realtime Global Presence
- [ ] Subscribe to global presence channel
- [ ] Show active user count and avatar strip
- [ ] Expire stale presence safely on disconnect

## 9. Ambient Rooms With Synced Timers
- [ ] Define room cards and room metadata
- [ ] Add occupancy and synced timer state
- [ ] Keep room interaction quiet and presence-based

## 10. Tasks And Task-Linked Sessions
- [ ] Add optional task selection before starting a session
- [ ] Track task progress from completed focus sessions
- [ ] Support task tags or study subjects in analytics

## 11. Notifications On Web And Mobile
- [ ] Add browser notifications for timer events
- [ ] Add Expo notifications for timer events and reminders
- [ ] Verify deep-link or resume behavior after notification taps

## 12. QA, Polish, Deploy
- [ ] Ship responsive web dashboard and polished mobile home
- [ ] Run lint and typecheck across the workspace
- [ ] Prepare web deployment for Vercel and mobile delivery through Expo
