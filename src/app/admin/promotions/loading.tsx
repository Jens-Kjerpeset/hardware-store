import { TableSkeleton, PageHeaderSkeleton } from "../Skeletons";

export default function PromotionsLoading() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <div className="w-full">
        <TableSkeleton />
      </div>
    </div>
  );
}
