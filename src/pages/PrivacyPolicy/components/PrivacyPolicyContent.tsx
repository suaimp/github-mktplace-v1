/**
 * Componente para exibir o conteúdo da política de privacidade
 * Responsabilidade única: renderizar o conteúdo HTML da política de privacidade
 */

import './PrivacyPolicyContent.css';

interface PrivacyPolicyContentProps {
  content: string;
  className?: string;
}

export default function PrivacyPolicyContent({ 
  content, 
  className = '' 
}: PrivacyPolicyContentProps) {
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Política de Privacidade
        </h1>
      </header>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
        <div 
          className="privacy-policy-content prose prose-lg max-w-none dark:prose-invert 
            prose-headings:text-gray-900 dark:prose-headings:text-white 
            prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8 first:prose-h1:mt-0
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-6
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-5
            prose-h4:text-lg prose-h4:font-medium prose-h4:mb-2 prose-h4:mt-4
            prose-h5:text-base prose-h5:font-medium prose-h5:mb-2 prose-h5:mt-3
            prose-h6:text-sm prose-h6:font-medium prose-h6:mb-1 prose-h6:mt-2
            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-800 dark:hover:prose-a:text-blue-300
            prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
            prose-em:text-gray-800 dark:prose-em:text-gray-200 prose-em:italic
            prose-ul:list-disc prose-ul:list-inside prose-ul:space-y-2 prose-ul:mb-4
            prose-ol:list-decimal prose-ol:list-inside prose-ol:space-y-2 prose-ol:mb-4
            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed
            prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 
            prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
            prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
            prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-gray-300 dark:prose-table:border-gray-600
            prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-600 prose-th:bg-gray-50 dark:prose-th:bg-gray-700 prose-th:p-2 prose-th:text-left
            prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:p-2
            prose-hr:border-gray-300 dark:prose-hr:border-gray-600 prose-hr:my-8"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </div>
  );
}
