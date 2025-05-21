import Input from "../input/InputField";

interface CommissionFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function CommissionField({
  value,
  onChange,
  error,
  onErrorClear
}: CommissionFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Math.min(
      1000,
      Math.max(0, parseFloat(e.target.value) || 0)
    );
    onChange(newValue.toString());

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        value={value || ""}
        onChange={handleChange}
        min="0"
        max="1000"
        step={0.01}
        placeholder="0.00"
        error={!!error}
        hint={error}
      />
      <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
    </div>
  );
}
