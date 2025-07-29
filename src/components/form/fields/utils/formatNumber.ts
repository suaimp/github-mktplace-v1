// Função utilitária para formatar números com vírgulas e limitar valor máximo
export function formatNumber(value: string | number, maxValue?: number): string {
  if (value === undefined || value === null) return '';
  const strValue = String(value);
  // Remove qualquer caractere não numérico
  const number = strValue.replace(/\D/g, '');
  // Converte para número e limita ao valor máximo, se especificado
  let limitedNumber = parseInt(number);
  if (!isNaN(limitedNumber) && maxValue !== undefined) {
    limitedNumber = Math.min(limitedNumber, maxValue);
  }
  // Converte de volta para string e adiciona vírgulas
  return isNaN(limitedNumber) ? '' : limitedNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
