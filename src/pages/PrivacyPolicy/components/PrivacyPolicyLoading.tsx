/**
 * Componente de loading para política de privacidade
 * Responsabilidade única: exibir estado de carregamento
 */

export default function PrivacyPolicyLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Skeleton */}
      <header className="mb-8 text-center">
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg w-80 mx-auto mb-4 animate-pulse"></div>
      </header>

      {/* Content Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="space-y-4">
          {/* Primeiro parágrafo */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
          </div>

          {/* Título de seção */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mt-6"></div>

          {/* Segundo parágrafo */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/5"></div>
          </div>

          {/* Lista */}
          <div className="space-y-2 ml-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/6"></div>
          </div>

          {/* Outro título */}
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2 mt-6"></div>

          {/* Terceiro parágrafo */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
