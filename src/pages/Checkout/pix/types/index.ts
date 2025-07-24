/**
 * Tipos relacionados ao PIX Payment
 * Seguindo o princípio de responsabilidade única
 */

export interface PixCustomerData {
  name: string;
  email: string;
  document: string;
  phone: string;
  legal_status: 'individual' | 'business';
  company_name?: string;
}

export interface PixOrderItem {
  amount: number;
  description: string;
  quantity: number;
  code: string;
}

export interface PixPaymentRequest {
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_document: string;
  customer_phone: string;
  customer_legal_status: 'individual' | 'business';
  customer_company_name?: string;
  order_id: string;
  order_items: PixOrderItem[];
}

export interface PixPaymentResponse {
  success: boolean;
  qr_code?: string;
  qr_code_url?: string;
  expires_at?: string;
  order_id?: string;
  error?: string;
  message?: string;
  raw_response?: any;
}

export interface DocumentValidation {
  isValid: boolean;
  documentType: 'cpf' | 'cnpj';
  expectedLength: number;
  customerType: 'individual' | 'company';
  error?: string;
}

export interface PixDebugInfo {
  customer_legal_status: string;
  customer_legal_status_type: string;
  customer_document: string;
  customer_document_clean: string;
  customer_document_length: number;
  expected_document_type: string;
  expected_customer_type: string;
  timestamp: string;
}
