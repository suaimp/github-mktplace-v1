import Radio from '../input/Radio';

interface RadioFieldProps {
  field: any;
  settings?: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function RadioField({
  field,
  settings,
  value,
  onChange,
  error
}: RadioFieldProps) {
  const isInline = settings?.inline_layout || field.validation_rules?.inline_layout;

  return (
    <div className={`${isInline ? 'flex flex-wrap gap-4' : 'space-y-2'}`}>
      {field.options?.map((option: any, index: number) => (
        <Radio
          key={index}
          id={`${field.id}_${index}`}
          name={field.id}
          value={option.value || option.label}
          checked={value === (option.value || option.label)}
          onChange={onChange}
          label={option.label}
        />
      ))}
      {error && (
        <p className="text-sm text-error-500 w-full">{error}</p>
      )}
    </div>
  );
}