/**
 * Mocks globais para testes do sistema de checkout
 */

import React from 'react';

// Mock do Supabase
export const mockSupabase = {
  auth: {
    getUser: jest.fn().mockResolvedValue({
      data: { user: { id: 'test-user-123' } },
      error: null
    }),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn()
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    limit: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis()
  })
};

// Mock do React Router
export const mockRouter = {
  useNavigate: jest.fn(),
  useLocation: jest.fn().mockReturnValue({ pathname: '/checkout' }),
  useParams: jest.fn().mockReturnValue({}),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
};

// Mock de dados de teste
export const mockTestData = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User'
  },
  cartItems: [
    {
      id: '1',
      entry_id: 'entry123',
      user_id: 'test-user-123',
      product_url: 'https://example.com',
      quantity: 1,
      product_price: 100.00,
      selected_niche: 'technology',
      selected_service: 'premium-content'
    }
  ],
  orderTotals: {
    total_product_price: 100.00,
    total_content_price: 50.00,
    total_final_price: 150.00,
    discount_value: 0,
    applied_coupon_id: null
  },
  coupon: {
    id: '1',
    code: 'SAVE20',
    name: '20% de desconto',
    discount_type: 'percentage',
    discount_value: 20,
    is_active: true,
    valid_from: '2025-01-01',
    valid_until: '2025-12-31',
    min_order_value: 0
  },
  pixPayment: {
    qr_code: 'mock-qr-code-string',
    qr_code_url: 'https://api.pagar.me/pix/qr/mock-123',
    success: true,
    payment_id: 'pix_123456789'
  },
  paymentSettings: {
    stripe_enabled: false,
    pagarme_enabled: true,
    payment_methods: ['card', 'pix', 'boleto'],
    currency: 'BRL'
  }
};

// Mock de funções utilitárias
export const mockUtils = {
  formatCurrency: jest.fn((value: number) => 
    `R$ ${value.toFixed(2).replace('.', ',')}`
  ),
  validateEmail: jest.fn((email: string) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ),
  validateCPF: jest.fn((cpf: string) => 
    cpf.replace(/\D/g, '').length === 11
  ),
  generateOrderId: jest.fn(() => 'order_123456789')
};

// Setup de mocks para cada teste
export const setupTestMocks = () => {
  // Reset todos os mocks
  jest.clearAllMocks();
  
  // Configurar mocks padrão
  (global as any).fetch = jest.fn();
  (global as any).console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  };
  
  // Mock de window.location
  delete (window as any).location;
  (window as any).location = {
    pathname: '/checkout',
    search: '',
    hash: '',
    href: 'http://localhost:3000/checkout'
  };
  
  // Mock de localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn()
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
};

// Cleanup após cada teste
export const cleanupTestMocks = () => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
};
