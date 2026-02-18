import { Skeleton } from "@/components/ui/skeleton";

const BulletinSkeleton = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <Skeleton className="h-[120px] w-full rounded-none" />
    <div className="p-3 space-y-2">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  </div>
);

export const BulletinSkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <BulletinSkeleton key={i} />
    ))}
  </div>
);

export default BulletinSkeleton;
