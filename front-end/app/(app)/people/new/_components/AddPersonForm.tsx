"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  createMemberAction,
  insertGuestAction,
  type CreateMemberResult,
  type CreateGuestResult,
} from "@/app/lib/people-actions";
import { createZoneAction } from "@/app/lib/zone-actions";

type PersonType = "Member" | "Guest";

export type ZoneOption = { id: string; name: string };

const ADD_ZONE_VALUE = "__add_zone__";

type AddPersonFormProps = {
  zoneOptions: ZoneOption[];
  canAddZone?: boolean;
};

function AddPersonFormInner({
  zoneOptions: initialZoneOptions,
  canAddZone = false,
}: AddPersonFormProps) {
  const [zoneList, setZoneList] = useState<ZoneOption[]>(initialZoneOptions);
  const searchParams = useSearchParams();
  const initialType = useMemo<PersonType>(() => {
    return searchParams.get("type") === "guest" ? "Guest" : "Member";
  }, [searchParams]);

  const [type, setType] = useState<PersonType>(initialType);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [congregation, setCongregation] = useState("");
  const [address, setAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<CreateMemberResult | CreateGuestResult | null>(null);

  const [newZoneName, setNewZoneName] = useState("");
  const [newZoneAbbreviation, setNewZoneAbbreviation] = useState("");
  const [addZonePending, setAddZonePending] = useState(false);
  const [addZoneError, setAddZoneError] = useState<string | null>(null);

  async function handleSubmit() {
    setResult(null);
    setPending(true);
    try {
      if (type === "Member") {
        if (!zoneId || zoneId === ADD_ZONE_VALUE) {
          setResult({
            ok: false,
            error: "Please select a zone or create one above.",
          });
          setPending(false);
          return;
        }
        const res = await createMemberAction({
          firstName,
          lastName,
          phoneNumber: phone,
          email: email || undefined,
          zoneId,
        });
        setResult(res);
        if (res.ok) {
          setFirstName("");
          setLastName("");
          setPhone("");
          setEmail("");
          setZoneId("");
        }
      } else {
        const res = await insertGuestAction({
          firstName,
          lastName,
          phoneNumber: phone || undefined,
          email: email || undefined,
          congregation: congregation || undefined,
          address: address || undefined,
        });
        setResult(res);
        if (res.ok) {
          setFirstName("");
          setLastName("");
          setPhone("");
          setEmail("");
          setCongregation("");
          setAddress("");
        }
      }
    } finally {
      setPending(false);
    }
  }

  async function handleAddZone() {
    setAddZoneError(null);
    setAddZonePending(true);
    try {
      const res = await createZoneAction(newZoneName, newZoneAbbreviation);
      if (res.ok) {
        setZoneList((prev) => [...prev, { id: res.zone.id, name: res.zone.name }]);
        setZoneId(res.zone.id);
        setNewZoneName("");
        setNewZoneAbbreviation("");
      } else {
        setAddZoneError(res.error);
      }
    } finally {
      setAddZonePending(false);
    }
  }

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
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="firstName">
              First name
            </label>
            <input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
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
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="phone">
              Phone number {type === "Guest" ? "(optional)" : ""}
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
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
            />
          </div>

          {type === "Member" ? (
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="zone">
                Department / Unit (Zone) <span className="text-red-600">*</span>
              </label>
              <select
                id="zone"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                <option value="">Select zone…</option>
                {zoneList.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
                {canAddZone ? (
                  <option value={ADD_ZONE_VALUE}>Add zone…</option>
                ) : null}
              </select>

              {zoneId === ADD_ZONE_VALUE && canAddZone ? (
                <div className="flex flex-col gap-2 rounded-md border border-zinc-200 bg-zinc-50 p-3">
                  <div className="text-sm font-medium text-zinc-700">
                    New zone
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      placeholder="Zone name (e.g. Egbeda)"
                      className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-900"
                    />
                    <input
                      value={newZoneAbbreviation}
                      onChange={(e) =>
                        setNewZoneAbbreviation(e.target.value.toUpperCase())
                      }
                      placeholder="Abbreviation (e.g. EGB)"
                      className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:border-zinc-900"
                      maxLength={10}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddZone}
                      disabled={addZonePending || !newZoneName.trim() || !newZoneAbbreviation.trim()}
                      className="h-9 rounded-md bg-zinc-900 px-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
                    >
                      {addZonePending ? "Creating…" : "Create zone"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoneId("")}
                      className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                  </div>
                  {addZoneError ? (
                    <div
                      role="alert"
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-sm text-red-700"
                    >
                      {addZoneError}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {type === "Guest" ? (
            <>
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
            </>
          ) : null}

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
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
              {result.ok
                ? type === "Member"
                  ? "Member saved successfully."
                  : "Guest saved successfully."
                : result.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AddPersonForm(props: AddPersonFormProps) {
  return (
    <Suspense fallback={<div className="text-sm text-zinc-500">Loading…</div>}>
      <AddPersonFormInner {...props} />
    </Suspense>
  );
}
