/**
 * Índice principal do sistema de tratamento de erros do PagarMe
 * Responsabilidade: Exportar todas as funcionalidades de tratamento de erro
 */

// Tipos
export type {
  PagarmeErrorResponse,
  PagarmeGatewayResponse,
  PagarmeValidationError,
  PagarmeCardError,
  PagarmeSystemError,
  ErrorContext,
  PagarmeErrorType,
  ProcessedError
} from './types/PagarmeErrorTypes';

// Tradutor principal
export {
  translatePagarmeError,
  sanitizePagarmeError,
  getPagarmeErrorType
} from './PagarmeErrorTranslator';

// Processador central
export {
  PagarmeErrorProcessor,
  usePagarmeErrorProcessor
} from './PagarmeErrorProcessor';

// Logger
export {
  PagarmeErrorLogger,
  usePagarmeErrorLogger
} from './utils/PagarmeErrorLogger';

// Hook personalizado
export {
  usePagarmeErrorHandler
} from './hooks/usePagarmeErrorHandler';

// Componente de exibição
export {
  PagarmeErrorDisplay
} from './components/PagarmeErrorDisplay';

// Função principal simplificada para uso direto
export function handlePagarmeError(error: any): string {
  const { sanitizePagarmeError } = require('./PagarmeErrorTranslator');
  return sanitizePagarmeError(error);
}
