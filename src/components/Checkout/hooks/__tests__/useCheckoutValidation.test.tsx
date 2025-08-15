/**
 * Testes para useCheckoutValidation hook
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useCheckoutValidation } from '../useCheckoutValidation';
import { supabase } from '../../../../lib/supabase';

// Mock do Supabase
jest.mock('../../../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }
}));

describe('useCheckoutValidation', () => {
  const mockSupabaseFrom = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseFrom);
  });

  it('should return loading true initially', () => {
    const { result } = renderHook(() => useCheckoutValidation());
    
    expect(result.current.loading).toBe(true);
    expect(result.current.areAllFieldsSelected).toBe(false);
  });

  it('should validate when user has no items', async () => {
    // Mock user authenticated
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null
    });

    // Mock empty cart
    mockSupabaseFrom.order.mockResolvedValue({
      data: [],
      error: null
    });

    const { result } = renderHook(() => useCheckoutValidation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.areAllFieldsSelected).toBe(true);
  });

  it('should validate when all fields are selected', async () => {
    // Mock user authenticated
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null
    });

    // Mock cart with valid selections
    const mockItems = [
      {
        id: '1',
        user_id: 'user123',
        selected_niche: 'technology',
        selected_service: 'premium-content',
        product_url: 'https://example.com'
      }
    ];

    mockSupabaseFrom.order.mockResolvedValue({
      data: mockItems,
      error: null
    });

    const { result } = renderHook(() => useCheckoutValidation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.areAllFieldsSelected).toBe(true);
  });

  it('should invalidate when fields are missing', async () => {
    // Mock user authenticated
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null
    });

    // Mock cart with missing selections
    const mockItems = [
      {
        id: '1',
        user_id: 'user123',
        selected_niche: null, // Missing niche
        selected_service: 'premium-content',
        product_url: 'https://example.com'
      }
    ];

    mockSupabaseFrom.order.mockResolvedValue({
      data: mockItems,
      error: null
    });

    const { result } = renderHook(() => useCheckoutValidation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.areAllFieldsSelected).toBe(false);
  });

  it('should handle unauthenticated user', async () => {
    // Mock user not authenticated
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null
    });

    const { result } = renderHook(() => useCheckoutValidation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.areAllFieldsSelected).toBe(false);
  });

  it('should handle database errors', async () => {
    // Mock user authenticated
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null
    });

    // Mock database error
    mockSupabaseFrom.order.mockResolvedValue({
      data: null,
      error: { message: 'Database error' }
    });

    const { result } = renderHook(() => useCheckoutValidation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.areAllFieldsSelected).toBe(false);
  });

  it('should validate placeholder values correctly', async () => {
    // Mock user authenticated
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user123' } },
      error: null
    });

    // Mock cart with placeholder values (should be invalid)
    const mockItems = [
      {
        id: '1',
        user_id: 'user123',
        selected_niche: 'Selecione o nicho', // Placeholder
        selected_service: 'Nenhum - eu vou fornecer o conteúdo',
        product_url: 'https://example.com'
      }
    ];

    mockSupabaseFrom.order.mockResolvedValue({
      data: mockItems,
      error: null
    });

    const { result } = renderHook(() => useCheckoutValidation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.areAllFieldsSelected).toBe(false);
  });
});
