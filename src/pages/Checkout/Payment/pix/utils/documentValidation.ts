/**
 * Utilitários para validação de documentos no PIX
 */

import { LegalStatus, DocumentType, CustomerType, DocumentValidation } from '../types/PixTypes';

/**
 * Valida e determina o tipo de documento baseado no legal_status
 */
export function validateDocument(
  document: string,
  legal_status: LegalStatus,
  company_name?: string,
  customer_name?: string
): DocumentValidation {
  const cleanDocument = document.replace(/\D/g, '');
  const isBusinessCustomer = legal_status === 'business';
  
  const documentType: DocumentType = isBusinessCustomer ? 'cnpj' : 'cpf';
  const customerType: CustomerType = isBusinessCustomer ? 'company' : 'individual';
  const expectedLength = isBusinessCustomer ? 14 : 11;
  const typeName = isBusinessCustomer ? 'CNPJ' : 'CPF';
  const displayName = isBusinessCustomer && company_name ? company_name : customer_name || '';
  
  const isValid = cleanDocument.length === expectedLength;
  
  return {
    isValid,
    documentType,
    customerType,
    displayName,
    expectedLength,
    typeName
  };
}

/**
 * Cria uma mensagem de erro personalizada para validação de documento
 */
export function createDocumentValidationError(
  document: string,
  validation: DocumentValidation,
  legal_status: LegalStatus
): string {
  const cleanDocument = document.replace(/\D/g, '');
  
  return `${validation.typeName} inválido. ${validation.typeName} deve ter ${validation.expectedLength} dígitos. ` +
         `Recebido: ${document} -> ${cleanDocument} (${cleanDocument.length} dígitos). ` +
         `Legal status: ${legal_status}`;
}

/**
 * Log detalhado da validação do documento
 */
export function logDocumentValidation(
  document: string,
  legal_status: LegalStatus,
  validation: DocumentValidation
): void {
  console.log('[DEBUG PIX] ===== VALIDAÇÃO DE DOCUMENTO =====');
  console.log('[DEBUG PIX] Documento original:', document);
  console.log('[DEBUG PIX] Documento limpo:', document.replace(/\D/g, ''));
  console.log('[DEBUG PIX] Legal status:', legal_status);
  console.log('[DEBUG PIX] Tipo esperado:', validation.documentType);
  console.log('[DEBUG PIX] Tipo de cliente:', validation.customerType);
  console.log('[DEBUG PIX] Nome de exibição:', validation.displayName);
  console.log('[DEBUG PIX] Comprimento esperado:', validation.expectedLength);
  console.log('[DEBUG PIX] Comprimento atual:', document.replace(/\D/g, '').length);
  console.log('[DEBUG PIX] Válido:', validation.isValid);
  console.log('[DEBUG PIX] ==========================================');
}
