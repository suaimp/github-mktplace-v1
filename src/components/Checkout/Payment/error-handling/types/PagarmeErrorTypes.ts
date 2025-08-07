/**
 * Interfaces para tipos de erro do PagarMe
 * Responsabilidade: Definir tipos TypeScript para erros do PagarMe
 */

export interface PagarmeErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  gateway_response?: PagarmeGatewayResponse;
  status?: number;
}

export interface PagarmeGatewayResponse {
  code: string;
  errors: Array<{
    message: string;
    type?: string;
  }>;
}

export interface PagarmeValidationError {
  field: string;
  messages: string[];
  translatedMessage: string;
}

export interface PagarmeCardError {
  type: 'card_declined' | 'insufficient_funds' | 'expired_card' | 'incorrect_cvc' | 'incorrect_number' | 'invalid_expiry_date';
  message: string;
  translatedMessage: string;
}

export interface PagarmeSystemError {
  type: 'processing_error' | 'issuer_unavailable' | 'network_error' | 'internal_error';
  message: string;
  translatedMessage: string;
}

export interface ErrorContext {
  component: string;
  action: string;
  timestamp: string;
  userAgent?: string;
  originalError: any;
}

export type PagarmeErrorType = 'validation' | 'card' | 'system' | 'unknown';

export interface ProcessedError {
  message: string;
  type: PagarmeErrorType;
  isUserFriendly: boolean;
  originalMessage?: string;
  context?: ErrorContext;
  shouldRetry: boolean;
  actionRequired?: 'check_card_data' | 'try_different_card' | 'contact_support' | 'try_again_later';
}
