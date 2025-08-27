import React, { useState, useRef, useEffect } from 'react';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';

interface AdminDropdownMenuProps {
  url: string;
  onEdit: () => void;
  iconSize?: 'small' | 'medium' | 'large';
}

export const AdminDropdownMenu: React.FC<AdminDropdownMenuProps> = ({
  url,
  onEdit,
  iconSize = 'medium'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { copied, copyToClipboard } = useCopyToClipboard();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const iconSizeClass = iconSize === 'small' ? 'w-3 h-3' : iconSize === 'large' ? 'w-5 h-5' : 'w-4 h-4';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCopy = () => {
    copyToClipboard(url);
    setIsOpen(false);
  };

  const handleEdit = () => {
    onEdit();
    setIsOpen(false);
  };

  const handleDropdownToggle = () => {
    console.log('Mobile dropdown clicked, current state:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleDropdownToggle}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors touch-manipulation"
        title="Mais opções"
        style={{ minHeight: '23px', minWidth: '23px' }}
      >
        <svg 
          className={`${iconSizeClass} text-gray-500 hover:text-brand-500`} 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>

      {isOpen && (
        <>
          {console.log('Dropdown menu is open, rendering...')}
          <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-[9999] 
                          max-[640px]:right-0 max-[640px]:w-28 max-[640px]:shadow-xl max-[640px]:border-2">
            <div className="py-1">
              <button
                onClick={handleCopy}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2
                           max-[640px]:px-2 max-[640px]:py-1.5 max-[640px]:text-xs max-[640px]:min-h-[36px]"
              >
                <svg className="w-4 h-4 max-[640px]:w-[15px] max-[640px]:h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2
                           max-[640px]:px-2 max-[640px]:py-1.5 max-[640px]:text-xs max-[640px]:min-h-[36px]"
              >
                <svg className="w-4 h-4 max-[640px]:w-[15px] max-[640px]:h-[15px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
