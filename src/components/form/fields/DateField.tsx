import Input from "../input/InputField";

interface DateFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function DateField({
  value,
  onChange,
  error,
  onErrorClear
}: DateFieldProps) {
  const format = "dd/mm/yyyy";

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "";
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      switch (format) {
        case "dd/mm/yyyy":
          return `${day}/${month}/${year}`;
        default:
          return dateStr;
      }
    } catch (err) {
      return "";
    }
  };

  // Parse formatted date to ISO string
  const parseDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      let day, month, year;
      switch (format) {
        case "dd/mm/yyyy":
          [day, month, year] = dateStr.split("/");
          break;
        default:
          return dateStr;
      }
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toISOString().split("T")[0];
    } catch (err) {
      return "";
    }
  };

  return (
    <Input
      type="date"
      value={parseDate(value)}
      onChange={(e) => {
        const formattedDate = formatDate(e.target.value);
        onChange(formattedDate);
        if (error && onErrorClear) {
          onErrorClear();
        }
      }}
      placeholder={format.toUpperCase()}
      error={!!error}
      hint={error}
    />
  );
}
