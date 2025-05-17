import { useState } from 'react';
import Label from '../../Label';
import Input from '../../input/InputField';
import TextArea from '../../input/TextArea';
import Button from '../../../ui/button/Button';
import { PlusIcon, TrashBinIcon } from '../../../../icons';
import Switch from '../../switch/Switch';

interface OptionsSettingsProps {
  settings: any;
  options: Array<{ label: string; value: string; }>;
  onChange: (settings: any) => void;
  onOptionsChange: (options: Array<{ label: string; value: string; }>) => void;
  fieldType: 'select' | 'multiselect' | 'radio' | 'checkbox';
}

export default function OptionsSettings({ 
  settings, 
  options, 
  onChange, 
  onOptionsChange,
  fieldType 
}: OptionsSettingsProps) {
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [bulkOptions, setBulkOptions] = useState("");

  const handleAddOption = (e: React.MouseEvent) => {
    e.preventDefault();
    onOptionsChange([...options, { label: '', value: '' }]);
  };

  const handleRemoveOption = (index: number) => {
    onOptionsChange(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: 'label' | 'value', value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onOptionsChange(newOptions);
  };

  const handleBulkOptionsSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    const lines = bulkOptions.split('\n').filter(line => line.trim());
    const newOptions = lines.map(line => {
      const [label, value] = line.split('|').map(s => s.trim());
      return {
        label: label || '',
        value: value || label || ''
      };
    });
    onOptionsChange(newOptions);
    setShowBulkInput(false);
    setBulkOptions('');
  };

  return (
    <div className="md:col-span-2 border-t border-gray-200 dark:border-gray-800 mt-6 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-lg font-medium text-gray-800 dark:text-white/90">
          Field Options
        </h5>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowBulkInput(!showBulkInput)}
          >
            Bulk Add
          </Button>
          <Button
            type="button"
            onClick={handleAddOption}
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Option
          </Button>
        </div>
      </div>

      {showBulkInput ? (
        <div className="space-y-4">
          <TextArea
            value={bulkOptions}
            onChange={setBulkOptions}
            rows={10}
            placeholder="Enter one option per line&#10;For custom values use: Label|Value&#10;&#10;Example:&#10;First Option&#10;Second Option|second_opt&#10;Third Option|third_opt"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowBulkInput(false);
                setBulkOptions('');
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleBulkOptionsSubmit}
            >
              Add Options
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-1">
                <Label>Label</Label>
                <Input
                  type="text"
                  value={option.label}
                  onChange={(e) => handleOptionChange(index, 'label', e.target.value)}
                  placeholder="Option Label"
                />
              </div>
              <div className="flex-1">
                <Label>Value</Label>
                <Input
                  type="text"
                  value={option.value}
                  onChange={(e) => handleOptionChange(index, 'value', e.target.value)}
                  placeholder="Option Value"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleRemoveOption(index)}
                  className="p-2 text-error-500 hover:text-error-600 dark:text-error-400 dark:hover:text-error-300"
                >
                  <TrashBinIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(fieldType === 'multiselect' || fieldType === 'checkbox') && (
        <div className="mt-6">
          <Label>Maximum Selections</Label>
          <Input
            type="number"
            value={settings.max_selections || ''}
            onChange={(e) => onChange({ 
              ...settings, 
              max_selections: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            min="1"
            max={options.length}
            placeholder="Leave empty for unlimited"
          />
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Limit how many options users can select. Leave empty to allow unlimited selections.
          </p>
        </div>
      )}

      {(fieldType === 'radio' || fieldType === 'checkbox') && (
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Switch
              label="Inline Layout"
              checked={settings.inline_layout}
              onChange={(checked) => onChange({ ...settings, inline_layout: checked })}
            />
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Display options in a horizontal line instead of stacked vertically
          </p>
        </div>
      )}
    </div>
  );
}