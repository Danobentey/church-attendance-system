import Link from "next/link";

const members = [
  { id: "m-001", name: "John Doe", phone: "0801 234 5678", lastAttendance: "—" },
  { id: "m-002", name: "Mary Johnson", phone: "0802 111 2222", lastAttendance: "—" },
  { id: "m-003", name: "David Williams", phone: "0803 987 6543", lastAttendance: "—" },
];

export default function MemberListPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Member List</h1>
        <p className="mt-1 text-sm text-zinc-600">Browse and manage members.</p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-3">
          <input
            className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900 lg:col-span-1"
            placeholder="Search name or phone"
          />
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm">
            <option>Department (all)</option>
            <option>Choir</option>
            <option>Ushering</option>
            <option>Media</option>
          </select>
          <select className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm">
            <option>Attendance frequency (all)</option>
            <option>Consistent</option>
            <option>Irregular</option>
          </select>
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-600">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Phone</div>
            <div className="col-span-3">Last attendance</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {members.map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-12 items-center gap-2 border-t border-zinc-200 px-3 py-2"
            >
              <div className="col-span-4 text-sm font-semibold">{m.name}</div>
              <div className="col-span-3 text-sm text-zinc-700">{m.phone}</div>
              <div className="col-span-3 text-sm text-zinc-700">
                {m.lastAttendance}
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Link
                  href={`/people/${m.id}`}
                  className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-zinc-50"
                >
                  View profile
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-zinc-500">
        Pagination / bulk actions can be added in a later phase.
      </div>
    </div>
  );
}
