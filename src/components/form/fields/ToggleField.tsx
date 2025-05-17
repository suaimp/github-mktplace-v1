import Switch from '../switch/Switch';

interface ToggleFieldProps {
  field: any;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export default function ToggleField({
  field,
  value,
  onChange,
  error
}: ToggleFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <Switch
          label={field.label}
          checked={value || false}
          onChange={onChange}
        />
      </div>
      
      {field.description && (
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {field.description}
        </p>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-error-500">{error}</p>
      )}
    </div>
  );
}