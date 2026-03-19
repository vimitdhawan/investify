import { Skeleton } from '@/components/ui/skeleton';

/**
 * Loading state for portfolio analysis page
 */
export default function Loading() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-4 w-[500px]" />
      </div>

      {/* Summary card skeleton */}
      <Skeleton className="h-[200px] w-full" />

      {/* Top stocks and sectors skeletons */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-[450px]" />
        <Skeleton className="h-[450px]" />
      </div>

      {/* Overlap matrix skeleton */}
      <Skeleton className="h-[700px] w-full" />
    </div>
  );
}
