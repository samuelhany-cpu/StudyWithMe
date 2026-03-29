# Study With Me Memory

## Project Identity
Study With Me is a cross-platform focus product for web and React Native. It is meant to feel calm, premium, and motivating while blending personal productivity with live community presence.

## Current Decisions
- Full feature parity across web and mobile for the core product loop
- Stack is `Next.js + Expo + Supabase`
- Web deploy target is `Vercel`
- Auth methods are email magic link and Google
- Product is personal productivity first, with community presence layered in
- Realtime users are shown as global active count plus avatars
- The feature pillar after the core dashboard is ambient focus and body doubling without video

## Core Scope
- Dashboard
- Timer
- Streaks
- Focus analytics
- Task-linked sessions
- Ambient rooms
- Notifications

## Explicit Non-Goals For v1
- No chat
- No live video
- No leaderboard-first design
- No heavy social feed

## Implementation Preferences
- Share business logic and types across web and mobile
- Keep platform-native UI patterns where they improve usability
- Treat realtime presence as ephemeral channel state, not a permanent table

## Next Recommended Step
Wire live Supabase data into the existing web/mobile shells next, then complete realtime presence, native Google OAuth, and notification deep-link verification.

## Current Implementation Status
- Root docs and pnpm workspace are in place
- Shared domain, design tokens, and Supabase helper packages are implemented
- Web has `/dashboard` and `/sign-in` routes with dashboard state persistence and browser notifications
- Mobile has local-mode auth shell, timer/task persistence, Expo local notifications, and settings scaffolding
- Supabase schema scaffolding exists at `supabase/schema.sql`
- Remaining v1 gaps are realtime presence subscriptions, full native Google auth flow, and notification tap/deep-link verification
