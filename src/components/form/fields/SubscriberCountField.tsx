import Input from "../input/InputField";

interface SubscriberCountFieldProps {
  value: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  onErrorClear?: () => void;
  field: any;
  settings?: any;
}

export default function SubscriberCountField({
  value,
  onChange,
  error,
  onErrorClear,
  field,
  settings
}: SubscriberCountFieldProps) {
  // Formata o valor para exibição (pt-BR)
  const formattedValue =
    typeof value === 'number' && !isNaN(value)
      ? value.toLocaleString('pt-BR')
      : value || "";
  return (
    <Input
      type="text"
      value={formattedValue}
      onChange={e => {
        // Remove pontos e vírgulas para parse
        const raw = e.target.value.replace(/\./g, '').replace(/,/g, '.');
        const num = Number(raw);
        onChange(isNaN(num) ? '' : num);
      }}
      error={error}
      onErrorClear={onErrorClear}
      placeholder={field.placeholder || "Inscritos"}
      min={0}
      step={1}
      {...settings}
    />
  );
}
