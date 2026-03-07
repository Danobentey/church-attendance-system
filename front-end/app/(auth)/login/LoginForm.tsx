"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message ?? "Login failed.");
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Record login event — userId is derived server-side from the session
      try {
        await fetch("/api/audit/login", { method: "POST" });
      } catch (e) {
        console.error("Failed to log login event", e);
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Card */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-100">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 shadow-md">
            <span className="text-xl font-black text-white">C</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">COC Ikeja</h1>
          <p className="mt-1 text-sm text-zinc-500">Staff portal — sign in to continue</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-zinc-700" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none"
              placeholder="you@church.org"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-zinc-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-4 pr-12 text-sm placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-600"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-end">
            <button
              type="button"
              className="text-sm font-medium text-zinc-500 hover:text-zinc-900 hover:underline"
              onClick={() => {
                setError("Password reset will be added in a later phase.");
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60"
          >
            {loading ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-zinc-400">
        Access restricted to Admin, Secretariat, and Zonal Leaders.
      </p>
    </div>
  );
}
