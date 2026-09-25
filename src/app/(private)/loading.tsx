import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading Spotify data">
      <div className="space-y-4 border-b-2 border-foreground pb-8">
        <Skeleton className="h-14 w-full max-w-2xl" />
        <Skeleton className="h-5 w-full max-w-xl" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid border border-foreground lg:grid-cols-2">
        <Skeleton className="min-h-80 border-b border-foreground lg:border-b-0 lg:border-r" />
        <Skeleton className="aspect-square w-full" />
      </div>
      <div className="grid grid-cols-2 gap-px bg-foreground sm:grid-cols-4 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}
