import { Country } from '../../../../services/db-services/common/countriesService';

export interface CountrySelectOption {
  value: string;
  label: string;
  flagUrl: string;
}

export interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}
