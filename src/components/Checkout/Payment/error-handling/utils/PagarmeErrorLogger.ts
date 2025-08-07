/**
 * Utilitário para logging de erros do PagarMe
 * Responsabilidade: Registrar e categorizar erros para análise e debugging
 */

import { ErrorContext, ProcessedError, PagarmeErrorType } from '../types/PagarmeErrorTypes';

export interface ErrorLog {
  id: string;
  timestamp: string;
  error: ProcessedError;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Logger de erros do PagarMe
 */
export class PagarmeErrorLogger {
  private static instance: PagarmeErrorLogger;
  private logs: ErrorLog[] = [];

  public static getInstance(): PagarmeErrorLogger {
    if (!PagarmeErrorLogger.instance) {
      PagarmeErrorLogger.instance = new PagarmeErrorLogger();
    }
    return PagarmeErrorLogger.instance;
  }

  /**
   * Registra um erro
   */
  public logError(
    error: ProcessedError,
    context: ErrorContext
  ): void {
    const errorLog: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      error,
      context,
      severity: this.determineSeverity(error)
    };

    this.logs.push(errorLog);

    // Manter apenas os últimos 100 logs para evitar vazamento de memória
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    // Log no console em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(errorLog);
    }

    // Em produção, enviar para serviço de logging (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(errorLog);
    }
  }

  /**
   * Obtém estatísticas de erros
   */
  public getErrorStats(): {
    total: number;
    byType: Record<PagarmeErrorType, number>;
    bySeverity: Record<string, number>;
    recentErrors: ErrorLog[];
  } {
    const byType: Record<PagarmeErrorType, number> = {
      validation: 0,
      card: 0,
      system: 0,
      unknown: 0
    };

    const bySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    this.logs.forEach(log => {
      byType[log.error.type]++;
      bySeverity[log.severity]++;
    });

    return {
      total: this.logs.length,
      byType,
      bySeverity,
      recentErrors: this.logs.slice(-10)
    };
  }

  /**
   * Limpa logs antigos
   */
  public clearOldLogs(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffTime);
  }

  /**
   * Gera ID único para o log
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Determina severidade do erro
   */
  private determineSeverity(error: ProcessedError): 'low' | 'medium' | 'high' | 'critical' {
    switch (error.type) {
      case 'validation':
        return 'low';
      case 'card':
        return 'medium';
      case 'system':
        return 'high';
      case 'unknown':
        return 'critical';
      default:
        return 'medium';
    }
  }

  /**
   * Log no console para desenvolvimento
   */
  private logToConsole(errorLog: ErrorLog): void {
    const emoji = {
      low: '🟡',
      medium: '🟠',
      high: '🔴',
      critical: '🚨'
    };

    console.group(`${emoji[errorLog.severity]} Erro PagarMe [${errorLog.severity.toUpperCase()}]`);
    console.log('ID:', errorLog.id);
    console.log('Timestamp:', errorLog.timestamp);
    console.log('Tipo:', errorLog.error.type);
    console.log('Mensagem:', errorLog.error.message);
    console.log('Componente:', errorLog.context.component);
    console.log('Ação:', errorLog.context.action);
    
    if (errorLog.error.originalMessage) {
      console.log('Mensagem original:', errorLog.error.originalMessage);
    }
    
    if (errorLog.error.actionRequired) {
      console.log('Ação requerida:', errorLog.error.actionRequired);
    }
    
    console.groupEnd();
  }

  /**
   * Envia para serviço de logging em produção
   */
  private sendToLoggingService(errorLog: ErrorLog): void {
    // Implementar integração com Sentry, LogRocket ou outro serviço
    // Por enquanto, apenas log no console
    console.error('PagarMe Error:', {
      id: errorLog.id,
      message: errorLog.error.message,
      type: errorLog.error.type,
      severity: errorLog.severity,
      component: errorLog.context.component,
      action: errorLog.context.action
    });
  }
}

/**
 * Hook para facilitar o uso do logger
 */
export function usePagarmeErrorLogger() {
  const logger = PagarmeErrorLogger.getInstance();

  const logError = (
    error: ProcessedError,
    component: string,
    action: string,
    additionalContext?: Partial<ErrorContext>
  ) => {
    const context: ErrorContext = {
      component,
      action,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      originalError: error.originalMessage || error,
      ...additionalContext
    };

    logger.logError(error, context);
  };

  const getStats = () => logger.getErrorStats();
  const clearOldLogs = (hours?: number) => logger.clearOldLogs(hours);

  return {
    logError,
    getStats,
    clearOldLogs
  };
}
