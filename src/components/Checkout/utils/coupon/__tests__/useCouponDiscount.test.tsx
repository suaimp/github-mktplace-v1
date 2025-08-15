/**
 * Testes para useCouponDiscount hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useCouponDiscount } from '../useCouponDiscount';
import { supabase } from '../../../../../lib/supabase';

// Mock do Supabase
jest.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('useCouponDiscount', () => {
  const mockSupabaseFrom = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    single: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseFrom);
  });

  it('should return no discount when coupon code is empty', () => {
    const { result } = renderHook(() => useCouponDiscount('', 100));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.discountValue).toBe(0);
    expect(result.current.appliedCoupon).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should apply percentage discount correctly', async () => {
    const mockCoupon = {
      id: '1',
      code: 'SAVE20',
      name: '20% de desconto',
      discount_type: 'percentage',
      discount_value: 20,
      is_active: true,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      min_order_value: 0
    };

    mockSupabaseFrom.single.mockResolvedValue({
      data: mockCoupon,
      error: null
    });

    const { result } = renderHook(() => useCouponDiscount('SAVE20', 100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.discountValue).toBe(20); // 20% de 100
    expect(result.current.appliedCoupon).toEqual(mockCoupon);
    expect(result.current.error).toBeNull();
  });

  it('should apply fixed discount correctly', async () => {
    const mockCoupon = {
      id: '2',
      code: 'SAVE10',
      name: 'R$ 10 de desconto',
      discount_type: 'fixed',
      discount_value: 10,
      is_active: true,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      min_order_value: 0
    };

    mockSupabaseFrom.single.mockResolvedValue({
      data: mockCoupon,
      error: null
    });

    const { result } = renderHook(() => useCouponDiscount('SAVE10', 100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.discountValue).toBe(10); // R$ 10 fixo
    expect(result.current.appliedCoupon).toEqual(mockCoupon);
    expect(result.current.error).toBeNull();
  });

  it('should reject coupon when minimum order value not met', async () => {
    const mockCoupon = {
      id: '3',
      code: 'SAVE50',
      name: 'R$ 50 de desconto',
      discount_type: 'fixed',
      discount_value: 50,
      is_active: true,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      min_order_value: 200 // Valor mínimo maior que o total
    };

    mockSupabaseFrom.single.mockResolvedValue({
      data: mockCoupon,
      error: null
    });

    const { result } = renderHook(() => useCouponDiscount('SAVE50', 100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.discountValue).toBe(0);
    expect(result.current.appliedCoupon).toBeNull();
    expect(result.current.error).toContain('valor mínimo');
  });

  it('should reject inactive coupon', async () => {
    const mockCoupon = {
      id: '4',
      code: 'INACTIVE',
      name: 'Cupom inativo',
      discount_type: 'percentage',
      discount_value: 10,
      is_active: false, // Cupom inativo
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      min_order_value: 0
    };

    mockSupabaseFrom.single.mockResolvedValue({
      data: mockCoupon,
      error: null
    });

    const { result } = renderHook(() => useCouponDiscount('INACTIVE', 100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.discountValue).toBe(0);
    expect(result.current.appliedCoupon).toBeNull();
    expect(result.current.error).toContain('inativo');
  });

  it('should handle coupon not found', async () => {
    mockSupabaseFrom.single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' }
    });

    const { result } = renderHook(() => useCouponDiscount('NOTFOUND', 100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.discountValue).toBe(0);
    expect(result.current.appliedCoupon).toBeNull();
    expect(result.current.error).toContain('não encontrado');
  });

  it('should limit discount to total value', async () => {
    const mockCoupon = {
      id: '5',
      code: 'BIGSAVE',
      name: 'Grande desconto',
      discount_type: 'fixed',
      discount_value: 200, // Desconto maior que o total
      is_active: true,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      min_order_value: 0
    };

    mockSupabaseFrom.single.mockResolvedValue({
      data: mockCoupon,
      error: null
    });

    const { result } = renderHook(() => useCouponDiscount('BIGSAVE', 100));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Desconto limitado ao valor total
    expect(result.current.discountValue).toBe(100);
    expect(result.current.appliedCoupon).toEqual(mockCoupon);
  });

  it('should handle percentage discount correctly', async () => {
    const mockCoupon = {
      id: '6',
      code: 'PERCENT50',
      name: '50% de desconto',
      discount_type: 'percentage',
      discount_value: 50,
      is_active: true,
      valid_from: '2025-01-01',
      valid_until: '2025-12-31',
      min_order_value: 0
    };

    mockSupabaseFrom.single.mockResolvedValue({
      data: mockCoupon,
      error: null
    });

    const { result } = renderHook(() => useCouponDiscount('PERCENT50', 150));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.discountValue).toBe(75); // 50% de 150
  });
});
