import { useState } from 'react';
import Label from '../../Label';
import Input from '../../input/InputField';
import Switch from '../../switch/Switch';
import Select from '../../Select';

interface ButtonBuySettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function ButtonBuySettings({ settings, onChange }: ButtonBuySettingsProps) {
  const [customText, setCustomText] = useState(settings.custom_button_text || false);

  const handleCustomTextChange = (checked: boolean) => {
    setCustomText(checked);
    onChange({
      ...settings,
      custom_button_text: checked
    });
  };

  const handleButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...settings,
      button_text: e.target.value
    });
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        Configurações do Botão de Compra
      </h5>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Posicionar na última coluna"
              checked={settings.position_last_column || false}
              onChange={(checked) => onChange({ ...settings, position_last_column: checked })}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quando ativado, o botão será exibido na última coluna da tabela de marketplace
          </p>
        </div>

        <div>
          <Label>Estilo do Botão</Label>
          <Select
            options={[
              { 
                value: "primary", 
                label: "Modelo 1 - Cor da marca" 
              },
              { 
                value: "outline", 
                label: "Modelo 2 - Branco" 
              }
            ]}
            value={settings.button_style || "primary"}
            onChange={(value) => onChange({ ...settings, button_style: value })}
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Escolha o estilo visual do botão de compra
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Personalizar texto do botão"
              checked={customText}
              onChange={handleCustomTextChange}
            />
          </div>

          {customText && (
            <div>
              <Label>Texto do Botão</Label>
              <Input
                type="text"
                value={settings.button_text || ""}
                onChange={handleButtonTextChange}
                placeholder="Comprar"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Personalize o texto que aparecerá no botão de compra
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}