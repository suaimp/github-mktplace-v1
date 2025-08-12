/**
 * Mock do cliente Supabase para testes
 */

export const mockSupabaseClient = {
  from: jest.fn((table: string) => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
  })),
  functions: {
    invoke: jest.fn().mockResolvedValue({ 
      data: { success: true }, 
      error: null 
    }),
  },
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    signIn: jest.fn().mockResolvedValue({ 
      data: { user: null }, 
      error: null 
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      download: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      remove: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
    })),
  },
};

// Mock do módulo supabase
jest.mock('../../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));
