import Label from '../../Label';
import Select from '../../Select';

interface DateTimeSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
  type: 'date' | 'time';
}

export default function DateTimeSettings({ settings, onChange, type }: DateTimeSettingsProps) {
  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        {type === 'date' ? 'Date' : 'Time'} Settings
      </h5>

      <div>
        <Label>Format</Label>
        <Select
          options={
            type === 'date' 
              ? [
                  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
                  { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
                  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' }
                ]
              : [
                  { value: 'HH:mm', label: '24-hour (HH:mm)' },
                  { value: 'hh:mm A', label: '12-hour (hh:mm AM/PM)' }
                ]
          }
          value={type === 'date' ? settings.date_format : settings.time_format}
          onChange={(value) => {
            if (type === 'date') {
              onChange({ ...settings, date_format: value });
            } else {
              onChange({ ...settings, time_format: value });
            }
          }}
        />
      </div>
    </div>
  );
}