/**
 * Testes para PixPaymentServiceModular
 */

import { PixPaymentServiceModular } from '../PixPaymentServiceModular';
import { PixCustomerData, PixOrderSummary } from '../interfaces/PixTypes';

// Mock dos módulos externos
jest.mock('../../../../../lib/supabase');
jest.mock('../../../../../services/db-services/marketplace-services/payment/PaymentService');

describe('PixPaymentServiceModular', () => {
  let pixService: PixPaymentServiceModular;

  beforeEach(() => {
    pixService = PixPaymentServiceModular.getInstance();
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance (Singleton)', () => {
      const instance1 = PixPaymentServiceModular.getInstance();
      const instance2 = PixPaymentServiceModular.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateQrCode', () => {
    const mockCustomerData: PixCustomerData = {
      name: 'João Silva',
      email: 'joao@example.com',
      document: '12345678901',
      legal_status: 'individual',
      phone: '11999999999',
      address: {
        street: 'Rua Teste',
        streetNumber: '123',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234567',
        country: 'BR'
      }
    };

    const mockOrderSummary: PixOrderSummary = {
      totalProductPrice: 100.00,
      totalContentPrice: 50.00,
      totalFinalPrice: 150.00,
      discountValue: 0,
      appliedCouponId: null
    };

    it('should generate QR Code successfully', async () => {
      // Mock da resposta da API
      const mockResponse = {
        qr_code: 'mock-qr-code-url',
        qr_code_url: 'https://example.com/qr',
        success: true
      };

      // Mock da função sendToPagarMe
      jest.spyOn(pixService as any, 'sendToPagarMe').mockResolvedValue(mockResponse);

      const result = await pixService.generateQrCode(
        mockCustomerData,
        mockOrderSummary,
        'order123'
      );

      expect(result).toEqual(mockResponse);
      expect(result.success).toBe(true);
    });

    it('should handle validation errors', async () => {
      const invalidCustomerData = {
        ...mockCustomerData,
        email: 'invalid-email' // Email inválido
      };

      await expect(
        pixService.generateQrCode(invalidCustomerData, mockOrderSummary, 'order123')
      ).rejects.toThrow('Dados do cliente inválidos');
    });

    it('should handle empty customer data', async () => {
      const emptyCustomerData = {} as PixCustomerData;

      await expect(
        pixService.generateQrCode(emptyCustomerData, mockOrderSummary, 'order123')
      ).rejects.toThrow();
    });

    it('should handle zero total amount', async () => {
      const zeroOrderSummary: PixOrderSummary = {
        totalProductPrice: 0,
        totalContentPrice: 0,
        totalFinalPrice: 0,
        discountValue: 0,
        appliedCouponId: null
      };

      await expect(
        pixService.generateQrCode(mockCustomerData, zeroOrderSummary, 'order123')
      ).rejects.toThrow('Valor total deve ser maior que zero');
    });
  });

  describe('prepareOrderItems', () => {
    it('should prepare order items correctly', () => {
      const orderSummary: PixOrderSummary = {
        totalProductPrice: 100.00,
        totalContentPrice: 50.00,
        totalFinalPrice: 150.00,
        discountValue: 0,
        appliedCouponId: null
      };

      // Acessar método privado via TypeScript assertion
      const items = (pixService as any).prepareOrderItems(orderSummary);

      expect(items).toHaveLength(2);
      expect(items[0]).toEqual({
        amount: 10000, // R$ 100,00 em centavos
        description: 'Produtos do Marketplace',
        quantity: 1,
        code: 'MARKETPLACE_PRODUCTS'
      });
      expect(items[1]).toEqual({
        amount: 5000, // R$ 50,00 em centavos
        description: 'Pacotes de Conteúdo',
        quantity: 1,
        code: 'CONTENT_PACKAGES'
      });
    });

    it('should handle zero values correctly', () => {
      const orderSummary: PixOrderSummary = {
        totalProductPrice: 0,
        totalContentPrice: 100.00,
        totalFinalPrice: 100.00,
        discountValue: 0,
        appliedCouponId: null
      };

      const items = (pixService as any).prepareOrderItems(orderSummary);

      expect(items).toHaveLength(1);
      expect(items[0].description).toBe('Pacotes de Conteúdo');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const mockCustomerData: PixCustomerData = {
        name: 'João Silva',
        email: 'joao@example.com',
        document: '12345678901',
        legal_status: 'individual',
        phone: '11999999999',
        address: {
          street: 'Rua Teste',
          streetNumber: '123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234567',
          country: 'BR'
        }
      };

      const mockOrderSummary: PixOrderSummary = {
        totalProductPrice: 100.00,
        totalContentPrice: 50.00,
        totalFinalPrice: 150.00,
        discountValue: 0,
        appliedCouponId: null
      };

      // Mock erro da API
      jest.spyOn(pixService as any, 'sendToPagarMe').mockRejectedValue(
        new Error('API Error')
      );

      await expect(
        pixService.generateQrCode(mockCustomerData, mockOrderSummary, 'order123')
      ).rejects.toThrow('API Error');
    });
  });
});
