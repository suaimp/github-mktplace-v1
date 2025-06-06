import { useState, useEffect, useRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectFieldProps {
  field: any;
  settings: any;
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function MultiSelectField({
  field,
  settings,
  value = [],
  onChange,
  error,
  onErrorClear
}: MultiSelectFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const maxSelections = settings?.max_selections;
  const maxReached = maxSelections && Array.isArray(value) && value.length >= maxSelections;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    // Ensure value is always an array
    const currentValues = Array.isArray(value) ? [...value] : [];
    
    if (currentValues.includes(optionValue)) {
      // Remove value if already selected
      onChange(currentValues.filter(v => v !== optionValue));
    } else if (!maxReached) {
      // Add value if not at max selections
      onChange([...currentValues, optionValue]);
    }
    
    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  const removeValue = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Ensure value is always an array
    const currentValues = Array.isArray(value) ? [...value] : [];
    onChange(currentValues.filter(v => v !== optionValue));
    
    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  const filteredOptions = field.options?.filter((option: Option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex flex-col items-center h-auto min-h-[2.75rem] w-full rounded-lg border ${
          error 
            ? 'border-error-500 dark:border-error-500' 
            : isOpen
              ? 'border-brand-500 ring-3 ring-brand-500/10 dark:border-brand-500'
              : 'border-gray-300 dark:border-gray-700'
        } bg-transparent`}
      >
        <div className="flex flex-wrap flex-grow w-full gap-1 p-1">
          {Array.isArray(value) && value.length > 0 ? (
            value.map((v, i) => {
              const option = field.options?.find((opt: Option) => (opt.value || opt.label) === v);
              return (
                <div
                  key={i}
                  className="flex items-center gap-1 px-2 py-1 m-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md dark:bg-gray-800 dark:text-gray-300"
                >
                  <span>{option?.label || v}</span>
                  <button
                    onClick={(e) => removeValue(v, e)}
                    className="p-0.5 hover:text-gray-900 dark:hover:text-white"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              );
            })
          ) : (
            <div className="flex-1 p-2 text-sm text-gray-400 dark:text-gray-500">
              {field.placeholder || "Select options"}
            </div>
          )}
        </div>
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
          >
            <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-2">
            <input
              type="text"
              className="w-full p-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.map((option: Option, index: number) => {
              const optionValue = option.value || option.label;
              const isSelected = Array.isArray(value) && value.includes(optionValue);
              
              return (
                <div
                  key={index}
                  onClick={() => handleSelect(optionValue)}
                  className={`flex items-center px-4 py-2 text-sm cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${maxReached && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center w-full">
                    <div className="relative flex items-center justify-center w-5 h-5 mr-3">
                      {isSelected && (
                        <svg 
                          className="w-4 h-4 text-brand-500 dark:text-brand-400" 
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path 
                            fillRule="evenodd" 
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="flex-grow">{option.label}</span>
                  </div>
                </div>
              );
            })}
            
            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {maxSelections && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {Array.isArray(value) && value.length === maxSelections ? (
            <span className="text-warning-500">Máximo de {maxSelections} seleções atingido</span>
          ) : (
            `Você pode selecionar até ${maxSelections} ${maxSelections === 1 ? 'opção' : 'opções'}`
          )}
        </p>
      )}

      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
}