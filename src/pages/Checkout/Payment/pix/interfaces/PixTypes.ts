/**
 * Interfaces para PIX Payment
 * Responsabilidade: Definir tipos e contratos de dados para PIX
 */

/**
 * Dados do cliente para PIX
 */
export interface PixCustomerData {
  name: string;
  email: string;
  document: string;
  phone: string;
  legal_status: 'individual' | 'business';
  company_name?: string;
}

/**
 * Item do pedido para PIX
 */
export interface PixOrderItem {
  amount: number; // valor em centavos
  description: string;
  quantity: number;
  code: string;
}

/**
 * Request para gerar QR Code PIX
 */
export interface PixPaymentRequest {
  amount: number; // valor total em centavos
  customer_name: string;
  customer_email: string;
  customer_document: string;
  customer_phone: string;
  customer_legal_status: 'individual' | 'business';
  customer_company_name?: string;
  order_id: string;
  order_items: PixOrderItem[];
}

/**
 * Response da geração do QR Code PIX
 */
export interface PixPaymentResponse {
  success: boolean;
  qr_code?: string;
  qr_code_url?: string;
  expires_at?: string;
  order_id?: string;
  payment_id?: string;
  error?: string;
  message?: string;
  raw_response?: any;
}

/**
 * Estado do QR Code PIX
 */
export interface PixQrCodeState {
  qrCodeUrl: string | null;
  copiaECola: string | null;
  isGenerating: boolean;
  error: string | null;
}

/**
 * Dados de validação de documento
 */
export interface DocumentValidation {
  isValid: boolean;
  documentType: 'cpf' | 'cnpj';
  expectedLength: number;
  customerType: 'individual' | 'company';
  error?: string;
}

/**
 * Dados do resumo do pedido para PIX
 */
export interface PixOrderSummary {
  totalProductPrice: number;
  totalContentPrice: number;
  totalFinalPrice: number;
  items: any[];
  appliedCouponId?: string | null;
  discountValue?: number;
}
