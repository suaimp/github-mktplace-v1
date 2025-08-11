/**
 * Tipos e interfaces para a tela de sucesso do pagamento
 * Responsabilidade: Definir estruturas de dados para componentes de sucesso
 */

export interface OrderSuccessData {
  id: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

export interface PaymentSuccessDisplayProps {
  orderData: OrderSuccessData;
  paymentMethod: 'pix' | 'card' | 'boleto';
}

export interface OrderSuccessItemData {
  id: string;
  productName: string;
  productUrl?: string;
  quantity: number;
  price: number;
  requiresCustomerContent: boolean;
}
