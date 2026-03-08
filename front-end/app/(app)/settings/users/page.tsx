import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/app/lib/auth";
import { listLoginableUsersAction } from "@/app/lib/user-actions";
import { db } from "@/app/lib/db";
import { zones } from "@/app/lib/db/schema";
import { UserManagementContent } from "./_components/UserManagementContent";

export default async function UserManagementPage() {
  const profile = await getProfile();

  if (!profile) redirect("/login");
  if (profile.role !== "admin") redirect("/settings");

  const [users, zoneRows] = await Promise.all([
    listLoginableUsersAction(),
    db.select({ id: zones.id, name: zones.name }).from(zones).orderBy(zones.name),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <Link href="/settings" className="hover:text-zinc-700 hover:underline">
          Settings
        </Link>
        <span>/</span>
        <span>User Management</span>
      </div>

      <UserManagementContent
        users={users}
        zoneOptions={zoneRows}
        currentUserId={profile.id}
      />
    </div>
  );
}
