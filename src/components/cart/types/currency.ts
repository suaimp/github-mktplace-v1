/**
 * Tipo para representar valores monetários
 */
export type MonetaryValue = number | string;

/**
 * Interface para propriedades que envolvem formatação de moeda
 */
export interface CurrencyFormattable {
  value: MonetaryValue;
  formatted?: string;
}
