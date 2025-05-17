import { useState, useEffect } from 'react';
import Switch from '../../switch/Switch';

interface ApiFieldSettingsProps {
  settings: any;
  onChange: (settings: any) => void;
}

export default function ApiFieldSettings({ settings, onChange }: ApiFieldSettingsProps) {
  // Initialize state from props, ensuring we get the correct initial value
  const [sortByField, setSortByField] = useState<boolean>(false);
  
  // Update local state when settings prop changes
  useEffect(() => {
    console.log("Settings received in ApiFieldSettings:", settings);
    setSortByField(!!settings.sort_by_field);
  }, [settings]);

  const handleSortByFieldChange = (checked: boolean) => {
    // Update local state
    setSortByField(checked);
    
    // Update parent component state
    const updatedSettings = {
      ...settings,
      sort_by_field: checked
    };
    
    onChange(updatedSettings);
    
    // Log for debugging
    console.log("Sort by field changed to:", checked);
    console.log("Updated settings:", updatedSettings);
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <h5 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-4">
        API Field Settings
      </h5>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Switch
              label="Sort by this field in marketplace"
              checked={sortByField}
              onChange={handleSortByFieldChange}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            When enabled, the marketplace table will be sorted by this field in descending order (highest values first)
          </p>
        </div>
      </div>
    </div>
  );
}