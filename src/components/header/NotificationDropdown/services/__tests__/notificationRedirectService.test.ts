/**
 * Testes para o NotificationRedirectService
 * Responsabilidade única: Validar a lógica de geração de URLs de redirecionamento
 */

import { NotificationRedirectService } from '../notificationRedirectService';

describe('NotificationRedirectService', () => {
  describe('generateRedirectUrl', () => {
    it('deve usar order_id quando disponível', () => {
      const data = {
        type: 'chat',
        orderId: 'abc123-def456',
        subtitle: 'Pedido: xyz789'
      };

      const result = NotificationRedirectService.generateRedirectUrl(data);
      expect(result).toBe('/orders/abc123-def456');
    });

    it('deve extrair ID do subtitle quando order_id não está disponível', () => {
      const data = {
        type: 'chat',
        subtitle: 'Pedido: abc123-def456'
      };

      const result = NotificationRedirectService.generateRedirectUrl(data);
      expect(result).toBe('/orders/abc123-def456');
    });

    it('deve retornar URL genérica por tipo quando não há IDs específicos', () => {
      const chatData = { type: 'chat' };
      expect(NotificationRedirectService.generateRedirectUrl(chatData)).toBe('/orders');

      const purchaseData = { type: 'purchase' };
      expect(NotificationRedirectService.generateRedirectUrl(purchaseData)).toBe('/orders');

      const systemData = { type: 'system' };
      expect(NotificationRedirectService.generateRedirectUrl(systemData)).toBe('/dashboard');
    });

    it('deve retornar undefined para tipos desconhecidos', () => {
      const data = { type: 'unknown' };
      const result = NotificationRedirectService.generateRedirectUrl(data);
      expect(result).toBeUndefined();
    });
  });

  describe('shouldRedirect', () => {
    it('deve retornar true quando há order_id', () => {
      const data = { type: 'chat', orderId: 'abc123' };
      expect(NotificationRedirectService.shouldRedirect(data)).toBe(true);
    });

    it('deve retornar true para chat com subtitle', () => {
      const data = { type: 'chat', subtitle: 'Pedido: abc123' };
      expect(NotificationRedirectService.shouldRedirect(data)).toBe(true);
    });

    it('deve retornar false sem order_id nem subtitle adequado', () => {
      const data = { type: 'system' };
      expect(NotificationRedirectService.shouldRedirect(data)).toBe(false);
    });
  });

  describe('getRedirectUrlWithFallback', () => {
    it('deve retornar URL gerada quando possível', () => {
      const data = { type: 'chat', orderId: 'abc123' };
      const result = NotificationRedirectService.getRedirectUrlWithFallback(data);
      expect(result).toBe('/orders/abc123');
    });

    it('deve retornar fallback quando não consegue gerar URL', () => {
      const data = { type: 'unknown' };
      const result = NotificationRedirectService.getRedirectUrlWithFallback(data, '/fallback');
      expect(result).toBe('/fallback');
    });

    it('deve usar fallback padrão quando não especificado', () => {
      const data = { type: 'unknown' };
      const result = NotificationRedirectService.getRedirectUrlWithFallback(data);
      expect(result).toBe('/dashboard');
    });
  });
});
