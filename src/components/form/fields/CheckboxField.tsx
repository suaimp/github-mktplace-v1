import Checkbox from '../input/Checkbox';

interface CheckboxFieldProps {
  field: any;
  settings: any;
  value: string[];
  onChange: (values: string[]) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function CheckboxField({
  field,
  settings,
  value = [],
  onChange,
  error,
  onErrorClear
}: CheckboxFieldProps) {
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];
  
  const maxReached = settings?.max_selections && safeValue.length >= settings.max_selections;
  const isInline = settings?.inline_layout || field.validation_rules?.inline_layout;

  return (
    <div className={`${isInline ? 'flex flex-wrap gap-4' : 'space-y-2'}`}>
      {field.options?.map((option: any, index: number) => {
        const optionValue = option.value || option.label;
        const isChecked = safeValue.includes(optionValue);
        
        return (
          <Checkbox
            key={index}
            checked={isChecked}
            onChange={(checked) => {
              let newValues: string[];
              
              if (checked) {
                // Add value if not at max selections
                if (!maxReached || isChecked) {
                  newValues = [...safeValue, optionValue];
                } else {
                  newValues = [...safeValue];
                }
              } else {
                // Remove value
                newValues = safeValue.filter(v => v !== optionValue);
              }
              
              onChange(newValues);
              
              if (error && onErrorClear) {
                onErrorClear();
              }
            }}
            label={option.label}
            disabled={maxReached && !isChecked}
          />
        );
      })}
      
      {settings?.max_selections && (
        <p className="text-sm text-gray-500 dark:text-gray-400 w-full">
          {safeValue.length === settings.max_selections ? (
            <span className="text-warning-500">Máximo de {settings.max_selections} seleções atingido</span>
          ) : (
            `Você pode selecionar até ${settings.max_selections} ${settings.max_selections === 1 ? 'opção' : 'opções'}`
          )}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-error-500 w-full">{error}</p>
      )}
    </div>
  );
}