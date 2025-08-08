/**
 * Componente principal do modal de detalhes do artigo
 */

import { ArticleDetailsModalProps } from '../types';
import { ViewInputField } from './ViewInputField';
import { ViewTextareaField } from './ViewTextareaField';

export function ArticleDetailsModal({
  isOpen,
  onClose,
  itemId,
  pautaData,
  loading
}: ArticleDetailsModalProps) {
  const hasPauta = pautaData !== null && pautaData !== undefined;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black z-[999999] transition-all duration-300 ${
          isOpen ? "bg-opacity-50 visible" : "bg-opacity-0 invisible"
        }`}
        onClick={onClose}
      />
      
      {/* Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full max-w-lg min-w-[320px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[999999] transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              Detalhes do Artigo
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  Carregando...
                </span>
              </div>
            ) : hasPauta ? (
              <div className="space-y-6">
                {/* Palavra-chave */}
                <ViewInputField
                  label="Palavra-chave alvo para criar o artigo"
                  value={pautaData.palavra_chave || ''}
                  itemId={itemId}
                  fieldName="palavra-chave"
                />

                {/* URL do Site */}
                <ViewInputField
                  label="URL do Site"
                  value={pautaData.url_site || ''}
                  type="url"
                  itemId={itemId}
                  fieldName="url-site"
                />

                {/* Texto Âncora */}
                <ViewInputField
                  label="Texto âncora"
                  value={pautaData.texto_ancora || ''}
                  itemId={itemId}
                  fieldName="texto-ancora"
                />

                {/* Requisitos Especiais */}
                <ViewTextareaField
                  label="Requisitos especiais"
                  value={pautaData.requisitos_especiais || ''}
                  itemId={itemId}
                  fieldName="requisitos"
                />

                {/* Data de Envio */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Pauta enviada em: {new Date(pautaData.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  A pauta para este artigo ainda não foi enviada.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-500 border border-transparent rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
