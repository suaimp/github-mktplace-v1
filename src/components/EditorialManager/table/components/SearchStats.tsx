interface SearchStatsProps {
  total: number;
  filtered: number;
  hasFilter: boolean;
  searchTerm: string;
}

export default function SearchStats({ 
  total, 
  filtered, 
  hasFilter, 
  searchTerm 
}: SearchStatsProps) {
  if (!hasFilter) return null;

  return (
    <div className="px-4 py-2 border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {filtered === 0 ? (
            <>Nenhum resultado encontrado para "<strong>{searchTerm}</strong>"</>
          ) : (
            <>
              Mostrando <strong>{filtered}</strong> de <strong>{total}</strong> resultados para "<strong>{searchTerm}</strong>"
            </>
          )}
        </span>
        
        {filtered > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {total - filtered} {total - filtered === 1 ? 'item oculto' : 'itens ocultos'}
          </span>
        )}
      </div>
    </div>
  );
}
