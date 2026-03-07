"use client";

import { useState } from "react";
import { updatePersonAction, type UpdatePersonResult } from "@/app/lib/people-actions";
import type { PersonProfile } from "@/app/lib/person";

type ZoneOption = { id: string; name: string };

type EditPersonFormProps = {
  personId: string;
  person: PersonProfile;
  zoneOptions: ZoneOption[];
};

export default function EditPersonForm({
  personId,
  person,
  zoneOptions,
}: EditPersonFormProps) {
  const [firstName, setFirstName] = useState(person.firstName);
  const [lastName, setLastName] = useState(person.lastName);
  const [phoneNumber, setPhoneNumber] = useState(person.phoneNumber ?? "");
  const [email, setEmail] = useState(person.email ?? "");
  const [address, setAddress] = useState(person.address ?? "");
  const [congregation, setCongregation] = useState(person.congregation ?? "");
  const [zoneId, setZoneId] = useState(person.zoneId ?? "");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<UpdatePersonResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setPending(true);
    const res = await updatePersonAction(personId, {
      firstName,
      lastName,
      phoneNumber: phoneNumber || undefined,
      email: email || undefined,
      address: address || undefined,
      congregation: person.type === "guest" ? congregation || undefined : undefined,
      zoneId: person.type === "member" ? (zoneId || undefined) : undefined,
    });
    setPending(false);
    setResult(res);
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="lastName">
              Last name
            </label>
            <input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="phone">
              Phone {person.type === "guest" ? "(optional)" : ""}
            </label>
            <input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
              required={person.type === "member"}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="email">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-sm font-medium" htmlFor="address">
              Address (optional)
            </label>
            <input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          {person.type === "member" ? (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="zoneId">
                Department / Unit (Zone)
              </label>
              <select
                id="zoneId"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                <option value="">Select zone…</option>
                {zoneOptions.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {person.type === "guest" ? (
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="congregation">
                Congregation (optional)
              </label>
              <input
                id="congregation"
                value={congregation}
                onChange={(e) => setCongregation(e.target.value)}
                className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
              />
            </div>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={pending}
              className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>

          {result && (
            <div
              role="alert"
              className={`sm:col-span-2 rounded-md border px-3 py-2 text-sm ${
                result.ok
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {result.ok ? "Profile updated successfully." : result.error}
            </div>
          )}
        </form>
      </div>
  );
}
