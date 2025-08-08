/**
 * Modal para envio de pauta
 */

import { PautaModalProps } from '../types';
import { PautaForm } from './PautaForm';

export function PautaModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading = false, 
  submitError,
  mode = 'create',
  initialData
}: PautaModalProps) {
  if (!isOpen) return null;

  const isViewMode = mode === 'view';
  const modalTitle = isViewMode ? 'Visualizar Pauta' : 'Enviar Pauta';

  const handleFormSubmit = async (data: any) => {
    if (!isViewMode) {
      await onSubmit(data);
      // Não fechar automaticamente, deixar o hook controlar isso
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-99999">
      {/* Overlay com o mesmo estilo do modal de Enviar Artigo */}
      <div 
        className="fixed inset-0 h-full w-full bg-gray-400/50 backdrop-blur-[--background-blur]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full rounded-3xl bg-white dark:bg-gray-900 max-w-2xl mx-4 max-h-[calc(100vh-2rem)] overflow-hidden flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-999 flex h-9.5 w-9.5 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white sm:right-6 sm:top-6 sm:h-11 sm:w-11"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
              fill="currentColor"
            />
          </svg>
        </button>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-6">
            {modalTitle}
          </h3>

          {/* Exibir erro se houver */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
              <p className="text-sm">{submitError}</p>
            </div>
          )}

          <PautaForm
            onSubmit={handleFormSubmit}
            onCancel={onClose}
            loading={loading}
            mode={mode}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
}
