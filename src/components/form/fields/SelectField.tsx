import Select from "../Select";

interface SelectFieldProps {
  field: any;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export default function SelectField({
  field,
  value,
  onChange
}: SelectFieldProps) {
  const options =
    field.options?.map((opt: any) => ({
      value: opt.value || opt.label,
      label: opt.label
    })) || [];

  const handleChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const placeholder = field.placeholder || "Select an option";

  return (
    <Select
      options={options}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
