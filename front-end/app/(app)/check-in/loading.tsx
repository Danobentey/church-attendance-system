import { Skeleton, SkeletonCard } from "../_components/Skeleton";

function SkeletonPersonRow() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-100">
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-1 h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
    </div>
  );
}

export default function CheckInLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-2 h-4 w-60" />
      </div>

      <SkeletonCard>
        <Skeleton className="mb-4 h-10 w-full rounded-md" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonPersonRow key={i} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
