"use client";

import { startTransition, useEffect, useState } from "react";
import { appCopy } from "@studywithme/design-tokens";
import {
  createMockDashboardSnapshot,
  createTimerRuntime,
  formatFocusMinutes,
  formatSecondsClock,
  getProgressRatio,
  getWeeklyAverage,
  getWeeklyPeak,
  pauseTimer,
  resetTimer,
  resumeTimer,
  tickTimer,
  timerPresets,
  updateTimerPreset,
  weekLabels,
} from "@studywithme/domain";
import { getSupabaseStatusMessage, readSupabaseConfig } from "@studywithme/supabase";

const snapshot = createMockDashboardSnapshot();

const supabaseState = readSupabaseConfig({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

function StatCard({
  eyebrow,
  value,
  detail,
}: {
  eyebrow: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--paper)] p-5 shadow-[0_18px_60px_rgba(44,31,19,0.08)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">{eyebrow}</p>
      <h3 className="mt-3 text-3xl font-semibold text-[color:var(--ink)]">{value}</h3>
      <p className="mt-2 text-sm text-[color:var(--muted-ink)]">{detail}</p>
    </article>
  );
}

export function DashboardPage() {
  const [timerState, setTimerState] = useState(() => createTimerRuntime(snapshot.activePreset));

  useEffect(() => {
    if (!["focus", "break"].includes(timerState.phase)) {
      return;
    }

    const interval = window.setInterval(() => {
      setTimerState((current) => tickTimer(current));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerState.phase]);

  const weeklyAverage = getWeeklyAverage(snapshot.weeklyFocusMinutes);
  const weeklyPeak = getWeeklyPeak(snapshot.weeklyFocusMinutes);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,193,168,0.55),_transparent_40%),linear-gradient(180deg,_#f7f1e7_0%,_#efe6d7_100%)] px-4 py-6 text-[color:var(--ink)] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[36px] border border-[color:var(--border)] bg-[linear-gradient(135deg,rgba(255,250,242,0.98),rgba(250,236,224,0.94))] p-6 shadow-[0_24px_80px_rgba(44,31,19,0.10)] lg:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">
                Live Dashboard
              </div>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl">
                  {appCopy.name}
                </h1>
                <p className="max-w-2xl text-base text-[color:var(--muted-ink)] sm:text-lg">
                  {appCopy.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white">
                  {snapshot.liveUsers} people studying live
                </div>
                <div className="rounded-full border border-[color:var(--border)] bg-white/75 px-4 py-2 text-sm text-[color:var(--muted-ink)]">
                  {getSupabaseStatusMessage(supabaseState.configured)}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {snapshot.presence.map((user) => (
                  <div
                    key={user.id}
                    className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-white/80 px-3 py-2 text-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--night)] text-xs font-semibold text-white">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs capitalize text-[color:var(--muted-ink)]">{user.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <section className="rounded-[32px] bg-[color:var(--night)] p-6 text-white shadow-[0_24px_60px_rgba(24,18,14,0.25)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">Current cycle</p>
                  <h2 className="mt-2 text-2xl font-semibold">{timerState.preset.label}</h2>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-sm capitalize">
                  {timerState.phase}
                </div>
              </div>
              <div className="mt-8 rounded-[28px] border border-white/10 bg-white/6 p-5">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/50">Time left</p>
                  <div className="mt-3 text-6xl font-semibold tracking-tight sm:text-7xl">
                    {formatSecondsClock(timerState.secondsRemaining)}
                  </div>
                  <p className="mt-3 text-sm text-white/60">
                    Completed focus today: {formatFocusMinutes(snapshot.todayFocusMinutes + timerState.completedFocusMinutes)}
                  </p>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white"
                    onClick={() => setTimerState((current) => resumeTimer(current))}
                  >
                    {timerState.phase === "paused" ? "Resume" : timerState.phase === "idle" ? "Start session" : "Keep flowing"}
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/85"
                    onClick={() => setTimerState((current) => pauseTimer(current))}
                  >
                    Pause
                  </button>
                  <button
                    type="button"
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/85"
                    onClick={() => setTimerState(resetTimer(timerState.preset))}
                  >
                    Reset
                  </button>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/50">Presets</p>
                <div className="flex flex-wrap gap-2">
                  {timerPresets.map((preset) => {
                    const isActive = preset.id === timerState.preset.id;

                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          isActive
                            ? "bg-white text-[color:var(--night)]"
                            : "border border-white/15 bg-transparent text-white/75"
                        }`}
                        onClick={() =>
                          startTransition(() => {
                            setTimerState((current) => updateTimerPreset(current, preset));
                          })
                        }
                      >
                        {preset.label} · {preset.focusMinutes}/{preset.breakMinutes}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr_0.9fr]">
          <StatCard
            eyebrow="Current streak"
            value={`${snapshot.currentStreak} days`}
            detail={`Longest streak: ${snapshot.longestStreak} days`}
          />
          <StatCard
            eyebrow="Today focus"
            value={formatFocusMinutes(snapshot.todayFocusMinutes)}
            detail={`${weeklyAverage} min average over the last 7 days`}
          />
          <StatCard
            eyebrow="Focus score"
            value={`${snapshot.focusScore}/100`}
            detail={`Room-ready with ${snapshot.liveUsers} people online right now`}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--paper)] p-6 shadow-[0_18px_60px_rgba(44,31,19,0.08)]">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">Weekly rhythm</p>
                <h2 className="mt-2 text-2xl font-semibold">Focus minutes by day</h2>
              </div>
              <p className="text-sm text-[color:var(--muted-ink)]">Peak day: {weeklyPeak} min</p>
            </div>
            <div className="mt-8 grid h-64 grid-cols-7 items-end gap-3">
              {snapshot.weeklyFocusMinutes.map((minutes, index) => (
                <div key={weekLabels[index]} className="flex h-full flex-col items-center justify-end gap-3">
                  <div className="text-xs text-[color:var(--muted-ink)]">{minutes}</div>
                  <div className="flex h-full w-full items-end">
                    <div
                      className="w-full rounded-t-[18px] bg-[linear-gradient(180deg,#efc1a8_0%,#d96c3f_100%)]"
                      style={{
                        height: `${Math.max((minutes / weeklyPeak) * 100, 12)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs uppercase tracking-[0.18em] text-[color:var(--muted-ink)]">
                    {weekLabels[index]}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <div className="grid gap-6">
            <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--paper)] p-6 shadow-[0_18px_60px_rgba(44,31,19,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">Task queue</p>
                  <h2 className="mt-2 text-2xl font-semibold">Linked study goals</h2>
                </div>
                <span className="rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[color:var(--ink)]">
                  Optional in v1
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {snapshot.tasks.map((task) => (
                  <div key={task.id} className="rounded-[24px] border border-[color:var(--border)] bg-white/75 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <p className="mt-1 text-sm text-[color:var(--muted-ink)]">{task.subject}</p>
                      </div>
                      <span className="text-sm text-[color:var(--muted-ink)]">
                        {task.completedPomodoros}/{task.estimatedPomodoros}
                      </span>
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-[color:var(--accent-soft)]/45">
                      <div
                        className="h-full rounded-full bg-[color:var(--accent)]"
                        style={{ width: `${getProgressRatio(task) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--paper)] p-6 shadow-[0_18px_60px_rgba(44,31,19,0.08)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">Ambient rooms</p>
              <h2 className="mt-2 text-2xl font-semibold">Quiet spaces to drop into</h2>
              <div className="mt-6 space-y-3">
                {snapshot.rooms.map((room) => (
                  <div key={room.id} className="rounded-[24px] bg-[color:var(--night)] p-4 text-white">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold">{room.name}</h3>
                        <p className="mt-1 text-sm text-white/60">{room.vibe}</p>
                      </div>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs">{room.occupancy} inside</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
