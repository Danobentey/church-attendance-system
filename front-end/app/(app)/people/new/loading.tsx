import { Skeleton, SkeletonCard } from "../../_components/Skeleton";

export default function AddPersonLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Skeleton className="h-7 w-44" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      <SkeletonCard>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <div className="sm:col-span-2">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </SkeletonCard>
    </div>
  );
}
