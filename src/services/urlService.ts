/**
 * Serviço centralizado para geração de URLs
 * Princípio DRY: Evita duplicação de lógica de URLs
 * Princípio SRP: Responsabilidade única de gerar URLs
 */

export class UrlService {
  /**
   * Gera URL para order item
   */
  static getOrderItemUrl(orderItemId: string): string {
    return `/order-item/${orderItemId}`;
  }

  /**
   * Gera URL para order
   */
  static getOrderUrl(orderId: string): string {
    return `/order/${orderId}`;
  }

  /**
   * Gera URL para user profile
   */
  static getUserProfileUrl(userId: string): string {
    return `/profile/${userId}`;
  }
}
