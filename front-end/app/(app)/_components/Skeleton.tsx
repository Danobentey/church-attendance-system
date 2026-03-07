type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-md bg-zinc-200 ${className}`} />
  );
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-2 h-7 w-16" />
      <Skeleton className="mt-1.5 h-3 w-20" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  const widths = ["w-2/5", "w-1/5", "w-1/5", "w-16"];
  return (
    <div className="flex items-center gap-4 border-t border-zinc-200 px-3 py-3">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-4 flex-1 ${widths[i % widths.length]}`} />
      ))}
    </div>
  );
}

export function SkeletonCard({
  className = "",
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-zinc-200 bg-white p-4 ${className}`}>
      {children}
    </div>
  );
}
