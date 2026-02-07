"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch } from "@/app/lib/api";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
    >
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
