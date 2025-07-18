import { Coupon } from "../types";

export const formatDiscountType = (discountType: string): string => {
  const types: Record<string, string> = {
    'percentage': 'Desconto em porcentagem',
    'cart_fixed': 'Desconto fixo de carrinho',
    'product_fixed': 'Desconto fixo de produto',
    // Manter compatibilidade com tipo antigo
    'fixed': 'Valor fixo'
  };

  return types[discountType] || discountType;
};

export const formatDiscountValue = (coupon: Coupon): string => {
  if (coupon.discount_type === 'percentage') {
    return `${coupon.discount_value}%`;
  }
  return `R$ ${coupon.discount_value.toFixed(2)}`;
};

export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '-';
  return `R$ ${value.toFixed(2)}`;
};

export const getDiscountTypeOptions = () => [
  { value: 'percentage', label: 'Desconto em porcentagem' },
  { value: 'cart_fixed', label: 'Desconto fixo de carrinho' },
  { value: 'product_fixed', label: 'Desconto fixo de produto' }
];

export const getStatusText = (isActive: boolean): string => {
  return isActive ? 'Ativo' : 'Inativo';
};

export const getStatusColor = (isActive: boolean): string => {
  return isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
};
