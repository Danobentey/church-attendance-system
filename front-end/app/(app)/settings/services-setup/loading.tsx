import { Skeleton, SkeletonCard } from "../../_components/Skeleton";

export default function ServicesSetupLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <SkeletonCard>
        <Skeleton className="mb-3 h-4 w-36" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-7 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </SkeletonCard>

      <SkeletonCard>
        <Skeleton className="mb-3 h-4 w-44" />
        <div className="flex flex-col gap-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
        <Skeleton className="mt-3 h-10 w-28 rounded-md" />
      </SkeletonCard>
    </div>
  );
}
