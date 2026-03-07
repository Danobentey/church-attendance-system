import { Skeleton, SkeletonCard } from "../_components/Skeleton";

function SkeletonFollowUpRow() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
          <Skeleton className="h-4 w-4 rounded-full" />
        </div>
        <div className="flex-1 min-w-0">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-1 h-3 w-24" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-md" />
      </div>
    </div>
  );
}

export default function FollowUpsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <SkeletonCard>
        <div className="flex flex-wrap gap-2 mb-4">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 flex-1 min-w-40 rounded-md" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonFollowUpRow key={i} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
