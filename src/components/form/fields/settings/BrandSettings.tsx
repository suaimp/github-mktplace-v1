import { useState, useEffect } from 'react';
import Switch from '../../switch/Switch';

interface BrandSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function BrandSettings({ settings, onChange }: BrandSettingsProps) {
  const [showLogo, setShowLogo] = useState(settings.show_logo !== false);
  const [isProductName, setIsProductName] = useState(settings.is_product_name || false);
  const [isSiteUrl, setIsSiteUrl] = useState(settings.is_site_url || false);

  // Update local state when settings prop changes
  useEffect(() => {
    setShowLogo(settings.show_logo !== false);
    setIsProductName(!!settings.is_product_name);
    setIsSiteUrl(!!settings.is_site_url);
  }, [settings]);

  const handleShowLogoChange = (checked: boolean) => {
    setShowLogo(checked);
    onChange({
      ...settings,
      show_logo: checked
    });
  };

  const handleIsProductNameChange = (checked: boolean) => {
    setIsProductName(checked);
    onChange({
      ...settings,
      is_product_name: checked
    });
  };

  const handleIsSiteUrlChange = (checked: boolean) => {
    setIsSiteUrl(checked);
    onChange({
      ...settings,
      is_site_url: checked
    });
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        Configurações da Marca
      </h5>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Exibir Logo"
              checked={showLogo}
              onChange={handleShowLogoChange}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Quando desativado, apenas o nome da marca será exibido, sem o logo.
          </p>
        </div>

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