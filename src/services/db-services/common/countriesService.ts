/**
 * Serviço para gerenciar dados de países
 * Responsabilidade: CRUD e operações relacionadas a países
 */

export interface Country {
  value: string;
  label: string;
  flag: string;
}

/**
 * Lista de países com bandeiras
 * Utiliza flagcdn.com para as imagens das bandeiras
 */
export const COUNTRIES: Country[] = [
  // América do Sul
  { value: "BR", label: "Brasil", flag: "https://flagcdn.com/br.svg" },
  { value: "AR", label: "Argentina", flag: "https://flagcdn.com/ar.svg" },
  { value: "BO", label: "Bolívia", flag: "https://flagcdn.com/bo.svg" },
  { value: "CL", label: "Chile", flag: "https://flagcdn.com/cl.svg" },
  { value: "CO", label: "Colômbia", flag: "https://flagcdn.com/co.svg" },
  { value: "EC", label: "Equador", flag: "https://flagcdn.com/ec.svg" },
  { value: "GY", label: "Guiana", flag: "https://flagcdn.com/gy.svg" },
  { value: "PY", label: "Paraguai", flag: "https://flagcdn.com/py.svg" },
  { value: "PE", label: "Peru", flag: "https://flagcdn.com/pe.svg" },
  { value: "SR", label: "Suriname", flag: "https://flagcdn.com/sr.svg" },
  { value: "UY", label: "Uruguai", flag: "https://flagcdn.com/uy.svg" },
  { value: "VE", label: "Venezuela", flag: "https://flagcdn.com/ve.svg" },

  // América do Norte
  { value: "US", label: "Estados Unidos", flag: "https://flagcdn.com/us.svg" },
  { value: "CA", label: "Canadá", flag: "https://flagcdn.com/ca.svg" },
  { value: "MX", label: "México", flag: "https://flagcdn.com/mx.svg" },

  // Europa
  { value: "DE", label: "Alemanha", flag: "https://flagcdn.com/de.svg" },
  { value: "ES", label: "Espanha", flag: "https://flagcdn.com/es.svg" },
  { value: "FR", label: "França", flag: "https://flagcdn.com/fr.svg" },
  { value: "IT", label: "Itália", flag: "https://flagcdn.com/it.svg" },
  { value: "PT", label: "Portugal", flag: "https://flagcdn.com/pt.svg" },
  { value: "GB", label: "Reino Unido", flag: "https://flagcdn.com/gb.svg" },

  // Ásia
  { value: "CN", label: "China", flag: "https://flagcdn.com/cn.svg" },
  { value: "JP", label: "Japão", flag: "https://flagcdn.com/jp.svg" },
  { value: "KR", label: "Coreia do Sul", flag: "https://flagcdn.com/kr.svg" },
  { value: "IN", label: "Índia", flag: "https://flagcdn.com/in.svg" },

  // Oceania
  { value: "AU", label: "Austrália", flag: "https://flagcdn.com/au.svg" },
  { value: "NZ", label: "Nova Zelândia", flag: "https://flagcdn.com/nz.svg" },
];

export class CountriesService {
  /**
   * Retorna todos os países disponíveis
   */
  static getAllCountries(): Country[] {
    return COUNTRIES;
  }

  /**
   * Busca um país pelo código
   */
  static getCountryByCode(code: string): Country | undefined {
    return COUNTRIES.find(country => country.value === code);
  }

  /**
   * Busca países por nome (pesquisa parcial)
   */
  static searchCountriesByName(search: string): Country[] {
    const searchLower = search.toLowerCase();
    return COUNTRIES.filter(country => 
      country.label.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Retorna países formatados para uso em Select components
   */
  static getCountriesForSelect() {
    return COUNTRIES.map(country => ({
      value: country.value,
      label: country.label,
      flagUrl: country.flag
    }));
  }
}
