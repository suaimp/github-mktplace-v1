import { useEffect, useState } from "react";
import Input from "../../input/InputField";
import Label from "../../Label";
import { getFormFieldNicheByFormFieldId } from "../../../../context/db-context/services/formFieldNicheService";

interface NicheSettingsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (settings: any) => void;
}

export default function NicheSettings({ settings, onChange }: NicheSettingsProps) {
  const [niches, setNiches] = useState<string[]>(settings.options || [""]);

  useEffect(() => {
    async function fetchOptions() {
      if (!settings.field_id) return;
      const data = await getFormFieldNicheByFormFieldId(settings.field_id);
      if (data && Array.isArray(data.options) && data.options.length > 0) {
        setNiches(data.options);
        onChange({ ...settings, options: data.options });
      }
    }
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.field_id]);

  const handleNicheChange = (idx: number, value: string) => {
    const newNiches = niches.map((n, i) => (i === idx ? value : n));
    setNiches(newNiches);
    console.log("[NicheSettings] options sent to parent via onChange:", newNiches);
    onChange({ ...settings, options: newNiches });
  };

  const addNiche = () => {
    const updated = [...niches, ""];
    setNiches(updated);
    console.log("[NicheSettings] options sent to parent via onChange:", updated);
    onChange({ ...settings, options: updated });
  };

  const removeNiche = (idx: number) => {
    if (niches.length === 1) return;
    const newNiches = niches.filter((_, i) => i !== idx);
    setNiches(newNiches);
    console.log("[NicheSettings] options sent to parent via onChange:", newNiches);
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
        <div key={idx} className="flex items-center gap-2 mb-2">
          <Input
            type="text"
            value={niche}
            onChange={e => handleNicheChange(idx, e.target.value)}
            placeholder={`Nicho ${idx + 1}`}
            name={`niche-option-${idx}`}
            data-idx={idx}
            data-all={JSON.stringify(niches)}
          />
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
      ))}
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Defina um ou mais nichos relacionados a este campo.
      </p>
    </div>
  );
}
