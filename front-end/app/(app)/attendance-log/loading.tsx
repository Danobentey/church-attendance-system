import { Skeleton, SkeletonCard } from "../_components/Skeleton";

function SkeletonLogRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-2 border-t border-zinc-200 px-3 py-3">
      <div className="col-span-3"><Skeleton className="h-4 w-28" /></div>
      <div className="col-span-2"><Skeleton className="h-5 w-16 rounded-full" /></div>
      <div className="col-span-3"><Skeleton className="h-4 w-32" /></div>
      <div className="col-span-2"><Skeleton className="h-4 w-20" /></div>
      <div className="col-span-2 flex justify-end"><Skeleton className="h-7 w-20 rounded-md" /></div>
    </div>
  );
}

export default function AttendanceLogLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-36" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>

      <SkeletonCard>
        {/* Filters row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
          <Skeleton className="h-9 flex-1 min-w-40 rounded-md" />
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2">
            <Skeleton className="col-span-3 h-3 w-10" />
            <Skeleton className="col-span-2 h-3 w-8" />
            <Skeleton className="col-span-3 h-3 w-16" />
            <Skeleton className="col-span-2 h-3 w-20" />
            <Skeleton className="col-span-2 h-3 w-14 justify-self-end" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonLogRow key={i} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
