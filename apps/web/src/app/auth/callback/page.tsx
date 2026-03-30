"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get("code");

    if (code && supabase) {
      supabase.auth
        .exchangeCodeForSession(code)
        .finally(() => router.replace("/dashboard"));
    } else {
      router.replace("/dashboard");
    }
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f1e7]">
      <p className="text-[#5f564d]">Signing you in…</p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f1e7]">
          <p className="text-[#5f564d]">Signing you in…</p>
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
