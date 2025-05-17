import Label from '../../Label';
import Input from '../../input/InputField';

interface ProductSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function ProductSettings({ settings, onChange }: ProductSettingsProps) {
  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        Configurações do Produto
      </h5>

      <div className="grid grid-cols-1 gap-6">
        <div>
          <Label>Descrição</Label>
          <Input
            type="text"
            value={settings.product_description || ""}
            onChange={(e) => onChange({ ...settings, product_description: e.target.value })}
            placeholder="Descrição do produto"
          />
        </div>
      </div>
    </div>
  );
}