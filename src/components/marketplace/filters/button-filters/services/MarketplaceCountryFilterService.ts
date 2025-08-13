/**
 * Serviço para gerenciar filtros de país no marketplace
 * Responsabilidade: Operações de dados relacionadas a filtros de país
 */

import { CountriesService } from '../../../../../services/db-services/common/countriesService';
import { CountryFilterOption, Country } from '../types';

export class MarketplaceCountryFilterService {
  /**
   * Obtém todos os países disponíveis para filtro
   */
  static getAvailableCountries(): Country[] {
    return CountriesService.getAllCountries();
  }

  /**
   * Busca países por termo de pesquisa
   */
  static searchCountries(searchTerm: string): Country[] {
    if (!searchTerm.trim()) {
      return this.getAvailableCountries();
    }
    return CountriesService.searchCountriesByName(searchTerm);
  }

  /**
   * Converte países em opções de filtro
   */
  static formatCountriesForFilter(countries: Country[]): CountryFilterOption[] {
    return countries.map(country => ({
      id: country.value,
      label: country.label,
      value: country.value,
      flagUrl: country.flag,
      countryCode: country.value
    }));
  }

  /**
   * Obtém país por código
   */
  static getCountryByCode(code: string): Country | undefined {
    return CountriesService.getCountryByCode(code);
  }

  /**
   * Obtém opções de filtro formatadas
   */
  static getCountryFilterOptions(): CountryFilterOption[] {
    const countries = this.getAvailableCountries();
    return this.formatCountriesForFilter(countries);
  }
}
