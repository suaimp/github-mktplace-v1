import { ShoppingCartIcon } from "../../../icons";

interface ButtonBuyFieldProps {
  field: { label?: string };
  settings: {
    custom_button_text?: boolean;
    button_text?: string;
    button_style?: string;
  };
  error?: string;
}

export default function ButtonBuyField({
  field,
  settings,
  error,
}: ButtonBuyFieldProps) {
  // Get button text from settings or field label
  const buttonText =
    settings?.custom_button_text && settings?.button_text
      ? settings.button_text
      : field.label || "Comprar";

  // Get button style from settings
  const buttonStyle = settings?.button_style || "primary";

  // Define button classes based on style
  const buttonClasses =
    buttonStyle === "primary"
      ? "inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
      : "inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs ring-1 ring-gray-300 transition hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03]";

  return (
    <div>
      <button type="button" className={buttonClasses}>
        <ShoppingCartIcon className="w-5 h-5" />
        {buttonText}
      </button>

      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
    </div>
  );
}
