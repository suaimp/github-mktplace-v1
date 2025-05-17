import Label from '../../Label';
import Input from '../../input/InputField';
import Switch from '../../switch/Switch';

interface InputMaskSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function InputMaskSettings({ settings, onChange }: InputMaskSettingsProps) {
  return (
    <div className="space-y-4 md:col-span-2">
      <div className="flex items-center gap-2">
        <Switch
          label="Enable Input Mask"
          checked={settings.input_mask_enabled}
          onChange={(checked) => onChange({ ...settings, input_mask_enabled: checked })}
        />
      </div>

      {settings.input_mask_enabled && (
        <div>
          <Label>Input Mask Pattern</Label>
          <Input
            type="text"
            value={settings.input_mask_pattern || ""}
            onChange={(e) => onChange({ ...settings, input_mask_pattern: e.target.value })}
            placeholder="999.999.999-99"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Use 9 for numbers, A for letters, * for alphanumeric. Examples:
            <br />
            - CPF: 999.999.999-99
            <br />
            - Phone: (99) 99999-9999
            <br />
            - Date: 99/99/9999
          </p>
        </div>
      )}
    </div>
  );
}