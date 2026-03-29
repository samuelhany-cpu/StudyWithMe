"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { appCopy } from "@studywithme/design-tokens";
import { createStudyWithMeBrowserClient, readSupabaseConfig } from "@studywithme/supabase";

const config = readSupabaseConfig({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

const supabase = createStudyWithMeBrowserClient(config);

export function AuthPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Use email magic links or Google once Supabase env vars are configured.");
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setStatus("Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable auth.");
      return;
    }

    if (!email) {
      setStatus("Enter an email address first.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);
    setStatus(error ? error.message : "Magic link sent. Check your inbox and return to the dashboard.");
  };

  const handleGoogle = async () => {
    if (!supabase) {
      setStatus("Supabase env vars are still missing, so Google sign-in is disabled.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(239,193,168,0.45),_transparent_38%),linear-gradient(180deg,_#f7f1e7_0%,_#efe6d7_100%)] px-4 py-6 text-[color:var(--ink)] sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[36px] border border-[color:var(--border)] bg-[linear-gradient(140deg,rgba(255,250,242,0.98),rgba(244,226,209,0.92))] p-8 shadow-[0_24px_80px_rgba(44,31,19,0.10)]">
          <div className="inline-flex rounded-full border border-[color:var(--border)] bg-white/70 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[color:var(--muted-ink)]">
            Auth Flow
          </div>
          <h1 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">{appCopy.name}</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[color:var(--muted-ink)] sm:text-lg">
            Sign in to sync your timer, streaks, rooms, and live presence across web and mobile. Until Supabase keys are added, this page doubles as the auth integration checklist.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <FeatureCard label="Magic Links" detail="Fast email sign-in with no password management." />
            <FeatureCard label="Google OAuth" detail="One-tap login for users who want the quickest setup." />
            <FeatureCard label="Shared Session" detail="The same identity model will power web and Expo clients." />
          </div>
        </section>

        <section className="rounded-[36px] bg-[color:var(--night)] p-8 text-white shadow-[0_24px_80px_rgba(24,18,14,0.24)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-white/50">Sign in</p>
            <Link href="/dashboard" className="text-sm text-white/75 underline-offset-4 hover:underline">
              Back to dashboard
            </Link>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleMagicLink}>
            <label className="block text-sm text-white/70">
              Email
              <input
                className="mt-2 w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none ring-0 placeholder:text-white/35"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>

          <button
            type="button"
            disabled={loading}
            className="mt-4 w-full rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/85 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleGoogle}
          >
            Continue with Google
          </button>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm leading-6 text-white/72">
            {status}
          </div>

          <div className="mt-6 rounded-[24px] border border-white/10 bg-white/6 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">Required env vars</p>
            <ul className="mt-3 space-y-2 text-sm text-white/72">
              <li>`NEXT_PUBLIC_SUPABASE_URL`</li>
              <li>`NEXT_PUBLIC_SUPABASE_ANON_KEY`</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureCard({ label, detail }: { label: string; detail: string }) {
  return (
    <article className="rounded-[24px] border border-[color:var(--border)] bg-white/70 p-4">
      <p className="text-lg font-semibold">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--muted-ink)]">{detail}</p>
    </article>
  );
}
