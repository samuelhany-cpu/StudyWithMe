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
Scaffold the monorepo and shared packages first, then implement the timer and dashboard shells before wiring live data.
