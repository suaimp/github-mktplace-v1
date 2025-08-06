/**
 * Utilitários de validação para PIX
 * Responsabilidade: Funções de validação e formatação específicas do PIX
 */

import { DocumentValidation, PixCustomerData } from '../interfaces/PixTypes';

/**
 * Valida documento baseado no tipo de pessoa
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
 * Limpa e valida telefone
 */
export function cleanPhone(phone: string): string {
  const cleaned = phone ? phone.replace(/\D/g, "") : "11987654321";
  return cleaned.length < 10 ? "11987654321" : cleaned;
}

/**
 * Limpa documento removendo caracteres especiais
 */
export function cleanDocument(document: string): string {
  return document.replace(/\D/g, '');
}

/**
 * Valida dados do cliente para PIX
 */
export function validatePixCustomerData(customerData: PixCustomerData): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!customerData.name?.trim()) {
    errors.push("Nome é obrigatório");
  }

  if (!customerData.email?.trim()) {
    errors.push("Email é obrigatório");
  }

  if (!customerData.document?.trim()) {
    errors.push("Documento é obrigatório");
  }

  if (!customerData.phone?.trim()) {
    errors.push("Telefone é obrigatório");
  }

  if (!customerData.legal_status) {
    errors.push("Tipo de pessoa é obrigatório");
  }

  // Validar documento
  if (customerData.document) {
    const docValidation = validatePixDocument(customerData.document, customerData.legal_status);
    if (!docValidation.isValid) {
      errors.push(docValidation.error || "Documento inválido");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Converte valor de reais para centavos
 */
export function convertToCents(valueInReais: number): number {
  return Math.round(valueInReais * 100);
}

/**
 * Converte valor de centavos para reais
 */
export function convertToReais(valueInCents: number): number {
  return valueInCents / 100;
}

/**
 * Gera informações de debug para PIX
 */
export function generatePixDebugInfo(
  legalStatus: 'individual' | 'business',
  document: string
): object {
  const validation = validatePixDocument(document, legalStatus);
  
  return {
    customer_legal_status: legalStatus,
    customer_document: document,
    customer_document_clean: cleanDocument(document),
    customer_document_length: cleanDocument(document).length,
    expected_document_type: validation.documentType,
    expected_customer_type: validation.customerType,
    validation_passed: validation.isValid,
    validation_error: validation.error || null,
    timestamp: new Date().toISOString()
  };
}
