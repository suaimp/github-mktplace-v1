export default function MarketplaceTableSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Table controls skeleton */}
      <div className="flex justify-between p-4 mb-4 rounded-lg dark:bg-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-16 h-8 bg-gray-200 rounded dark:bg-gray-800"></div>
          <div className="w-16 h-8 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
        <div className="w-48 h-8 bg-gray-200 rounded dark:bg-gray-800"></div>
      </div>

      {/* Table header skeleton */}
      <div className="h-12 bg-gray-200 rounded-t-lg w-full dark:bg-gray-800"></div>

      {/* Table rows skeleton */}
      <div className="space-y-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800"></div>
        ))}
      </div>

      {/* Pagination skeleton */}
      <div className="flex justify-between p-4 mt-4 rounded-lg dark:bg-gray-800">
        <div className="w-48 h-6 bg-gray-200 rounded dark:bg-gray-800"></div>
        <div className="flex gap-2">
          <div className="w-24 h-10 bg-gray-200 rounded dark:bg-gray-800"></div>
          <div className="w-32 h-10 bg-gray-200 rounded dark:bg-gray-800"></div>
          <div className="w-24 h-10 bg-gray-200 rounded dark:bg-gray-800"></div>
        </div>
      </div>
    </div>
  );
}
