import Label from '../../Label';
import Input from '../../input/InputField';
import Switch from '../../switch/Switch';

interface FileSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function FileSettings({ settings, onChange }: FileSettingsProps) {
  // Predefined file types for easy selection
  const commonFileTypes = [
    { value: "jpg,jpeg,png", label: "Imagens (JPG, PNG)" },
    { value: "pdf", label: "PDF" },
    { value: "doc,docx", label: "Word (DOC, DOCX)" },
    { value: "mp3,wav", label: "Áudio (MP3, WAV)" },
    { value: "mp4,mov", label: "Vídeo (MP4, MOV)" },
    { value: "jpg,jpeg,png,pdf,doc,docx,mp3,mp4,wav,mov", label: "Todos os tipos suportados" }
  ];

  // Handle predefined file types selection
  const handlePredefinedTypesChange = (value: string) => {
    onChange({ ...settings, allowed_extensions: value });
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        File Upload Settings
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label>Predefined File Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            {commonFileTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`px-3 py-2 text-sm rounded-lg border ${
                  settings.allowed_extensions === type.value
                    ? "border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-900/20 dark:text-brand-400"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
                onClick={() => handlePredefinedTypesChange(type.value)}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <Label>Allowed Extensions</Label>
          <Input
            type="text"
            value={settings.allowed_extensions || ""}
            onChange={(e) => onChange({ ...settings, allowed_extensions: e.target.value })}
            placeholder="jpg, png, pdf, doc, docx, mp3, mp4, wav, mov"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Separate file extensions with commas (e.g., jpg, png, pdf, doc, docx, mp3, mp4, wav, mov)
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