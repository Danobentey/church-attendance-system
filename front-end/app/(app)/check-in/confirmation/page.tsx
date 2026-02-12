"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelectedService } from "../../selected-service";

function CheckInConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedService } = useSelectedService();

  const name = searchParams.get("name") ?? "Person";

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.push("/check-in");
    }, 2500);

    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Confirmation</h1>
        <p className="mt-1 text-sm text-zinc-600">Check-in result</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
          <span className="text-xl font-bold">✓</span>
        </div>
        <div className="text-lg font-semibold">{name} successfully checked in</div>
        <div className="mt-1 text-sm text-zinc-600">
          Service: {selectedService?.name ?? "No service selected"}
          {selectedService?.time ? ` (${selectedService.time})` : ""}
        </div>
        <div className="mt-1 text-sm text-zinc-600">
          Returning to search automatically in 2–3 seconds.
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/check-in"
            className="h-10 rounded-md bg-zinc-900 px-4 text-center text-sm font-semibold leading-10 text-white hover:bg-zinc-800"
          >
            Check in another person
          </Link>
          <Link
            href="/attendance-log"
            className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
          >
            View attendance log
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckInConfirmationPage() {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
      <CheckInConfirmationContent />
    </Suspense>
  );
}
