import Input from "../input/InputField";
import type { FormField, FormFieldSettings } from "./types";
import { useState } from "react";

interface ChannelLogoFieldProps {
  field: FormField;
  settings: FormFieldSettings;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function ChannelLogoField({
  field,
  settings,
  value,
  onChange,
  error,
  onErrorClear
}: ChannelLogoFieldProps) {
  const [imgError, setImgError] = useState(false);
  return (
    <div className="flex items-center gap-4">
      <Input
        type="text"
        value={value || ""}
        onChange={e => {
          onChange(e.target.value);
          setImgError(false);
          console.log('ChannelLogoField input value:', e.target.value);
          if (error && onErrorClear) onErrorClear();
        }}
  placeholder={settings?.placeholder_text || field.placeholder || "Cole o link da logo do canal"}
  required={settings?.is_required ?? field.is_required}
        error={!!error}
        hint={error}
        className="flex-1"
      />
      {value && !imgError && (
        <img
          src={value}
          alt="Logo do canal"
          className="h-12 w-12 rounded-full border object-cover"
          onError={() => setImgError(true)}
        />
      )}

      {/* Fallback quando a imagem não carregar */}
      {value && imgError && (
        <div className="h-12 w-12 rounded-full border bg-gray-50 dark:bg-gray-800 flex items-center justify-center px-2 text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Imagem indisponível</span>
        </div>
      )}
    </div>
  );
}
