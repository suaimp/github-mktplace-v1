/**
 * Componente de campo de input para visualização com botão de copiar
 */

import { CopyButton } from './CopyButton';

interface ViewInputFieldProps {
  label: string;
  description?: string;
  value: string;
  type?: 'text' | 'url';
  itemId: string;
  fieldName: string;
}

export function ViewInputField({
  label,
  description,
  value,
  type = 'text',
  itemId,
  fieldName
}: ViewInputFieldProps) {
  const displayValue = value || 'Não informado';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      
      <div className="flex items-center space-x-2">
        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          {type === 'url' && value ? (
            <a
              href={value.startsWith('http') ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline break-all"
            >
              {value}
            </a>
          ) : (
            <p className="text-sm text-gray-900 dark:text-gray-100 break-all">
              {displayValue}
            </p>
          )}
        </div>
        <CopyButton
          text={value || ""}
          identifier={`${fieldName}-${itemId}`}
        />
      </div>
    </div>
  );
}
