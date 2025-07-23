export default function LoadingState() {
  return (
    <div className="my-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <span className="text-gray-400 text-theme-xs">Site</span>
        <span className="text-right text-gray-400 text-theme-xs">Desconto</span>
      </div>
      {[...Array(5)].map((_, index) => (
        <div 
          key={index}
          className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800"
        >
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded"></div>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-12 rounded"></div>
        </div>
      ))}
    </div>
  );
}
