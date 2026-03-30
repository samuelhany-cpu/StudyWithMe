# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install dependencies
pnpm install

# Run all dev servers (web + mobile)
pnpm dev

# Run individual apps
pnpm dev:web       # Next.js at localhost:3000
pnpm dev:mobile    # Expo CLI (scan QR for Expo Go)

# Build, lint, typecheck (all run via Turbo across workspace)
pnpm build
pnpm lint
pnpm typecheck

# Target a specific package
pnpm --filter @studywithme/web typecheck
pnpm --filter @studywithme/mobile typecheck
```

There are no test scripts configured yet.

## Architecture

This is a **pnpm + Turbo monorepo** for a cross-platform focus/study app.

```
apps/
  web/        Next.js 16 App Router (web dashboard + auth)
  mobile/     Expo 54 React Native (single App.tsx, all tabs)
packages/
  domain/         Pure TS: timer state machine, types, streak/focus calculations
  design-tokens/  Pure TS: color palette, spacing, app copy strings
  supabase/       Thin wrapper: Supabase client factories + table name constants
supabase/
  schema.sql      PostgreSQL DDL for all tables
```

### Key Design Decisions

**Shared domain package** (`@studywithme/domain`) contains all business logic with no framework dependencies — timer state machine, calculations, and types are reused across web and mobile without modification.

**Local-first timer state**: Timer runtime is serialized to localStorage (web) or AsyncStorage (mobile) immediately and restored on app restart via `parseTimerRuntime()` / `serializeTimerRuntime()` in the domain package.

**Mobile is a single file**: `apps/mobile/App.tsx` contains the full Expo app — all tabs (Dashboard, Rooms, Tasks, Settings) are defined in one large file.

**Realtime presence is ephemeral**: Live user counts use Supabase broadcast channels (not persistent DB records). The presence feature is stubbed/incomplete.

**Remote data is mocked**: Current dashboard renders a `DashboardSnapshot` with mock data. Supabase integration is wired up but not yet connected to live data in components.

### Environment Variables

Web (`apps/web/.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Mobile (`apps/mobile/.env.local`):
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

### Design Tokens

All UI colors, spacing constants, and UI copy strings live in `packages/design-tokens/src/index.ts`. Always use `studyPalette` for colors rather than hardcoding hex values. The palette is warm/earthy: `canvas` (#f7f1e7) as background, `accent` (#d96c3f) as primary orange, `moss` (#78906b) as secondary green.

### Timer State Machine

The timer is a pure functional state machine in `packages/domain/src/index.ts`. Phases: `idle → focus → break → completed`. Functions: `resumeTimer()`, `pauseTimer()`, `tickTimer()`, `resetTimer()`. The machine only ticks when `status === "active"` and `phase` is `"focus"` or `"break"`.

### Supabase Client Usage

Use `createStudyWithMeBrowserClient()` in web components and `createStudyWithMeNativeClient()` in the mobile app. Import table name constants from `@studywithme/supabase` rather than using string literals.
