/**
 * Componente de campo de textarea para visualização com botão de copiar
 */

import { CopyButton } from './CopyButton';

interface ViewTextareaFieldProps {
  label: string;
  description?: string;
  value: string;
  itemId: string;
  fieldName: string;
}

export function ViewTextareaField({
  label,
  description,
  value,
  itemId,
  fieldName
}: ViewTextareaFieldProps) {
  const displayValue = value || 'Nenhum requisito especial informado';

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
      
      <div className="flex items-start space-x-2">
        <div className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 min-h-[80px]">
          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
            {displayValue}
          </p>
        </div>
        <div className="pt-1">
          <CopyButton
            text={value || ""}
            identifier={`${fieldName}-${itemId}`}
          />
        </div>
      </div>
    </div>
  );
}
