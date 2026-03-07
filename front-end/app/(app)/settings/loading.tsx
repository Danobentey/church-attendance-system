import { Skeleton, SkeletonCard } from "../_components/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-2 h-4 w-48" />
            <Skeleton className="mt-4 h-8 w-24 rounded-md" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
