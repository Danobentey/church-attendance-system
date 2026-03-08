"use client";

import { useState } from "react";
import {
  UserPlus,
  ShieldCheck,
  Users,
  MapPin,
  Mail,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  UserX,
  UserCheck,
} from "lucide-react";
import {
  createLoginableUserAction,
  deactivateUserAction,
  reactivateUserAction,
  type UserListItem,
  type LoginableRole,
} from "@/app/lib/user-actions";

type ZoneOption = { id: string; name: string };

const ROLE_LABELS: Record<LoginableRole, string> = {
  admin: "Admin",
  secretariat: "Secretariat",
  zonal_leader: "Zonal Leader",
};

const ROLE_STYLES: Record<LoginableRole, string> = {
  admin: "bg-purple-100 text-purple-700 border border-purple-200",
  secretariat: "bg-blue-100 text-blue-700 border border-blue-200",
  zonal_leader: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

type Props = {
  users: UserListItem[];
  zoneOptions: ZoneOption[];
  currentUserId: string;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function UserManagementContent({ users: initialUsers, zoneOptions, currentUserId }: Props) {
  const [users, setUsers] = useState<UserListItem[]>(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<LoginableRole>("secretariat");
  const [zoneId, setZoneId] = useState("");
  const [pending, setPending] = useState(false);
  const [formResult, setFormResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Action state
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setPhoneNumber("");
    setRole("secretariat");
    setZoneId("");
    setFormResult(null);
    setShowPassword(false);
  }

  async function handleCreateUser() {
    setFormResult(null);
    setPending(true);
    try {
      const res = await createLoginableUserAction({
        firstName,
        lastName,
        email,
        password,
        phoneNumber,
        role,
        zoneId: zoneId || undefined,
      });
      if (res.ok) {
        setFormResult({ ok: true, message: "User created successfully." });
        // Optimistically add to list (page will revalidate server-side)
        const zoneName = zoneId ? (zoneOptions.find((z) => z.id === zoneId)?.name ?? null) : null;
        setUsers((prev) => [
          {
            id: res.userId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phoneNumber: phoneNumber.trim(),
            role,
            status: "active",
            zoneName,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        resetForm();
        setShowForm(false);
      } else {
        setFormResult({ ok: false, message: res.error });
      }
    } finally {
      setPending(false);
    }
  }

  async function handleDeactivate(userId: string) {
    setActionError(null);
    setActionPending(userId);
    setOpenMenuId(null);
    try {
      const res = await deactivateUserAction(userId);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "inactive" } : u))
        );
      } else {
        setActionError(res.error);
      }
    } finally {
      setActionPending(null);
    }
  }

  async function handleReactivate(userId: string) {
    setActionError(null);
    setActionPending(userId);
    setOpenMenuId(null);
    try {
      const res = await reactivateUserAction(userId);
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: "active" } : u))
        );
      } else {
        setActionError(res.error);
      }
    } finally {
      setActionPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs text-zinc-500">Settings</div>
          <h1 className="text-2xl font-semibold tracking-tight">User Management</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Create and manage system users — admins, secretariats, and zonal leaders.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowForm((v) => !v);
            setFormResult(null);
          }}
          className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700"
        >
          <UserPlus className="h-4 w-4" />
          {showForm ? "Cancel" : "Add User"}
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-zinc-900">New Loginable User</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              This user will receive login credentials and can access the system.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2">
            {/* First name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                className="h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* Last name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="h-10 rounded-lg border border-zinc-300 px-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@church.org"
                  className="h-10 w-full rounded-lg border border-zinc-300 pl-9 pr-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="080xxxxxxxx"
                  className="h-10 w-full rounded-lg border border-zinc-300 pl-9 pr-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="h-10 w-full rounded-lg border border-zinc-300 px-3 pr-10 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as LoginableRole)}
                  className="h-10 w-full appearance-none rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="admin">Admin</option>
                  <option value="secretariat">Secretariat</option>
                  <option value="zonal_leader">Zonal Leader</option>
                </select>
              </div>
            </div>

            {/* Zone — only relevant for zonal_leader */}
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Zone{" "}
                {role === "zonal_leader" ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="font-normal text-zinc-400">(optional)</span>
                )}
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-zinc-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                >
                  <option value="">No zone assigned</option>
                  {zoneOptions.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={pending}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating…
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create User
                  </>
                )}
              </button>
            </div>

            {formResult && (
              <div
                role="alert"
                className={`sm:col-span-2 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
                  formResult.ok
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {formResult.ok ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                )}
                {formResult.message}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global action error */}
      {actionError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          {actionError}
        </div>
      )}

      {/* User List */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-zinc-500" />
            <h2 className="text-sm font-semibold text-zinc-900">System Users</h2>
          </div>
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-600">
            {users.length}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Users className="h-8 w-8 text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">No users yet</p>
            <p className="text-xs text-zinc-400">Click "Add User" to create your first system user.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const roleKey = user.role as LoginableRole;
              const isInactive = user.status === "inactive";
              const isProcessing = actionPending === user.id;

              return (
                <div
                  key={user.id}
                  className={`group relative flex items-center gap-4 px-5 py-4 transition-colors ${
                    isInactive ? "bg-zinc-50 opacity-70" : "hover:bg-zinc-50/50"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      isInactive
                        ? "bg-zinc-200 text-zinc-400"
                        : "bg-zinc-900 text-white"
                    }`}
                  >
                    {user.firstName[0]?.toUpperCase()}
                    {user.lastName[0]?.toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-900">
                        {user.firstName} {user.lastName}
                      </span>
                      {isCurrentUser && (
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600">
                          You
                        </span>
                      )}
                      {ROLE_LABELS[roleKey] && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            ROLE_STYLES[roleKey] ?? "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {ROLE_LABELS[roleKey] ?? user.role}
                        </span>
                      )}
                      {isInactive && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      {user.email && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      )}
                      {user.zoneName && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin className="h-3 w-3" />
                          {user.zoneName}
                        </span>
                      )}
                      <span className="text-xs text-zinc-400">
                        Added {formatDate(user.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions menu */}
                  {!isCurrentUser && (
                    <div className="relative shrink-0">
                      {isProcessing ? (
                        <span className="flex h-8 w-8 items-center justify-center">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((id) => (id === user.id ? null : user.id))
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
                            aria-label="Actions"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {openMenuId === user.id && (
                            <div className="absolute right-0 top-9 z-10 min-w-[160px] rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                              {isInactive ? (
                                <button
                                  type="button"
                                  onClick={() => handleReactivate(user.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-50"
                                >
                                  <UserCheck className="h-4 w-4" />
                                  Reactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleDeactivate(user.id)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <UserX className="h-4 w-4" />
                                  Deactivate
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Click outside to close menu */}
      {openMenuId && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setOpenMenuId(null)}
        />
      )}
    </div>
  );
}
