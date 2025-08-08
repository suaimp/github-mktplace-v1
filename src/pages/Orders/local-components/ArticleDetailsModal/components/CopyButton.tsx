/**
 * Componente de botão para copiar texto com tooltip
 */

import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface CopyButtonProps {
  text: string;
  identifier: string;
  className?: string;
}

export function CopyButton({ text, identifier, className = "" }: CopyButtonProps) {
  const { copiedItem, copyToClipboard } = useCopyToClipboard();
  
  const isCopied = copiedItem === identifier;

  const handleCopy = async () => {
    if (text.trim()) {
      await copyToClipboard(text, identifier);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        disabled={!text.trim()}
        className={`
          p-1.5 rounded-md transition-colors duration-200
          ${!text.trim() 
            ? 'text-gray-300 cursor-not-allowed' 
            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
          }
          ${className}
        `}
        title={!text.trim() ? "Nenhum texto para copiar" : "Copiar"}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>
      
      {/* Tooltip */}
      {isCopied && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-50">
          Copiado!
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800" />
        </div>
      )}
    </div>
  );
}
