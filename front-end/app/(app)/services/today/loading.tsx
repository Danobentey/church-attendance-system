import { Skeleton, SkeletonCard } from "../../_components/Skeleton";

function SkeletonServiceCard() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-1.5 h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

export default function ServicesTodayLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      {/* Existing services */}
      <SkeletonCard>
        <Skeleton className="mb-3 h-4 w-32" />
        <div className="flex flex-col gap-2">
          <SkeletonServiceCard />
          <SkeletonServiceCard />
        </div>
      </SkeletonCard>

      {/* Create service form */}
      <SkeletonCard>
        <Skeleton className="mb-4 h-4 w-36" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="sm:col-span-2">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </SkeletonCard>
    </div>
  );
}
