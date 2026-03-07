import { Skeleton, SkeletonCard } from "../_components/Skeleton";

function SkeletonReportPanel() {
  return (
    <SkeletonCard>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-zinc-200 px-3 py-3 first:border-t-0">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </SkeletonCard>
  );
}

export default function ReportsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>

      <SkeletonReportPanel />
      <SkeletonReportPanel />
      <SkeletonReportPanel />
    </div>
  );
}
