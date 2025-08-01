/**
 * Componente para estado vazio (quando não há termos cadastrados)
 * Responsabilidade única: exibir estado quando não há conteúdo
 */

import type { TermsEmptyProps } from '../types';

export default function TermsEmpty({ className = '' }: TermsEmptyProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="max-w-md mx-auto">
        {/* Empty state icon */}
        <div className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500">
          <svg 
            className="w-full h-full" 
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

        {/* Empty state title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Termos e Condições não disponíveis
        </h3>

        {/* Empty state message */}
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Os termos e condições ainda não foram configurados por um administrador. 
          Entre em contato conosco para mais informações.
        </p>

        {/* Contact info or alternative action */}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <p>Em caso de dúvidas, entre em contato através do suporte.</p>
        </div>
      </div>
    </div>
  );
}
