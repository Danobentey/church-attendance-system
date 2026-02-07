"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type PersonType = "Member" | "Guest";

export default function AddPersonPage() {
  const searchParams = useSearchParams();
  const initialType = useMemo<PersonType>(() => {
    return searchParams.get("type") === "guest" ? "Guest" : "Member";
  }, [searchParams]);

  const [type, setType] = useState<PersonType>(initialType);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [department, setDepartment] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Add New Member / Guest</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Register people into the church database.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setType("Member")}
            className={`h-9 rounded-md px-3 text-sm font-semibold ${
              type === "Member"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Member
          </button>
          <button
            type="button"
            onClick={() => setType("Guest")}
            className={`h-9 rounded-md px-3 text-sm font-semibold ${
              type === "Guest"
                ? "bg-zinc-900 text-white"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Guest
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
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
              Phone number
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
              Email (optional)
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="gender">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
            >
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="ageGroup">
              Age group
            </label>
            <select
              id="ageGroup"
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
            >
              <option value="">Select…</option>
              <option value="child">Child</option>
              <option value="teen">Teen</option>
              <option value="adult">Adult</option>
              <option value="senior">Senior</option>
            </select>
          </div>

          {type === "Member" ? (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="department">
                Department / Unit
              </label>
              <input
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                placeholder="Choir, Ushering, Media…"
              />
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setSaved(true)}
              className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Save
            </button>
          </div>

          {saved ? (
            <div className="sm:col-span-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
              Saved (placeholder). Hook up persistence later.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
