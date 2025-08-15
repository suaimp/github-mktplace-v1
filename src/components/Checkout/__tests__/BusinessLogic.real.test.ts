/**
 * TESTES REAIS - Validação da Lógica de Negócio
 * Testa as funções REAIS do sistema, não mocks
 */

import { calculateTotal } from '../utils/calculateTotal';
import { calculateDiscount } from '../../../services/db-services/coupons/couponService';
import { Coupon } from '../../../pages/Coupons/types';

// Mock COMPLETO do Supabase (incluindo todos os métodos necessários)
jest.mock('../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123' } },
        error: null
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null }),
      // Cadeia para INSERT
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ 
            data: { 
              id: 1,
              total_final_price: 100 
            }, 
            error: null 
          })
        })
      }),
      // Cadeia para UPDATE
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ 
              data: { 
                id: 1,
                total_final_price: 100 
              }, 
              error: null 
            })
          })
        })
      })
    }),
    rpc: jest.fn().mockResolvedValue({ data: null, error: null })
  }
}));

describe('🧮 TESTES REAIS - Lógica de Cálculos', () => {
  
  describe('calculateTotal - Função Real de Cálculo', () => {
    it('should calculate correct total: product + content - discount', async () => {
      // ✅ TESTE REAL: Dados reais de entrada
      const totalFinalArray = [100, 50]; // R$ 150 total
      const totalProductArray = [100];   // R$ 100 produto
      const totalContentArray = [50];    // R$ 50 conteúdo
      const discountValue = 20;          // R$ 20 desconto

      const result = await calculateTotal(
        totalFinalArray,
        totalProductArray,
        totalContentArray,
        [],
        discountValue
      );

      // ✅ VALIDAÇÃO REAL: 100 + 50 - 20 = 130
      expect(result).toBe(130);
    });

    it('should handle edge case: discount larger than total', async () => {
      // ✅ TESTE REAL: Cenário extremo
      const totalFinalArray = [100];
      const discountValue = 150; // Desconto maior que total

      const result = await calculateTotal(
        totalFinalArray,
        [100],
        [],
        [],
        discountValue
      );

      // ✅ VALIDAÇÃO REAL: Nunca deve ser negativo
      expect(result).toBe(0);
    });

    it('should calculate with multiple items correctly', async () => {
      // ✅ TESTE REAL: Múltiplos itens
      const totalFinalArray = [50, 75, 25]; // R$ 150 total
      const totalProductArray = [50, 75, 25];
      const discountValue = 15; // 10% desconto

      const result = await calculateTotal(
        totalFinalArray,
        totalProductArray,
        [],
        [],
        discountValue
      );

      // ✅ VALIDAÇÃO REAL: 150 - 15 = 135
      expect(result).toBe(135);
    });

    it('should handle empty arrays gracefully', async () => {
      // ✅ TESTE REAL: Arrays vazios
      const result = await calculateTotal([], [], [], [], 0);

      // ✅ VALIDAÇÃO REAL: Deve retornar 0
      expect(result).toBe(0);
    });
  });

  describe('calculateDiscount - Função Real de Cupons', () => {
    it('should calculate percentage discount correctly', () => {
      // ✅ TESTE REAL: Cupom de porcentagem
      const coupon: Coupon = {
        id: '1',
        code: 'SAVE20',
        name: '20% Off',
        discount_type: 'percentage',
        discount_value: 20, // 20%
        is_active: true,
        individual_use_only: false,
        exclude_sale_items: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };

      const orderAmount = 100; // R$ 100

      const discount = calculateDiscount(coupon, orderAmount);

      // ✅ VALIDAÇÃO REAL: 20% de R$ 100 = R$ 20
      expect(discount).toBe(20);
    });

    it('should calculate cart fixed discount correctly', () => {
      // ✅ TESTE REAL: Cupom fixo
      const coupon: Coupon = {
        id: '2',
        code: 'SAVE15',
        name: 'R$ 15 Off',
        discount_type: 'cart_fixed',
        discount_value: 15, // R$ 15 fixo
        is_active: true,
        individual_use_only: false,
        exclude_sale_items: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };

      const orderAmount = 100;

      const discount = calculateDiscount(coupon, orderAmount);

      // ✅ VALIDAÇÃO REAL: Desconto fixo de R$ 15
      expect(discount).toBe(15);
    });

    it('should respect maximum discount limit', () => {
      // ✅ TESTE REAL: Limite máximo de desconto
      const coupon: Coupon = {
        id: '3',
        code: 'SAVE50',
        name: '50% Off',
        discount_type: 'percentage',
        discount_value: 50, // 50%
        maximum_discount: 30, // Máximo R$ 30
        is_active: true,
        individual_use_only: false,
        exclude_sale_items: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };

      const orderAmount = 100; // 50% seria R$ 50, mas limite é R$ 30

      const discount = calculateDiscount(coupon, orderAmount);

      // ✅ VALIDAÇÃO REAL: Deve respeitar o limite de R$ 30
      expect(discount).toBe(30);
    });

    it('should not exceed order amount for cart fixed discount', () => {
      // ✅ TESTE REAL: Desconto fixo maior que pedido
      const coupon: Coupon = {
        id: '4',
        code: 'SAVE100',
        name: 'R$ 100 Off',
        discount_type: 'cart_fixed',
        discount_value: 100, // R$ 100 fixo
        is_active: true,
        individual_use_only: false,
        exclude_sale_items: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };

      const orderAmount = 50; // Pedido menor que desconto

      const discount = calculateDiscount(coupon, orderAmount);

      // ✅ VALIDAÇÃO REAL: Não pode descontar mais que o valor do pedido
      expect(discount).toBe(50);
    });
  });

  describe('🎯 TESTES INTEGRADOS - Fluxo Completo', () => {
    it('should calculate complete order with coupon correctly', async () => {
      // ✅ TESTE REAL: Fluxo completo produto + conteúdo + cupom
      
      // 1. Dados do pedido
      const totalFinalArray = [200, 100]; // R$ 300 total
      const totalProductArray = [200, 100]; // R$ 300 produtos
      const totalContentArray = [50, 25];   // R$ 75 conteúdo
      
      // 2. Cupom de 15%
      const coupon: Coupon = {
        id: '5',
        code: 'COMBO15',
        name: '15% Off',
        discount_type: 'percentage',
        discount_value: 15,
        is_active: true,
        individual_use_only: false,
        exclude_sale_items: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };

      // 3. Calcular desconto do cupom
      const totalBeforeDiscount = 300; // Total dos produtos
      const discountAmount = calculateDiscount(coupon, totalBeforeDiscount);
      
      // 4. Calcular total final
      const finalTotal = await calculateTotal(
        totalFinalArray,
        totalProductArray,
        totalContentArray,
        [],
        discountAmount,
        coupon.id
      );

      // ✅ VALIDAÇÕES REAIS:
      expect(discountAmount).toBe(45); // 15% de R$ 300 = R$ 45
      expect(finalTotal).toBe(255);    // R$ 300 - R$ 45 = R$ 255
    });

    it('should handle complex business rules correctly', async () => {
      // ✅ TESTE REAL: Regras de negócio complexas
      
      // Cenário: Cliente com cupom VIP (30% limitado a R$ 50)
      const orderItems = [150, 80, 70]; // R$ 300 total
      
      const vipCoupon: Coupon = {
        id: '6',
        code: 'VIP30',
        name: 'VIP 30%',
        discount_type: 'percentage',
        discount_value: 30,
        maximum_discount: 50, // Limitado a R$ 50
        minimum_amount: 100, // Pedido mínimo R$ 100
        is_active: true,
        individual_use_only: false,
        exclude_sale_items: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };

      const discount = calculateDiscount(vipCoupon, 300);
      const total = await calculateTotal(orderItems, orderItems, [], [], discount);

      // ✅ VALIDAÇÕES REAIS:
      expect(discount).toBe(50);  // 30% seria R$ 90, mas limitado a R$ 50
      expect(total).toBe(250);    // R$ 300 - R$ 50 = R$ 250
    });
  });

  describe('💡 TESTES DE CASOS EXTREMOS', () => {
    it('should handle zero amounts correctly', async () => {
      const result = await calculateTotal([0], [0], [0], [], 0);
      expect(result).toBe(0);
    });

    it('should handle decimal values correctly', async () => {
      const result = await calculateTotal([99.99], [99.99], [], [], 9.99);
      expect(result).toBe(90); // Deve arredondar corretamente
    });

    it('should handle percentage discount edge cases', () => {
      const coupon: Coupon = {
        id: '7',
        code: 'TEST100',
        name: '100% Off',
        discount_type: 'percentage',
        discount_value: 100, // 100%
        is_active: true,
        individual_use_only: false,
        exclude_sale_items: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0
      };

      const discount = calculateDiscount(coupon, 50);
      expect(discount).toBe(50); // 100% de R$ 50 = R$ 50 (produto grátis)
    });
  });
});
