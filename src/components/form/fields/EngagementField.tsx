import Input from "../input/InputField";

interface EngagementFieldProps {
  value: number | string;
  onChange: (value: number | string) => void;
  error?: string;
  onErrorClear?: () => void;
  field: any;
  settings?: any;
}

export default function EngagementField({
  value,
  onChange,
  error,
  onErrorClear,
  field,
  settings
}: EngagementFieldProps) {
  // Formata o valor para exibição (pt-BR)
  const formattedValue =
    typeof value === 'number' && !isNaN(value)
      ? value.toLocaleString('pt-BR')
      : value || "";
  return (
    <div className="relative">
      <Input
        type="text"
        value={formattedValue}
        onChange={e => {
          // Remove pontos e vírgulas para parse
          const raw = e.target.value.replace(/\./g, '').replace(/,/g, '.').replace(/%/g, '');
          const num = Number(raw);
          onChange(isNaN(num) ? '' : num);
        }}
        error={error}
        onErrorClear={onErrorClear}
        placeholder={field.placeholder || "Engajamento"}
        min={0}
        step={1}
        {...settings}
      />
      <span
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }}
      >
        %
      </span>
    </div>
  );
}
