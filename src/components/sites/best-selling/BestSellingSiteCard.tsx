interface BestSellingSiteFromTable {
  id: string;
  entry_id: string;
  product_name: string;
  product_url: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

interface BestSellingSiteCardProps {
  site: BestSellingSiteFromTable;
  onUpdate?: () => Promise<void>; // Tornando opcional já que não está sendo usado
}

export function BestSellingSiteCard({ site }: BestSellingSiteCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {site.product_name}
          </h3>
          <a 
            href={site.product_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            Ver produto
          </a>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {site.quantity}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            vendidos
          </div>
        </div>
      </div>
    </div>
  );
}
