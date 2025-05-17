import Input from '../input/InputField';

interface ProductFieldProps {
  field: any;
  settings: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onErrorClear?: () => void;
}

export default function ProductField({
  field,
  settings,
  value,
  onChange,
  error,
  onErrorClear
}: ProductFieldProps) {
  // Parse value from string if needed
  const parsedValue = typeof value === 'string' ? JSON.parse(value || '{}') : value || {};

  // Format number as Brazilian Real
  const formatCurrency = (value: string) => {
    if (!value) return '';
    
    // Remove non-digits except comma and period
    const cleanedValue = value.replace(/[^\d,.]/g, '');
    
    // If there's a comma, assume it's a decimal separator (Brazilian format)
    if (cleanedValue.includes(',')) {
      // Split by comma to get integer and decimal parts
      const parts = cleanedValue.split(',');
      // Get integer part and remove any existing dots
      const integerPart = parts[0].replace(/\./g, '');
      // Format integer part with dots for thousands
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      // Get decimal part (default to '00' if not provided)
      const decimalPart = parts[1] || '00';
      
      // Format with Brazilian Real
      return `R$ ${formattedInteger},${decimalPart.padEnd(2, '0').substring(0, 2)}`;
    } else {
      // If no comma, treat as regular number
      // Remove any dots first
      const number = cleanedValue.replace(/\./g, '');
      
      if (number === '') return '';
      
      // Parse as integer and divide by 100 to get decimal value
      const value = parseInt(number);
      if (isNaN(value)) return '';
      
      // Format with Brazilian Real
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value / 100);
    }
  };

  // Parse Brazilian Real to number
  const parseCurrency = (value: string) => {
    if (!value) return '';
    
    // Remove currency symbol and non-numeric characters except comma and period
    const cleanedValue = value.replace(/[^\d,.]/g, '');
    
    // If there's a comma, preserve the original format
    if (cleanedValue.includes(',')) {
      return cleanedValue;
    } else {
      // If no comma, treat as regular number
      return cleanedValue;
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = {
      ...parsedValue,
      price: parseCurrency(e.target.value)
    };
    
    onChange(JSON.stringify(newValue));
    
    if (error && onErrorClear) {
      onErrorClear();
    }
  };

  return (
    <div>
      <Input
        type="text"
        value={parsedValue.price ? formatCurrency(parsedValue.price) : ''}
        onChange={handlePriceChange}
        placeholder="R$ 0,00"
        error={!!error}
        hint={error || settings?.product_description}
      />
    </div>
  );
}