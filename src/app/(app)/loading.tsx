import { SkeletonKpi, SkeletonTable } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layouts";

/** Skeleton page espelhando o layout analítico (DS §4 — nunca spinner de página). */
export default function Loading() {
  return (
    <DashboardLayout spacing="md">
      <div className="skeleton h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonKpi key={i} />)}
      </div>
      <div className="rounded-md border bg-surface p-6">
        <div className="skeleton mb-4 h-4 w-40" />
        <SkeletonTable rows={6} />
      </div>
    </DashboardLayout>
  );
}
