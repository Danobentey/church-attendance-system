import { Skeleton, SkeletonCard } from "../../_components/Skeleton";

function SkeletonAuditRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-2 border-t border-zinc-200 px-3 py-3">
      <div className="col-span-3"><Skeleton className="h-4 w-28" /></div>
      <div className="col-span-3"><Skeleton className="h-5 w-24 rounded-full" /></div>
      <div className="col-span-3"><Skeleton className="h-4 w-32" /></div>
      <div className="col-span-3"><Skeleton className="h-4 w-24" /></div>
    </div>
  );
}

export default function AuditLogLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <SkeletonCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>

        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2">
            <Skeleton className="col-span-3 h-3 w-12" />
            <Skeleton className="col-span-3 h-3 w-12" />
            <Skeleton className="col-span-3 h-3 w-16" />
            <Skeleton className="col-span-3 h-3 w-16" />
          </div>
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonAuditRow key={i} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
