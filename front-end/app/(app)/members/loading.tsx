import { Skeleton, SkeletonCard } from "../_components/Skeleton";

function SkeletonMemberRow() {
  return (
    <div className="grid grid-cols-12 items-center gap-2 border-t border-zinc-200 px-3 py-3">
      <div className="col-span-4">
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="col-span-3">
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="col-span-3">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="col-span-2 flex justify-end">
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  );
}

export default function MembersLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-32" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      <SkeletonCard>
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1 rounded-md" />
          <Skeleton className="h-9 w-40 rounded-md" />
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-zinc-200">
          <div className="grid grid-cols-12 bg-zinc-50 px-3 py-2">
            <Skeleton className="col-span-4 h-3 w-12" />
            <Skeleton className="col-span-3 h-3 w-12" />
            <Skeleton className="col-span-3 h-3 w-24" />
            <Skeleton className="col-span-2 h-3 w-14 justify-self-end" />
          </div>
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonMemberRow key={i} />
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
}
