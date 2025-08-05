import React from 'react';
import { useBestSellingSites } from '../../../hooks/sites/useBestSellingSites';
import { BestSellingSiteCard } from './BestSellingSiteCard';
import LoadingState from '../../ecommerce/chart-TopSites/components/LoadingState';
import ErrorState from '../../ecommerce/chart-TopSites/components/ErrorState';

interface BestSellingSitesListProps {
  className?: string;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

/**
 * Componente para listar sites mais vendidos
 */
export const BestSellingSitesList: React.FC<BestSellingSitesListProps> = ({
  className = '',
  showCreateButton = false,
  onCreateClick
}) => {
  const { sites, loading, error, loadSites } = useBestSellingSites();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        message={error} 
        onRetry={loadSites}
      />
    );
  }

  return (
    <div className={`best-selling-sites-list ${className}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sites Mais Vendidos
        </h2>
        {showCreateButton && onCreateClick && (
          <button
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Adicionar Site
          </button>
        )}
      </div>

      {sites.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhum site encontrado
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Ainda não há sites mais vendidos cadastrados no sistema.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site) => (
            <BestSellingSiteCard
              key={site.id}
              site={site}
            />
          ))}
        </div>
      )}
    </div>
  );
};
