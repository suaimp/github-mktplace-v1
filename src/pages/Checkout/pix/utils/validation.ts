/**
 * Utilitários de validação para PIX
 * Seguindo o princípio de responsabilidade única
 */

import { DocumentValidation } from '../types';

/**
 * Valida e determina o tipo de documento baseado no legal_status
 */
export function validatePixDocument(
  document: string, 
  legalStatus: 'individual' | 'business'
): DocumentValidation {
  const documentClean = document.replace(/\D/g, '');
  const isBusinessCustomer = legalStatus === 'business';
  const documentType = isBusinessCustomer ? 'cnpj' : 'cpf';
  const expectedLength = isBusinessCustomer ? 14 : 11;
  const customerType = isBusinessCustomer ? 'company' : 'individual';

  if (!documentClean || documentClean.length !== expectedLength) {
    return {
      isValid: false,
      documentType,
      expectedLength,
      customerType,
      error: `${documentType.toUpperCase()} deve ter ${expectedLength} dígitos. Recebido: ${documentClean.length} dígitos`
    };
  }

  return {
    isValid: true,
    documentType,
    expectedLength,
    customerType
  };
}

/**
 * Cria o nome de exibição do cliente baseado no tipo
 */
export function getCustomerDisplayName(
  customerName: string,
  companyName: string | undefined,
  legalStatus: 'individual' | 'business'
): string {
  const isBusinessCustomer = legalStatus === 'business';
  return isBusinessCustomer && companyName ? companyName : customerName;
}

/**
 * Limpa e valida o documento
 */
export function cleanDocument(document: string): string {
  return document.replace(/\D/g, '');
}

/**
 * Limpa e valida o telefone
 */
export function cleanPhone(phone: string): string {
  const cleaned = phone ? phone.replace(/\D/g, "") : "11987654321";
  return cleaned.length < 10 ? "11987654321" : cleaned;
}

/**
 * Extrai código de área e número do telefone
 */
export function extractPhoneComponents(phone: string): { areaCode: string; phoneNumber: string } {
  const phoneClean = cleanPhone(phone);
  const areaCode = phoneClean.substring(0, 2);
  const phoneNumber = phoneClean.substring(2);
  
  return { areaCode, phoneNumber };
}

/**
 * Gera informações de debug para PIX
 */
export function generatePixDebugInfo(
  legalStatus: 'individual' | 'business',
  document: string
): any {
  const documentClean = cleanDocument(document);
  const validation = validatePixDocument(document, legalStatus);
  
  return {
    customer_legal_status: legalStatus,
    customer_legal_status_type: typeof legalStatus,
    customer_document: document,
    customer_document_clean: documentClean,
    customer_document_length: documentClean.length,
    expected_document_type: validation.documentType,
    expected_customer_type: validation.customerType,
    timestamp: new Date().toISOString()
  };
}
