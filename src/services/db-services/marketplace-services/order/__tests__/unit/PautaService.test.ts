/**
 * Testes unitários para PautaService
 * Responsabilidade: Testar operações de pauta com notificações
 */

import { mockSupabaseClient } from '../../../../../../__tests__/mocks/supabase/client.mock';

// Mock do supabase
jest.mock('../../../../../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

// Mock do OrderNotificationService
const mockSendPautaNotification = jest.fn();
jest.mock('../../../../../../db-service/order-notifications', () => ({
  OrderNotificationService: {
    sendPautaNotification: mockSendPautaNotification,
  },
}));

import { PautaService } from '../../PautaService';

// Helper para criar mock completo do Supabase table
const createCompleteTableMock = (mockData: any = null, mockError: any = null) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
  order: jest.fn().mockReturnThis()
});

describe('PautaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default successful responses
    mockSupabaseClient.from.mockImplementation((_table: string) => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          id: 'pauta-123',
          item_id: 'item-456',
          palavra_chave: 'marketing digital',
          url_site: 'https://example.com',
          texto_ancora: 'clique aqui',
          requisitos_especiais: 'Artigo formal'
        },
        error: null
      }),
      order: jest.fn().mockReturnThis(),
    }));
  });

  describe('createPauta', () => {
    const mockPautaData = {
      palavraChave: 'marketing digital',
      urlSite: 'https://example.com',
      textoAncora: 'clique aqui',
      requisitosEspeciais: 'Artigo deve ter tom formal'
    };

    it('deve criar pauta e enviar notificação com sucesso', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pautas') {
          return createCompleteTableMock({
            id: 'pauta-123',
            item_id: 'item-456',
            palavra_chave: 'marketing digital',
            url_site: 'https://example.com',
            texto_ancora: 'clique aqui',
            requisitos_especiais: 'Artigo deve ter tom formal'
          });
        }
        if (table === 'order_items') {
          return createCompleteTableMock({ order_id: 'order-123' });
        }
        return createCompleteTableMock();
      });

      mockSendPautaNotification.mockResolvedValue(true);

      // Act
      const result = await PautaService.createPauta('item-456', mockPautaData);

      // Assert
      expect(result).toBeTruthy();
      expect(mockSendPautaNotification).toHaveBeenCalledWith(
        'order-123',
        'item-456',
        {
          palavraChave: 'marketing digital',
          urlSite: 'https://example.com',
          textoAncora: 'clique aqui',
          requisitosEspeciais: 'Artigo deve ter tom formal'
        }
      );
    });

    it('deve criar pauta mesmo se notificação falhar', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pautas') {
          return createCompleteTableMock({
            id: 'pauta-123',
            item_id: 'item-456',
            palavra_chave: 'marketing digital',
            url_site: 'https://example.com',
            texto_ancora: 'clique aqui',
            requisitos_especiais: 'Artigo deve ter tom formal'
          });
        }
        if (table === 'order_items') {
          return createCompleteTableMock({ order_id: 'order-123' });
        }
        return createCompleteTableMock();
      });

      mockSendPautaNotification.mockRejectedValue(new Error('Email failed'));

      // Act
      const result = await PautaService.createPauta('item-456', mockPautaData);

      // Assert
      expect(result).toBeTruthy(); // Pauta deve ser criada mesmo com falha no email
      expect(mockSendPautaNotification).toHaveBeenCalled();
    });

    it('não deve enviar notificação se order_id não for encontrado', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'pautas') {
          return createCompleteTableMock({
            id: 'pauta-123',
            item_id: 'item-456',
            palavra_chave: 'marketing digital',
            url_site: 'https://example.com',
            texto_ancora: 'clique aqui',
            requisitos_especiais: 'Artigo deve ter tom formal'
          });
        }
        if (table === 'order_items') {
          return createCompleteTableMock(null, { code: 'PGRST116', message: 'No rows found' });
        }
        return createCompleteTableMock();
      });

      // Act
      const result = await PautaService.createPauta('item-456', mockPautaData);

      // Assert
      expect(result).toBeTruthy(); // Pauta deve ser criada
      expect(mockSendPautaNotification).not.toHaveBeenCalled();
    });
  });

  describe('getPautaByItemId', () => {
    it('deve buscar pauta existente com sucesso', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((_table: string) => 
        createCompleteTableMock({
          id: 'pauta-123',
          item_id: 'item-456',
          palavra_chave: 'marketing digital',
          url_site: 'https://example.com',
          texto_ancora: 'clique aqui',
          requisitos_especiais: 'Artigo formal'
        })
      );

      // Act
      const result = await PautaService.getPautaByItemId('item-456');

      // Assert
      expect(result).toBeTruthy();
      expect(result?.itemId).toBe('item-456');
      expect(result?.palavraChave).toBe('marketing digital');
    });

    it('deve retornar null quando pauta não existe', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((_table: string) => 
        createCompleteTableMock(null, { code: 'PGRST116', message: 'No rows found' })
      );

      // Act
      const result = await PautaService.getPautaByItemId('item-inexistente');

      // Assert
      expect(result).toBeNull();
    });
  });
});
