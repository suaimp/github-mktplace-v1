import { useState } from 'react';
import Label from '../../Label';
import Switch from '../../switch/Switch';
import Input from '../../input/InputField';

interface BrazilianStatesSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function BrazilianStatesSettings({ settings, onChange }: BrazilianStatesSettingsProps) {
  const [multiSelect, setMultiSelect] = useState(settings.max_selections !== 1);

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
        Configurações de Municípios
      </h5>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Permitir Seleção Múltipla"
              checked={multiSelect}
              onChange={handleMultiSelectChange}
            />
          </div>

          {multiSelect && (
            <div>
              <Label>Limite de Seleções</Label>
              <Input
                type="number"
                value={settings.max_selections || ''}
                onChange={(e) => handleMaxSelectionsChange(e.target.value)}
                min="1"
                placeholder="Deixe em branco para ilimitado"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Limite quantos municípios os usuários podem selecionar. Deixe em branco para permitir seleções ilimitadas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}