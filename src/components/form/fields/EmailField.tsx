import Input from '../input/InputField';

interface EmailFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function EmailField({
  field,
  value,
  onChange,
  error,
  onErrorClear
}: EmailFieldProps) {
  // Validate email format
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Empty is valid unless field is required
    return email.includes('@'); // Basic @ check
  };

  return (
    <Input
      type="email"
      value={value || ''}
      onChange={(e) => {
        const newValue = e.target.value;
        onChange(newValue);
        
        // Clear error if value becomes valid
        if (error && onErrorClear && validateEmail(newValue)) {
          onErrorClear();
        }
      }}
      onBlur={(e) => {
        // Validate on blur
        const isValid = validateEmail(e.target.value);
        if (!isValid && !error) {
          onChange(e.target.value); // Trigger validation
        }
      }}
      placeholder={field.placeholder}
      required={field.is_required}
      error={!!error}
      hint={error || (field.description ? field.description : '')}
    />
  );
}