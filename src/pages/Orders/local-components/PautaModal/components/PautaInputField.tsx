/**
 * Componente de campo de input para o formulá      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          dark:bg-dark-900 shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 transition-all duration-200
          focus:border-[#465fff] focus:ring-[3px] focus:ring-[color-mix(in_oklab,#465fff_10%,transparent)] focus:shadow-[inset_0_0_0_3px_color-mix(in_oklab,#465fff_10%,transparent)] dark:focus:border-[#465fff]
          ${error 
            ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' 
            : ''
          }
          ${disabled 
            ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60' 
            : ''
          }
        `}*/

interface PautaInputFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  required?: boolean;
  type?: 'text' | 'url';
  placeholder?: string;
  disabled?: boolean;
}

export function PautaInputField({
  label,
  description,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  type = 'text',
  placeholder,
  disabled = false
}: PautaInputFieldProps) {
  // Handle URL type with automatic https:// prefix following project standards
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    if (type === 'url' && inputValue && !inputValue.match(/^https?:\/\//)) {
      inputValue = `https://${inputValue}`;
    }
    
    onChange(inputValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {description}
      </p>
      
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          dark:bg-dark-900 shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 transition-all duration-200
          focus:border-[#465fff] focus:ring-[3px] focus:ring-[color-mix(in_oklab,#465fff_10%,transparent)] focus:shadow-[inset_0_0_0_3px_color-mix(in_oklab,#465fff_10%,transparent)] dark:focus:border-[#465fff]
          ${error 
            ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' 
            : ''
          }
          ${disabled 
            ? 'bg-gray-50 dark:bg-gray-800 cursor-not-allowed text-gray-700 dark:text-gray-300' 
            : ''
          }
        `}
      />
      
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
