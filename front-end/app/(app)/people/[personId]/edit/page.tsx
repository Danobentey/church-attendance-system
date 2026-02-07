"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function EditPersonPage() {
  const params = useParams();
  const personIdParam = params.personId;
  const personId = Array.isArray(personIdParam)
    ? personIdParam[0]
    : (personIdParam ?? "");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Edit profile</div>
          <h1 className="text-2xl font-semibold">Person {personId}</h1>
        </div>
        <Link
          href={`/people/${personId}`}
          className="h-10 rounded-md border border-zinc-200 bg-white px-4 text-center text-sm font-semibold leading-10 hover:bg-zinc-50"
        >
          Back to profile
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="fullName">
              Full name
            </label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="department">
              Department / Unit
            </label>
            <input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Save changes
            </button>
          </div>

          {saved ? (
            <div className="sm:col-span-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Saved (placeholder).
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
