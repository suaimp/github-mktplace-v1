import Select from '../../../form/Select';
import Label from '../../../form/Label';
import { CountrySelectProps } from './types';
import { useCountrySelect } from './useCountrySelect';
import { formatCountriesForSelect } from './utils';

/**
 * Componente de seleção de país com bandeiras
 * Responsabilidade: Renderizar campo de seleção de país com bandeiras
 */
export default function CountrySelect({ 
  value, 
  onChange, 
  required = false, 
  disabled = false 
}: CountrySelectProps) {
  const { countries, loading } = useCountrySelect();

  const options = formatCountriesForSelect(countries);

  return (
    <div>
      <Label>
        País {required && <span className="text-error-500">*</span>}
      </Label>
      <Select
        options={options}
        value={value}
        onChange={onChange}
        disabled={disabled || loading}
        placeholder={loading ? "Carregando países..." : "Selecione um país"}
      />
    </div>
  );
}
