import { Skeleton, SkeletonStatCard, SkeletonCard } from "../_components/Skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Skeleton className="h-7 w-28" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-20 rounded-md" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Chart placeholders */}
      <SkeletonCard className="h-64">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </SkeletonCard>

      <SkeletonCard className="h-64">
        <Skeleton className="mb-3 h-4 w-48" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </SkeletonCard>

      <SkeletonCard>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-1.5 h-3 w-52" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </SkeletonCard>
    </div>
  );
}
