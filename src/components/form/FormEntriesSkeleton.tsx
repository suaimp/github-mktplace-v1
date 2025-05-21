export default function FormEntriesSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="animate-pulse">
        {/* Header */}
        <div className="border-b border-gray-100 dark:border-white/[0.05] p-4">
          <div className="h-6 bg-gray-200 rounded w-1/4 dark:bg-gray-800"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/3 dark:bg-gray-800"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 dark:bg-gray-800"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-20 dark:bg-gray-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
