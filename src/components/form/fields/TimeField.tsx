import Input from "../input/InputField";

interface TimeFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function TimeField({
  value,
  onChange,
  error,
  onErrorClear
}: TimeFieldProps) {
  // Altere o tipo de format para string para evitar erro de comparação
  const format: string = "HH:mm";

  // Format time for display
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";

    try {
      const [hours, minutes] = timeStr.split(":");
      const hour = parseInt(hours);
      const minute = parseInt(minutes);

      if (isNaN(hour) || isNaN(minute)) return "";

      if (format === "hh:mm A") {
        const period = hour >= 12 ? "PM" : "AM";
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        return `${hour12.toString().padStart(2, "0")}:${minutes} ${period}`;
      }

      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    } catch (err) {
      return "";
    }
  };

  // Parse formatted time to 24h format
  const parseTime = (timeStr: string) => {
    if (!timeStr) return "";

    try {
      if (format === "hh:mm A") {
        const [time, period] = timeStr.split(" ");
        let [hours, minutes] = time.split(":");
        let hour = parseInt(hours);

        if (period === "PM" && hour < 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        return `${hour.toString().padStart(2, "0")}:${minutes}`;
      }

      return timeStr;
    } catch (err) {
      return "";
    }
  };

  return (
    <Input
      type="time"
      value={parseTime(value)}
      onChange={(e) => {
        const formattedTime = formatTime(e.target.value);
        onChange(formattedTime);
        if (error && onErrorClear) {
          onErrorClear();
        }
      }}
      placeholder={format}
      error={!!error}
      hint={error}
    />
  );
}
