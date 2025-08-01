/**
 * Botão de Preview para a toolbar do TiptapEditor
 * Responsabilidade: apenas renderizar o botão e chamar função de abertura do preview
 */

import { PreviewButtonProps } from '../types/preview.types';

export default function PreviewButton({
  content,
  contractType,
  title,
  disabled = false
}: PreviewButtonProps) {
  const handlePreviewClick = () => {
    console.log('👁️ [PreviewButton] Botão preview clicado', {
      contractType,
      contentLength: content?.length || 0
    });
    
    if (!content || content.trim() === '' || content === '<p></p>') {
      alert('Adicione algum conteúdo antes de visualizar o preview.');
      return;
    }

    // Emit event for parent component to handle
    const event = new CustomEvent('contractPreview', {
      detail: { content, contractType, title }
    });
    window.dispatchEvent(event);
  };

  return (
    <button
      type="button"
      onClick={handlePreviewClick}
      className="px-3 py-1 text-sm font-medium rounded bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
      disabled={disabled}
      title="Visualizar preview"
    >
      <svg 
        className="w-4 h-4" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
        />
      </svg>
      Visualizar
    </button>
  );
}
