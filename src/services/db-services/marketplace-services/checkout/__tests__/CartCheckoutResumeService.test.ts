/**
 * Testes para CartCheckoutResumeService
 */

import { 
  getCartCheckoutResumeByUser, 
  createCartCheckoutResume, 
  deleteCartCheckoutResume,
    
} from '../CartCheckoutResumeService';
import { supabase } from '../../../../../lib/supabase';

// Mock do Supabase
jest.mock('../../../../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
    auth: {
      getUser: jest.fn()
    }
  }
}));

describe('CartCheckoutResumeService', () => {
  const mockSupabaseFrom = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.from as jest.Mock).mockReturnValue(mockSupabaseFrom);
  });

  describe('getCartCheckoutResumeByUser', () => {
    it('should fetch checkout resume for user successfully', async () => {
      const mockData = [
        {
          id: '1',
          user_id: 'user123',
          product_url: 'https://example.com',
          quantity: 1,
          product_price: 100.00
        }
      ];

      mockSupabaseFrom.single.mockResolvedValue({
        data: mockData,
        error: null
      });

      const result = await getCartCheckoutResumeByUser('user123');

      expect(supabase.from).toHaveBeenCalledWith('cart_checkout_resume');
      expect(mockSupabaseFrom.select).toHaveBeenCalled();
      expect(mockSupabaseFrom.eq).toHaveBeenCalledWith('user_id', 'user123');
      expect(result).toEqual(mockData);
    });

    it('should handle database errors gracefully', async () => {
      mockSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      const result = await getCartCheckoutResumeByUser('user123');

      expect(result).toBeNull();
    });

    it('should handle empty user ID', async () => {
      const result = await getCartCheckoutResumeByUser('');

      expect(result).toBeNull();
    });
  });

  describe('createCartCheckoutResume', () => {
    it('should create new checkout resume item', async () => {
      const mockItem = {
        user_id: 'user123',
        product_url: 'https://example.com',
        quantity: 1,
        niche: 'Technology',
        price: 100.00,
        service_content: 'Test service content'
      };

      const mockResponse = {
        data: { ...mockItem, id: '1' },
        error: null
      };

      mockSupabaseFrom.single.mockResolvedValue(mockResponse);

      const result = await createCartCheckoutResume(mockItem);

      expect(supabase.from).toHaveBeenCalledWith('cart_checkout_resume');
      expect(mockSupabaseFrom.insert).toHaveBeenCalledWith(mockItem);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle creation errors', async () => {
      const mockItem = {
        user_id: 'user123',
        product_url: 'https://example.com',
        quantity: 1,
        niche: 'Technology',
        price: 100.00,
        service_content: 'Test service content'
      };

      mockSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Creation failed' }
      });

      const result = await createCartCheckoutResume(mockItem);

      expect(result).toBeNull();
    });
  });

  describe('deleteCartCheckoutResume', () => {
    it('should delete item by id', async () => {
      mockSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await deleteCartCheckoutResume('item123');

      expect(supabase.from).toHaveBeenCalledWith('cart_checkout_resume');
      expect(mockSupabaseFrom.delete).toHaveBeenCalled();
      expect(mockSupabaseFrom.eq).toHaveBeenCalledWith('id', 'item123');
      expect(result).toBe(true);
    });

    it('should handle deletion errors', async () => {
      mockSupabaseFrom.single.mockResolvedValue({
        data: null,
        error: { message: 'Deletion failed' }
      });

      const result = await deleteCartCheckoutResume('item123');

      expect(result).toBe(false);
    });
  });
});
