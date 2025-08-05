/**
 * Formata um valor numérico para o formato de moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @returns Valor formatado como string (ex: "R$ 17.397,00")
 */
export function formatBrazilianCurrency(value: number | string): string {
  // Converte para número se for string
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verifica se é um número válido
  if (isNaN(numericValue)) {
    return 'R$ 0,00';
  }
  
  // Arredonda para 2 casas decimais para evitar problemas de precisão
  const roundedValue = Math.round(numericValue * 100) / 100;
  
  // Formata o número para o padrão brasileiro
  const formatted = roundedValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return `R$ ${formatted}`;
}


/**
 * Exibe valor já formatado do banco (formato brasileiro: 17.397,00)
 * Apenas adiciona o R$ na frente, sem alterar nada.
 */
export function formatBrazilianValueFromDb(value: string): string {
  if (!value || value === 'NaN') return 'R$ 0,00';
  return value.startsWith('R$') ? value : `R$ ${value}`;
}

/**
 * Formata um número JS para o formato brasileiro (milhar com ponto, decimal com vírgula)
 * Exemplo: 86984.999999 -> '86.984,99'
 */
export function formatNumberToBrazilian(value: number): string {
  if (isNaN(value)) return '0,00';
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Função auxiliar para arredondar números com alta precisão
 * Evita problemas de ponto flutuante do JavaScript
 * @param value - Valor a ser arredondado
 * @param decimals - Número de casas decimais (padrão: 2)
 * @returns Valor arredondado
 */
export function roundToPrecision(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
