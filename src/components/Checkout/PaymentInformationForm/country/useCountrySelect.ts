import { useState, useEffect } from 'react';
import { CountriesService } from '../../../../services/db-services/common/countriesService';
import { CountrySelectOption } from './types';

/**
 * Hook para gerenciar dados de países no checkout
 * Responsabilidade: Carregar e fornecer dados de países com bandeiras
 */
export function useCountrySelect() {
  const [countries, setCountries] = useState<CountrySelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCountries = () => {
      try {
        setLoading(true);
        const countriesData = CountriesService.getCountriesForSelect();
        setCountries(countriesData);
      } catch (error) {
        console.error('Erro ao carregar países:', error);
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  const getCountryByCode = (code: string) => {
    return CountriesService.getCountryByCode(code);
  };

  return {
    countries,
    loading,
    getCountryByCode
  };
}
