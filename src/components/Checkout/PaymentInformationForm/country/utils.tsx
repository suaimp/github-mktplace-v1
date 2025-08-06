/**
 * Utilitários para formatação e manipulação de dados de países
 * Responsabilidade: Funções auxiliares para países
 */

/**
 * Renderiza a bandeira de um país
 */
export const renderCountryFlag = (flagUrl: string, countryName: string) => (
  <img
    src={flagUrl}
    width="20"
    height="15"
    alt={`Bandeira ${countryName}`}
    className="mr-2 inline-block"
    style={{ objectFit: 'cover' }}
    onError={(e) => {
      // Fallback caso a imagem não carregue
      const target = e.target as HTMLImageElement;
      target.style.display = 'none';
    }}
  />
);

/**
 * Cria opção de país formatada para Select
 */
export const createCountryOption = (value: string, label: string, flagUrl: string) => ({
  value,
  label,
  icon: renderCountryFlag(flagUrl, label)
});

/**
 * Formata lista de países para uso em Select components
 */
export const formatCountriesForSelect = (countries: Array<{value: string, label: string, flagUrl: string}>) => {
  return countries.map(country => createCountryOption(country.value, country.label, country.flagUrl));
};
