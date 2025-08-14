/**
 * Dropdown dos filtros adicionais
 * Responsabilidade: Renderizar menu dropdown com filtros que ficam ocultos em telas menores
 */

import React, { useEffect, useRef, useState } from 'react';

interface MoreFiltersDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MoreFiltersDropdown: React.FC<MoreFiltersDropdownProps> = ({
  isOpen,
  onClose,
  children
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent scroll on body when modal is open on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, isMobile]);

  if (!isOpen) return null;

  // Modal para telas pequenas
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        
        {/* Modal */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            ref={dropdownRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-auto min-w-[320px] max-w-[90vw] max-h-[80vh] overflow-y-auto"
          >
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filtros Adicionais
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Fechar"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Conteúdo do Modal */}
            <div className="p-4 space-y-4">
              {children}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Dropdown para telas maiores
  return (
    <div className="relative">
      <div
        ref={dropdownRef}
        className="absolute top-full left-0 z-50 mt-2 w-auto min-w-[320px] max-w-[90vw] max-h-[80vh] overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <h3 className="mb-3 text-sm font-medium text-gray-900 dark:text-white sticky top-0 bg-white dark:bg-gray-800 pb-2 border-b border-gray-200 dark:border-gray-700">
          Filtros Adicionais
        </h3>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    </div>
  );
};
