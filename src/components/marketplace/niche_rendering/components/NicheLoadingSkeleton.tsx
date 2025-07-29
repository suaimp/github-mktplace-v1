export function NicheLoadingSkeleton() {
  return (
    <div className="flex gap-1">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-[19px] h-[19px] bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"
        />
      ))}
    </div>
  );
}
