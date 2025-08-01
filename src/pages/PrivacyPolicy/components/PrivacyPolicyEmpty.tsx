/**
 * Componente para quando não há política de privacidade cadastrada
 * Responsabilidade única: exibir estado vazio
 */

export default function PrivacyPolicyEmpty() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Política de Privacidade
        </h1>
      </header>

      {/* Empty Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-4">
          {/* Empty Icon */}
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg 
              className="w-8 h-8 text-gray-400 dark:text-gray-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
          </div>

          {/* Empty Message */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Política de privacidade não disponível
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              A política de privacidade ainda não foi configurada para esta plataforma.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
