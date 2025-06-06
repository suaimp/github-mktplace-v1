import Input from '../input/InputField';
import InputMask from 'react-input-mask';

interface TextFieldProps {
  field: any;
  settings: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function TextField({ 
  field, 
  settings, 
  value, 
  onChange, 
  error,
  onErrorClear 
}: TextFieldProps) {
  if (settings?.input_mask_enabled && settings.input_mask_pattern) {
    return (
      <InputMask
        mask={settings.input_mask_pattern}
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          if (error && onErrorClear) {
            onErrorClear();
          }
        }}
        placeholder={field.placeholder}
        className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
      />
    );
  }

  return (
    <Input
      type="text"
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value);
        if (error && onErrorClear) {
          onErrorClear();
        }
      }}
      placeholder={field.placeholder}
      required={field.is_required}
      error={!!error}
      hint={error}
    />
  );
}