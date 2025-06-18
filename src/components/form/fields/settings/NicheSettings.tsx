import { useEffect, useState } from "react";
import Input from "../../input/InputField";
import Label from "../../Label";
import IconSelector from "../../IconSelector";
import {
  getFormFieldNicheByFormFieldId,
  parseNicheData,
  type NicheOption
} from "../../../../context/db-context/services/formFieldNicheService";

interface NicheSettingsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (settings: any) => void;
}

export default function NicheSettings({
  settings,
  onChange
}: NicheSettingsProps) {
  const [niches, setNiches] = useState<NicheOption[]>(() => {
    const parsed = parseNicheData(settings.options || []);
    return parsed.length > 0 ? parsed : [{ text: "", icon: undefined }];
  });

  useEffect(() => {
    async function fetchOptions() {
      if (!settings.field_id) return;
      console.log(
        "[NicheSettings] Fetching options for field_id:",
        settings.field_id
      );
      const data = await getFormFieldNicheByFormFieldId(settings.field_id);
      if (data && Array.isArray(data.options) && data.options.length > 0) {
        console.log("[NicheSettings] Raw data from DB:", data.options);
        const formattedOptions = parseNicheData(data.options);
        console.log("[NicheSettings] Parsed options:", formattedOptions);
        console.log("[NicheSettings] Icons in parsed options:");
        formattedOptions.forEach((opt, idx) => {
          console.log(`[NicheSettings] Option ${idx} icon:`, opt.icon);
        });
        setNiches(formattedOptions);
        onChange({ ...settings, options: formattedOptions });
      }
    }
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.field_id]);

  const handleNicheTextChange = (idx: number, value: string) => {
    const newNiches = niches.map((n, i) =>
      i === idx ? { ...n, text: value } : n
    );
    setNiches(newNiches);
    console.log("[NicheSettings] Text changed - sending to parent:", newNiches);
    onChange({ ...settings, options: newNiches });
  };

  const handleNicheIconChange = (idx: number, iconName: string) => {
    console.log(`[NicheSettings] Icon changing for index ${idx}: ${iconName}`);
    const newNiches = niches.map((n, i) =>
      i === idx ? { ...n, icon: iconName } : n
    );
    setNiches(newNiches);
    console.log("[NicheSettings] Icon changed - sending to parent:", newNiches);
    console.log(
      `[NicheSettings] New icon for index ${idx}:`,
      newNiches[idx]?.icon
    );
    onChange({ ...settings, options: newNiches });
  };

  const handleNicheIconClear = (idx: number) => {
    console.log(`[NicheSettings] Icon clearing for index ${idx}`);
    const newNiches = niches.map((n, i) =>
      i === idx ? { ...n, icon: undefined } : n
    );
    setNiches(newNiches);
    console.log("[NicheSettings] Icon cleared - sending to parent:", newNiches);
    console.log(
      `[NicheSettings] Cleared icon for index ${idx}:`,
      newNiches[idx]?.icon
    );
    onChange({ ...settings, options: newNiches });
  };

  const addNiche = () => {
    const updated = [...niches, { text: "", icon: undefined }];
    setNiches(updated);
    console.log("[NicheSettings] Niche added - sending to parent:", updated);
    onChange({ ...settings, options: updated });
  };

  const removeNiche = (idx: number) => {
    if (niches.length === 1) return;
    const newNiches = niches.filter((_, i) => i !== idx);
    setNiches(newNiches);
    console.log(
      "[NicheSettings] Niche removed - sending to parent:",
      newNiches
    );
    onChange({ ...settings, options: newNiches });
  };

  return (
    <div>
      <Label>Nichos</Label>
      <button
        type="button"
        className="text-brand-500 hover:underline text-sm mt-1 mb-2"
        onClick={addNiche}
      >
        + Adicionar nicho
      </button>
      {niches.map((niche, idx) => (
        <div
          key={idx}
          className="space-y-3 mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="text"
                value={niche.text}
                onChange={(e) => handleNicheTextChange(idx, e.target.value)}
                placeholder={`Nicho ${idx + 1}`}
                name={`niche-option-${idx}`}
                data-idx={idx}
              />
            </div>
            {niches.length > 1 && (
              <button
                type="button"
                className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-red-200 dark:hover:bg-red-900 transition-colors"
                onClick={() => removeNiche(idx)}
                title="Remover nicho"
              >
                ×
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ícone (opcional)
            </label>
            <IconSelector
              selectedIcon={niche.icon}
              onIconSelect={(iconName) => handleNicheIconChange(idx, iconName)}
              onClear={() => handleNicheIconClear(idx)}
              placeholder="Selecione um ícone"
            />
          </div>
        </div>
      ))}
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Defina um ou mais nichos relacionados a este campo. Cada nicho pode ter
        um ícone opcional.
      </p>
    </div>
  );
}
