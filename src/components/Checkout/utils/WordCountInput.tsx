interface WordCountInputProps {
  value: number | "";
  onChange: (value: number) => void;
  disabled?: boolean;
}

const WordCountInput = ({ value, onChange, disabled }: WordCountInputProps) => {
  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => {
        const val = Math.max(0, Number(e.target.value));
        onChange(val);
      }}
      className="w-24 text-center rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 py-2.5 h-11 px-2"
      style={{ MozAppearance: "textfield", minWidth: "130px" }}
      disabled={disabled}
    />
  );
};

export default WordCountInput;
