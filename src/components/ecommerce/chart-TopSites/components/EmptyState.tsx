export default function EmptyState() {
  return (
    <div className="my-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
        <span className="text-gray-400 text-theme-xs">Site</span>
        <span className="text-right text-gray-400 text-theme-xs">Desconto</span>
      </div>
      <div className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Nenhum site em promoção encontrado
        </p>
      </div>
    </div>
  );
}
