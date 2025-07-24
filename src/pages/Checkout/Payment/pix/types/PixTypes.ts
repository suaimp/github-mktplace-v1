/**
 * Tipos relacionados ao pagamento PIX
 */

export type LegalStatus = 'individual' | 'business';

export type DocumentType = 'cpf' | 'cnpj';

export type CustomerType = 'individual' | 'company';

export interface PixCustomerData {
  name: string;
  email: string;
  document: string;
  phone: string;
  legal_status: LegalStatus;
  company_name?: string;
}

export interface PixPaymentRequest {
  amount: number;
  customer_name: string;
  customer_email: string;
  customer_document: string;
  customer_phone: string;
  customer_legal_status: LegalStatus;
  customer_company_name?: string;
  order_id: string;
  order_items: PixOrderItem[];
}

export interface PixOrderItem {
  amount: number;
  description: string;
  quantity: number;
  code: string;
}

export interface PixPaymentResponse {
  success: boolean;
  qr_code?: string;
  qr_code_url?: string;
  expires_at?: string;
  order_id?: string;
  error?: string;
  debug?: string;
  legal_status?: LegalStatus;
  expected_document_type?: DocumentType;
}

export interface PixQrCodeState {
  qrCodeUrl: string | null;
  copiaECola: string | null;
  isGenerating: boolean;
  timer: number;
}

export interface DocumentValidation {
  isValid: boolean;
  documentType: DocumentType;
  customerType: CustomerType;
  displayName: string;
  expectedLength: number;
  typeName: string;
}
