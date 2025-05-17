import Label from '../../Label';
import Input from '../../input/InputField';
import Switch from '../../switch/Switch';

interface FileSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function FileSettings({ settings, onChange }: FileSettingsProps) {
  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        File Upload Settings
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Allowed Extensions</Label>
          <Input
            type="text"
            value={settings.allowed_extensions || ""}
            onChange={(e) => onChange({ ...settings, allowed_extensions: e.target.value })}
            placeholder="jpg, png, pdf"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Separate file extensions with commas (e.g., jpg, png, pdf)
          </p>
        </div>

        <div>
          <Label>Maximum File Size (MB)</Label>
          <Input
            type="number"
            value={settings.max_file_size || ""}
            onChange={(e) => onChange({ 
              ...settings, 
              max_file_size: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            min="1"
            placeholder="5"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Maximum size per file in megabytes
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Allow Multiple Files"
              checked={settings.multiple_files}
              onChange={(checked) => onChange({ 
                ...settings, 
                multiple_files: checked,
                max_files: checked ? settings.max_files : 1
              })}
            />
          </div>
        </div>

        {settings.multiple_files && (
          <div>
            <Label>Maximum Files</Label>
            <Input
              type="number"
              value={settings.max_files || ""}
              onChange={(e) => onChange({ 
                ...settings, 
                max_files: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              min="1"
              placeholder="10"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Maximum number of files that can be uploaded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}