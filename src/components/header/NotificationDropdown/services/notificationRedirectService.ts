/**
 * Serviço para gerenciar redirecionamentos de notificações
 * Responsabilidade única: Determinar URLs de redirecionamento baseadas no tipo e dados da notificação
 */

export interface NotificationRedirectData {
  type: string;
  orderId?: string;
  subtitle?: string;
}

export class NotificationRedirectService {
  /**
   * Determina a URL de redirecionamento baseada nos dados da notificação
   * Princípio SRP: Única responsabilidade de gerar URLs de redirecionamento
   */
  static generateRedirectUrl(data: NotificationRedirectData): string | undefined {
    // Prioridade 1: Se há order_id, usar diretamente
    if (data.orderId) {
      return `/orders/${data.orderId}`;
    }

    // Prioridade 2: Extrair do subtitle para compatibilidade com dados antigos
    if (data.type === 'chat' && data.subtitle) {
      // Extrair ID do formato "Pedido: abc123-def456" ou "Pedido #abc123" ou similar
      const orderIdMatch = data.subtitle.match(/([a-f0-9-]{8,})/i);
      if (orderIdMatch) {
        return `/orders/${orderIdMatch[1]}`;
      }
    }

    // Prioridade 3: Redirecionamentos específicos por tipo
    switch (data.type) {
      case 'chat':
        return '/orders'; // Lista de pedidos se não há ID específico
      case 'purchase':
        return '/orders';
      case 'system':
        return '/dashboard';
      default:
        return undefined; // Sem redirecionamento para tipos desconhecidos
    }
  }

  /**
   * Verifica se uma notificação deve ter redirecionamento
   */
  static shouldRedirect(data: NotificationRedirectData): boolean {
    return Boolean(data.orderId || (data.type === 'chat' && data.subtitle));
  }

  /**
   * Gera URL de redirecionamento com fallback seguro
   */
  static getRedirectUrlWithFallback(data: NotificationRedirectData, fallback = '/dashboard'): string {
    return this.generateRedirectUrl(data) || fallback;
  }
}
