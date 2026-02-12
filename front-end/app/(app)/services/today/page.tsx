import ServiceCards from "./service-cards";
import CreateServiceForm from "./create-service-form";

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ServiceTodayPage() {
  const defaultDate = todayIsoDate();

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
          <CreateServiceForm defaultDate={defaultDate} />
        </div>
      </div>
    </div>
  );
}
