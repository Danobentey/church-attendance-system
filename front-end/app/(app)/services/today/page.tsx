import ServiceCards from "./service-cards";

export default function ServiceTodayPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Create / Select Service (Today)</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Ensure attendance is tied to a specific service.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold">Today’s services</div>
          <ServiceCards />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold">Create new service</div>
          <form className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="serviceName">
                Service name
              </label>
              <input
                id="serviceName"
                className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                placeholder="Sunday Service"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="date">
                Date
              </label>
              <input
                id="date"
                className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                placeholder="Auto-filled"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="time">
                Start time
              </label>
              <input
                id="time"
                className="h-10 rounded-md border border-zinc-300 px-3 text-sm outline-none focus:border-zinc-900"
                placeholder="08:00"
              />
            </div>

            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-sm font-medium" htmlFor="type">
                Service type
              </label>
              <select
                id="type"
                className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm"
              >
                <option>Sunday</option>
                <option>Midweek</option>
                <option>Special</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                className="h-10 w-full rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                Create service
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
