import { useState, useEffect } from 'react';
import Label from '../../../components/form/Label';

interface MarketplaceModeMessageFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (message: string) => void;
  onSave: (message: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * Componente para campo de mensagem dos modos do marketplace
 */
export default function MarketplaceModeMessageField({
  label,
  placeholder,
  value,
  onChange,
  onSave,
  disabled = false
}: MarketplaceModeMessageFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalValue(value);
    setIsDirty(false);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsDirty(newValue !== value);
    onChange(newValue);
  };

  const handleSave = async () => {
    if (isDirty && localValue.trim()) {
      await onSave(localValue.trim());
      setIsDirty(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-3">
      <Label htmlFor={`message-${label.toLowerCase().replace(/\s+/g, '-')}`}>
        {label}
      </Label>
      
      <div className="space-y-2">
        <textarea
          id={`message-${label.toLowerCase().replace(/\s+/g, '-')}`}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={3}
          className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:focus:border-brand-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
        
        {isDirty && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Ctrl+Enter para salvar rapidamente
            </span>
            <button
              onClick={handleSave}
              disabled={disabled || !localValue.trim()}
              className="px-3 py-1 text-xs font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Salvar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
