import Input from "../input/InputField";
import type { FormField, FormFieldSettings } from "./types";

interface ChannelNameFieldProps {
  field: FormField;
  settings: FormFieldSettings;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function ChannelNameField({
  field,
  settings,
  value,
  onChange,
  error,
  onErrorClear
}: ChannelNameFieldProps) {
  return (
    <Input
      type="text"
      value={value || ""}
      onChange={e => {
        onChange(e.target.value);
        if (error && onErrorClear) onErrorClear();
      }}
  placeholder={settings?.placeholder_text || field.placeholder}
  required={settings?.is_required ?? field.is_required}
      error={!!error}
      hint={error}
    />
  );
}
