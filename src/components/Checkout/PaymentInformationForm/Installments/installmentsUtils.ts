// Detecta a bandeira do cartão a partir do número (simplificado)
export function getCardBrand(cardNumber: string): string {
  if (!cardNumber) return '';
  const number = cardNumber.replace(/\D/g, '');
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  if (/^6/.test(number)) return 'elo';
  if (/^3(0|6|8)/.test(number)) return 'diners';
  if (/^35/.test(number)) return 'jcb';
  return 'desconhecida';
}

// Formata valor em centavos para BRL
export function formatBRL(value: number): string {
  return (value / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Regras de parcelamento por bandeira
export const installmentRules = {
  visa: { max: 12, minValue: 500 }, // R$5,00 em centavos
  mastercard: { max: 12, minValue: 500 },
  elo: { max: 6, minValue: 500 },
  amex: { max: 12, minValue: 500 },
  default: { max: 6, minValue: 500 }
};

export function getInstallmentRule(brand: string) {
  return installmentRules[brand?.toLowerCase()] || installmentRules.default;
}

export function isInstallmentValid(brand: string, amount: number, installments: number): boolean {
  const rule = getInstallmentRule(brand);
  if (installments < 1 || installments > rule.max) return false;
  if (amount / installments < rule.minValue) return false;
  return true;
} 