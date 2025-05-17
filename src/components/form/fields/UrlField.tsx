import Input from '../input/InputField';

interface UrlFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function UrlField({
  field,
  value,
  onChange,
  error,
  onErrorClear
}: UrlFieldProps) {
  // Validate URL format
  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty is valid unless field is required
    
    // Add https:// if no protocol is specified
    const urlWithProtocol = url.match(/^https?:\/\//) ? url : `https://${url}`;
    
    try {
      new URL(urlWithProtocol);
      return true;
    } catch {
      return false;
    }
  };

  // Add https:// if missing when field loses focus
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && !value.match(/^https?:\/\//)) {
      onChange(`https://${value}`);
    }
  };

  return (
    <Input
      type="url"
      value={value || ''}
      onChange={(e) => {
        const newValue = e.target.value;
        onChange(newValue);
        
        // Clear error if value becomes valid
        if (error && onErrorClear && validateUrl(newValue)) {
          onErrorClear();
        }
      }}
      onBlur={handleBlur}
      placeholder={field.placeholder || "https://example.com"}
      required={field.is_required}
      error={!!error}
      hint={error || (field.description ? field.description : '')}
    />
  );
}