/**
 * Utilitários para formatação e máscara de moeda BRL
 */

/**
 * Formata um valor numérico para exibição como moeda BRL
 */
export function formatCurrency(value: number | string): string {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(numValue);
}

/**
 * Remove formatação de moeda e retorna apenas números
 */
export function unformatCurrency(value: string): string {
  return value.replace(/[^\d,]/g, "").replace(",", ".");
}

/**
 * Converte string com vírgula para número
 */
export function parsePrice(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Aplica máscara de moeda durante a digitação
 */
export function applyCurrencyMask(value: string): string {
  // Remove tudo exceto dígitos
  const onlyDigits = value.replace(/\D/g, "");

  if (!onlyDigits) return "";

  // Converte para centavos
  const cents = parseInt(onlyDigits, 10);

  // Converte de volta para reais
  const reais = cents / 100;

  // Formata com separadores brasileiros
  return reais.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Formata valor para display no input (sem símbolo R$)
 */
export function formatInputCurrency(value: string | number): string {
  if (!value) return "";

  const numValue = typeof value === "string" ? parsePrice(value) : value;
  if (isNaN(numValue) || numValue === 0) return "";

  return numValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
