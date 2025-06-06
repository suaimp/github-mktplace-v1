import { useState, useEffect } from 'react';
import Switch from '../../switch/Switch';

interface UrlFieldSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function UrlFieldSettings({ settings, onChange }: UrlFieldSettingsProps) {
  const [isSiteUrl, setIsSiteUrl] = useState(settings.is_site_url || false);
  const [isProductName, setIsProductName] = useState(settings.is_product_name || false);

  // Update local state when settings prop changes
  useEffect(() => {
    setIsSiteUrl(!!settings.is_site_url);
    setIsProductName(!!settings.is_product_name);
  }, [settings]);

  const handleIsSiteUrlChange = (checked: boolean) => {
    setIsSiteUrl(checked);
    onChange({
      ...settings,
      is_site_url: checked
    });
  };

  const handleIsProductNameChange = (checked: boolean) => {
    setIsProductName(checked);
    onChange({
      ...settings,
      is_product_name: checked
    });
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        Configurações de URL
      </h5>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Nome do Produto na Loja"
              checked={isProductName}
              onChange={handleIsProductNameChange}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quando ativado, este campo será usado como o nome principal do produto na loja.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="URL de Site"
              checked={isSiteUrl}
              onChange={handleIsSiteUrlChange}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quando ativado, este campo será usado como a URL do site do produto.
          </p>
        </div>
      </div>
    </div>
  );
}