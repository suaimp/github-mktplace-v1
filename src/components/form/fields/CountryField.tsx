import Input from "../input/InputField";
import { getFlagUrl } from "../utils/formatters";

interface CountryFieldProps {
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onErrorClear?: () => void;
  settings: any;
}

export default function CountryField({
  value = {},
  onChange,
  error,
  onErrorClear,
  settings
}: CountryFieldProps) {
  // Parse value from string if needed
  const parsedValue = typeof value === "string" ? JSON.parse(value) : value;
  const selectedCount = Object.keys(parsedValue).length;
  const maxSelections = settings?.max_selections;
  const isMaxReached = maxSelections && selectedCount >= maxSelections;

  const handleChange = (country: string, percentage?: number | null) => {
    const newValue = { ...parsedValue };

    if (percentage === null) {
      // Remove country when unchecked
      delete newValue[country];
    } else if (percentage !== undefined) {
      // Add or update country with percentage
      newValue[country] = percentage;
    }

    onChange(newValue);

    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settings?.countries?.map((country: string) => {
          const optionValue = country;
          const isChecked = optionValue in parsedValue;

          return (
            <div key={country} className="flex items-center gap-2">
              <div className="flex items-center gap-2 min-w-[140px]">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      if (!isMaxReached) {
                        handleChange(optionValue, 0); // Add with 0%
                      }
                    } else {
                      handleChange(optionValue, null); // Remove country
                    }
                  }}
                  disabled={isMaxReached && !isChecked}
                  className={`w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 ${
                    isMaxReached && !isChecked
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                />
                <div className="flex items-center gap-2">
                  <img
                    src={getFlagUrl(country)}
                    width="20"
                    height="20"
                    alt={getCountryName(country)}
                    className={`rounded-full ${
                      country === "ROW" ? "dark:invert" : ""
                    }`}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {getCountryName(country)}
                  </span>
                </div>
              </div>

              {settings?.show_percentage && isChecked && (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={parsedValue[optionValue]}
                    onChange={(e) => {
                      const value = Math.min(
                        100,
                        Math.max(0, parseInt(e.target.value) || 0)
                      );
                      handleChange(optionValue, value);
                    }}
                    min="0"
                    max="100"
                    className="w-16 px-2 text-center"
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    %
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {maxSelections && (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {selectedCount === maxSelections ? (
            <span className="text-warning-500">
              Máximo de {maxSelections} países selecionados
            </span>
          ) : (
            `Você pode selecionar até ${maxSelections} ${
              maxSelections === 1 ? "país" : "países"
            }`
          )}
        </p>
      )}

      {error && <p className="text-sm text-error-500">{error}</p>}
    </div>
  );
}

function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    BR: "Brasil",
    US: "Estados Unidos",
    GB: "Reino Unido",
    PT: "Portugal",
    ES: "Espanha",
    FR: "França",
    DE: "Alemanha",
    IT: "Itália",
    CA: "Canadá",
    AU: "Austrália",
    JP: "Japão",
    CN: "China",
    IN: "Índia",
    RU: "Rússia",
    MX: "México",
    AR: "Argentina",
    CL: "Chile",
    CO: "Colômbia",
    PE: "Peru",
    VE: "Venezuela",
    ROW: "Rest of World"
  };

  return countries[code] || code;
}
