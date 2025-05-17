import Select from '../Select';

interface SelectFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function SelectField({
  field,
  value,
  onChange,
  error
}: SelectFieldProps) {
  return (
    <Select
      options={field.options?.map((opt: any) => ({
        value: opt.value || opt.label,
        label: opt.label
      })) || []}
      value={value || ''}
      onChange={onChange}
      placeholder={field.placeholder || "Select an option"}
      error={!!error}
      hint={error}
    />
  );
}