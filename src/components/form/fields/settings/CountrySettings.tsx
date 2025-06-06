import { useState } from "react";
import Label from "../../Label";
import Switch from "../../switch/Switch";
import Input from "../../input/InputField";
import Button from "../../../ui/button/Button";
import { getFlagUrl } from "../../utils/formatters";

interface CountrySettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

const countries = [
  { code: "BR", name: "Brasil" },
  { code: "US", name: "Estados Unidos" },
  { code: "GB", name: "Reino Unido" },
  { code: "PT", name: "Portugal" },
  { code: "ES", name: "Espanha" },
  { code: "FR", name: "França" },
  { code: "DE", name: "Alemanha" },
  { code: "IT", name: "Itália" },
  { code: "JP", name: "Japão" },
  { code: "CN", name: "China" },
  { code: "AU", name: "Austrália" },
  { code: "CA", name: "Canadá" },
  { code: "MX", name: "México" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colômbia" },
  { code: "PE", name: "Peru" },
  { code: "UY", name: "Uruguai" },
  { code: "PY", name: "Paraguai" },
  { code: "BO", name: "Bolívia" },
  { code: "ROW", name: "Rest of World" }
].sort((a, b) => a.name.localeCompare(b.name));

export default function CountrySettings({
  settings,
  onChange
}: CountrySettingsProps) {
  const [multiSelect, setMultiSelect] = useState(settings.max_selections !== 1);

  const handleSelectAll = () => {
    onChange({
      ...settings,
      countries: countries.map((c) => c.code)
    });
  };

  const handleUnselectAll = () => {
    onChange({
      ...settings,
      countries: []
    });
  };

  const handleMultiSelectChange = (enabled: boolean) => {
    setMultiSelect(enabled);
    onChange({
      ...settings,
      max_selections: enabled ? undefined : 1
    });
  };

  const handleMaxSelectionsChange = (value: string) => {
    const maxSelections = value ? parseInt(value) : undefined;
    onChange({
      ...settings,
      max_selections: maxSelections
    });
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        Country Settings
      </h5>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <Label>Available Countries</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleUnselectAll}>
                Unselect All
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {countries.map((country) => (
              <div key={country.code} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.countries?.includes(country.code)}
                  onChange={(e) => {
                    const newCountries = e.target.checked
                      ? [...(settings.countries || []), country.code]
                      : (settings.countries || []).filter(
                          (c: string) => c !== country.code
                        );
                    onChange({ ...settings, countries: newCountries });
                  }}
                  className={`w-4 h-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900`}
                />
                <div className="flex items-center gap-2">
                  <img
                    src={getFlagUrl(country.code)}
                    width="24"
                    height="24"
                    alt={country.name}
                    className={`rounded-full ${
                      country.code === "ROW" ? "dark:invert" : ""
                    }`}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {country.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Allow Multiple Selection"
              checked={multiSelect}
              onChange={handleMultiSelectChange}
            />
          </div>

          {multiSelect && (
            <div>
              <Label>Maximum Selections</Label>
              <Input
                type="number"
                value={settings.max_selections || ""}
                onChange={(e) => handleMaxSelectionsChange(e.target.value)}
                min="1"
                max={countries.length.toString()}
                placeholder="Leave empty for unlimited"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Limit how many countries users can select. Leave empty to allow
                unlimited selections.
              </p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Switch
              label="Show Country Codes"
              checked={settings.show_percentage}
              onChange={(checked) =>
                onChange({ ...settings, show_percentage: checked })
              }
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Display country codes (BR, US, etc.) alongside flags in tables and
            forms
          </p>
        </div>
      </div>
    </div>
  );
}
