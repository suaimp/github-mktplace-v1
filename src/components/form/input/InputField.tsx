import type React from "react";
import type { FC } from "react";

interface InputProps {
  type?:
    | "text"
    | "number"
    | "email"
    | "password"
    | "date"
    | "time"
    | "url"
    | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
  pattern?: string;
  title?: string;
  required?: boolean;
  maxLength?: number;
  autoComplete?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  className = "",
  min,
  max,
  step,
  disabled = false,
  success = false,
  error = false,
  hint,
  pattern,
  title,
  required = false,
  maxLength,
  autoComplete
}) => {
  let inputClasses = `dark:bg-dark-900 shadow-theme-xs h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 transition-all duration-200 focus:border-[#465fff] focus:ring-[3px] focus:ring-[color-mix(in_oklab,#465fff_10%,transparent)] focus:shadow-[inset_0_0_0_3px_color-mix(in_oklab,#465fff_10%,transparent)] dark:focus:border-[#465fff] ${className}`;

  if (disabled) {
    inputClasses += ` text-gray-500 border-gray-300 opacity-40 bg-gray-100 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 opacity-40`;
  } else if (error) {
    inputClasses += ` border-error-500 focus:border-error-300 focus:ring-error-500/10 dark:text-error-400 dark:border-error-500 dark:focus:border-error-800`;
  } else if (success) {
    inputClasses += ` border-success-500 focus:border-success-300 focus:ring-success-500/10 dark:text-success-400 dark:border-success-500 dark:focus:border-success-800`;
  }

  // Add URL input mask
  const handleUrlInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === "url") {
      let value = e.target.value;

      // If value is empty or already has protocol, don't modify
      if (!value || /^https?:\/\//.test(value)) {
        onChange?.(e);
        return;
      }

      // Add https:// if not present
      if (!/^https?:\/\//.test(value)) {
        e.target.value = `https://${value}`;
      }
    }

    onChange?.(e);
  };

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={type === "url" ? "https://example.com" : placeholder}
        value={value}
        onChange={type === "url" ? handleUrlInput : onChange}
        onBlur={onBlur}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={inputClasses}
        pattern={pattern || (type === "url" ? "^https?://.+" : undefined)}
        title={
          title ||
          (type === "url"
            ? "URL must start with http:// or https://"
            : undefined)
        }
        required={required}
        maxLength={maxLength}
        autoComplete={autoComplete}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
              ? "text-success-500"
              : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
