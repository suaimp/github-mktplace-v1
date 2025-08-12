/**
 * Testes de integração para fluxos completos de notificação
 * Responsabilidade: Testar fluxos end-to-end
 */

import { mockSupabaseClient } from '../../../../__tests__/mocks/supabase/client.mock';
import {
  mockPautaData,
  mockSupabaseResponses
} from '../../../../__tests__/mocks/data/notificationData.mock';

// Mock do supabase
jest.mock('../../../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

import { OrderNotificationService } from '../../OrderNotificationService';
import { EmailTemplateService } from '../../templates';

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

describe('Notification Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup successful responses por padrão
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'orders') {
        return createCompleteTableMock(mockSupabaseResponses.orderSuccess.data);
      }
      if (table === 'order_items') {
        return createCompleteTableMock(mockSupabaseResponses.orderItemSuccess.data);
      }
      return createCompleteTableMock();
    });

    mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupabaseResponses.edgeFunctionSuccess);
  });

  describe('Fluxo Completo: Nova Pauta', () => {
    it('deve executar fluxo completo de pauta com sucesso', async () => {
      // Act
      const result = await OrderNotificationService.sendPautaNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        mockPautaData
      );

      // Assert
      expect(result).toBe(true);

      // Verificar chamadas na ordem correta
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('orders');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('order_items');
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2); // Cliente + Admin

      // Verificar que foram enviados emails diferenciados
      const calls = mockSupabaseClient.functions.invoke.mock.calls;
      expect(calls[0][1].body.to[0]).toBe('moises@teste.com'); // Cliente
      expect(calls[1][1].body.to[0]).toBe('contato@suaimprensa.com.br'); // Admin
    });

    it('deve falhar graciosamente quando dados não encontrados', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createCompleteTableMock(mockSupabaseResponses.orderNotFound.data, mockSupabaseResponses.orderNotFound.error);
        }
        return createCompleteTableMock();
      });

      // Act
      const result = await OrderNotificationService.sendPautaNotification(
        'invalid-order-id',
        'item-456',
        mockPautaData
      );

      // Assert
      expect(result).toBe(false);
      expect(mockSupabaseClient.functions.invoke).not.toHaveBeenCalled();
    });
  });

  describe('Fluxo Completo: Artigo Upload', () => {
    it('deve executar fluxo completo de upload com sucesso', async () => {
      // Act
      const result = await OrderNotificationService.sendArticleDocNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        'upload',
        {
          fileName: 'test.docx',
          fileUrl: 'https://storage.test.com/test.docx'
        }
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2);

      // Verificar dados específicos do upload
      const calls = mockSupabaseClient.functions.invoke.mock.calls;
      expect(calls[0][1].body.html).toContain('test.docx');
      expect(calls[0][1].body.html).not.toContain('Baixar Arquivo'); // Botão removido
    });
  });

  describe('Fluxo Completo: Artigo Link', () => {
    it('deve executar fluxo completo de link com sucesso', async () => {
      // Act
      const result = await OrderNotificationService.sendArticleDocNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        'link',
        {
          articleUrl: 'https://docs.google.com/document/d/123'
        }
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2);

      // Verificar dados específicos do link
      const calls = mockSupabaseClient.functions.invoke.mock.calls;
      expect(calls[0][1].body.html).toContain('https://docs.google.com/document/d/123');
    });
  });

  describe('Fluxo Completo: Artigo Publicado', () => {
    it('deve executar fluxo completo de publicação com sucesso', async () => {
      // Act
      const result = await OrderNotificationService.sendArticleUrlNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        'https://blog.test.com/artigo-publicado'
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(1); // Template único

      // Verificar dados da publicação
      const call = mockSupabaseClient.functions.invoke.mock.calls[0];
      expect(call[1].body.to).toEqual(['moises@teste.com', 'contato@suaimprensa.com.br']);
      expect(call[1].body.html).toContain('https://blog.test.com/artigo-publicado');
      expect(call[1].body.html).not.toContain('Visualizar Artigo'); // Botão removido
    });
  });

  describe('Resilência do Sistema', () => {
    it('deve continuar funcionando com falha parcial do email', async () => {
      // Arrange
      mockSupabaseClient.functions.invoke
        .mockResolvedValueOnce(mockSupabaseResponses.edgeFunctionSuccess) // Cliente OK
        .mockResolvedValueOnce(mockSupabaseResponses.edgeFunctionError);   // Admin falha

      // Act
      const result = await OrderNotificationService.sendPautaNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        mockPautaData
      );

      // Assert
      expect(result).toBe(false); // Falha geral porque admin falhou
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2);
    });

    it('deve tratar erro de rede na Edge Function', async () => {
      // Arrange
      mockSupabaseClient.functions.invoke.mockRejectedValue(new Error('Network error'));

      // Act
      const result = await OrderNotificationService.sendPautaNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        mockPautaData
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Validação de Templates vs Serviços', () => {
    it('templates de pauta devem ser diferentes para cliente e admin', () => {
      // Arrange
      const mockData = {
        orderId: 'test',
        shortOrderId: 'test',
        orderItemId: 'test',
        userName: 'Test User',
        userEmail: 'test@test.com',
        productName: 'Test Product',
        productUrl: 'https://test.com',
        pautaData: mockPautaData
      };

      // Act
      const clientTemplate = EmailTemplateService.generatePautaTemplate(mockData, false);
      const adminTemplate = EmailTemplateService.generatePautaTemplate(mockData, true);

      // Assert
      expect(clientTemplate.html).toContain('Por favor, aguarde a produção do artigo.');
      expect(adminTemplate.html).toContain('Por favor, revise a pauta e proceda com a produção do artigo.');
      expect(clientTemplate.html).not.toEqual(adminTemplate.html);
    });

    it('templates de artigo devem ser diferentes para cliente e admin', () => {
      // Arrange
      const mockData = {
        orderId: 'test',
        shortOrderId: 'test',
        orderItemId: 'test',
        userName: 'Test User',
        userEmail: 'test@test.com',
        productName: 'Test Product',
        productUrl: 'https://test.com',
        articleType: 'upload' as const,
        articleData: { fileName: 'test.docx' }
      };

      // Act
      const clientTemplate = EmailTemplateService.generateArticleDocTemplate(mockData, false);
      const adminTemplate = EmailTemplateService.generateArticleDocTemplate(mockData, true);

      // Assert
      expect(clientTemplate.html).toContain('Aguarde a revisão do artigo');
      expect(adminTemplate.html).toContain('Por favor, revise o artigo e proceda com a publicação');
      expect(clientTemplate.html).not.toEqual(adminTemplate.html);
    });
  });
});
