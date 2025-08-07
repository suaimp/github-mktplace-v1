/**
 * Processador central de erros do PagarMe
 * Responsabilidade: Processar, traduzir e categorizar erros do PagarMe de forma centralizada
 */

import { 
  translatePagarmeError, 
  getPagarmeErrorType
} from './PagarmeErrorTranslator';
import { 
  ProcessedError, 
  PagarmeErrorType 
} from './types/PagarmeErrorTypes';
import { usePagarmeErrorLogger } from './utils/PagarmeErrorLogger';

/**
 * Configurações do processador de erros
 */
export interface ErrorProcessorConfig {
  enableLogging: boolean;
  enableRetryLogic: boolean;
  maxRetryAttempts: number;
  retryDelayMs: number;
}

const DEFAULT_CONFIG: ErrorProcessorConfig = {
  enableLogging: true,
  enableRetryLogic: true,
  maxRetryAttempts: 3,
  retryDelayMs: 2000
};

/**
 * Processador central de erros do PagarMe
 */
export class PagarmeErrorProcessor {
  private static instance: PagarmeErrorProcessor;
  private config: ErrorProcessorConfig;

  private constructor(config: Partial<ErrorProcessorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public static getInstance(config?: Partial<ErrorProcessorConfig>): PagarmeErrorProcessor {
    if (!PagarmeErrorProcessor.instance) {
      PagarmeErrorProcessor.instance = new PagarmeErrorProcessor(config);
    }
    return PagarmeErrorProcessor.instance;
  }

  /**
   * Processa erro do PagarMe e retorna erro estruturado
   */
  public processError(
    error: any,
    component: string = 'unknown',
    action: string = 'payment'
  ): ProcessedError {
    const translatedError = translatePagarmeError(error);
    const errorType = getPagarmeErrorType(error);

    const processedError: ProcessedError = {
      message: translatedError.message,
      type: errorType,
      isUserFriendly: true,
      originalMessage: translatedError.originalMessage,
      shouldRetry: this.shouldRetry(errorType),
      actionRequired: this.getActionRequired(errorType, error)
    };

    // Log do erro se habilitado
    if (this.config.enableLogging) {
      const { logError } = usePagarmeErrorLogger();
      logError(processedError, component, action);
    }

    return processedError;
  }

  /**
   * Processa múltiplos erros
   */
  public processMultipleErrors(
    errors: any[],
    component: string = 'unknown',
    action: string = 'payment'
  ): ProcessedError[] {
    return errors.map(error => this.processError(error, component, action));
  }

  /**
   * Obtém sugestão de ação baseada no tipo de erro
   */
  public getErrorSuggestion(error: ProcessedError): string {
    const suggestions: Record<PagarmeErrorType, Record<string, string>> = {
      validation: {
        default: 'Verifique se todos os campos obrigatórios estão preenchidos corretamente.'
      },
      card: {
        card_declined: 'Tente usar outro cartão ou entre em contato com seu banco.',
        insufficient_funds: 'Verifique o saldo disponível ou use outro cartão.',
        expired_card: 'Use um cartão válido com data de validade atual.',
        incorrect_cvc: 'Verifique o código de segurança no verso do cartão.',
        incorrect_number: 'Confirme se o número do cartão foi digitado corretamente.',
        default: 'Verifique os dados do cartão ou tente com outro cartão.'
      },
      system: {
        processing_error: 'Aguarde alguns minutos e tente novamente.',
        issuer_unavailable: 'O banco emissor está temporariamente indisponível.',
        default: 'Tente novamente em alguns minutos ou entre em contato com o suporte.'
      },
      unknown: {
        default: 'Entre em contato com o suporte técnico informando o código do erro.'
      }
    };

    const typeSuggestions = suggestions[error.type];
    return typeSuggestions[error.actionRequired || 'default'] || typeSuggestions.default;
  }

  /**
   * Verifica se o erro permite retry
   */
  private shouldRetry(errorType: PagarmeErrorType): boolean {
    if (!this.config.enableRetryLogic) return false;
    
    // Apenas erros de sistema permitem retry automático
    return errorType === 'system';
  }

  /**
   * Determina ação requerida baseada no erro
   */
  private getActionRequired(
    errorType: PagarmeErrorType, 
    originalError: any
  ): ProcessedError['actionRequired'] {
    const errorMessage = (originalError?.message || '').toLowerCase();

    switch (errorType) {
      case 'validation':
        return 'check_card_data';
        
      case 'card':
        if (errorMessage.includes('declined') || errorMessage.includes('insufficient')) {
          return 'try_different_card';
        }
        return 'check_card_data';
        
      case 'system':
        if (errorMessage.includes('timeout') || errorMessage.includes('unavailable')) {
          return 'try_again_later';
        }
        return 'contact_support';
        
      case 'unknown':
      default:
        return 'contact_support';
    }
  }

  /**
   * Formata erro para exibição na UI
   */
  public formatErrorForUI(error: ProcessedError): {
    title: string;
    message: string;
    suggestion: string;
    type: 'error' | 'warning' | 'info';
    showRetryButton: boolean;
  } {
    const suggestion = this.getErrorSuggestion(error);
    
    const titleMap: Record<PagarmeErrorType, string> = {
      validation: 'Dados incompletos',
      card: 'Problema com o cartão',
      system: 'Erro temporário',
      unknown: 'Erro inesperado'
    };

    const typeMap: Record<PagarmeErrorType, 'error' | 'warning' | 'info'> = {
      validation: 'warning',
      card: 'error',
      system: 'info',
      unknown: 'error'
    };

    return {
      title: titleMap[error.type],
      message: error.message,
      suggestion,
      type: typeMap[error.type],
      showRetryButton: error.shouldRetry
    };
  }
}

/**
 * Hook para facilitar o uso do processador
 */
export function usePagarmeErrorProcessor(config?: Partial<ErrorProcessorConfig>) {
  const processor = PagarmeErrorProcessor.getInstance(config);

  const processError = (error: any, component?: string, action?: string) => 
    processor.processError(error, component, action);

  const processMultipleErrors = (errors: any[], component?: string, action?: string) =>
    processor.processMultipleErrors(errors, component, action);

  const formatErrorForUI = (error: ProcessedError) =>
    processor.formatErrorForUI(error);

  const getErrorSuggestion = (error: ProcessedError) =>
    processor.getErrorSuggestion(error);

  return {
    processError,
    processMultipleErrors,
    formatErrorForUI,
    getErrorSuggestion
  };
}
