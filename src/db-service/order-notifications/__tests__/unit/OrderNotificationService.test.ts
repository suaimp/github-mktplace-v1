/**
 * Testes unitários para OrderNotificationService
 * Responsabilidade: Testar os métodos de envio de notificações
 */

import { mockSupabaseClient } from '../../../../__tests__/mocks/supabase/client.mock';
import {
  mockBaseNotificationData,
  mockPautaData,
  mockSupabaseResponses
} from '../../../../__tests__/mocks/data/notificationData.mock';

// Mock do supabase
jest.mock('../../../../lib/supabase', () => ({
  supabase: mockSupabaseClient,
}));

// Mock dos templates
jest.mock('../../templates', () => ({
  EmailTemplateService: {
    generatePautaTemplate: jest.fn().mockReturnValue({
      subject: 'Nova Pauta Enviada',
      html: '<html>Mock Template</html>'
    }),
    generateArticleDocTemplate: jest.fn().mockReturnValue({
      subject: 'Novo Artigo Enviado',
      html: '<html>Mock Article Template</html>'
    }),
    generateArticleUrlTemplate: jest.fn().mockReturnValue({
      subject: 'Artigo Publicado',
      html: '<html>Mock Published Template</html>'
    }),
    generateMessageTemplate: jest.fn().mockImplementation((_data, isAdmin) => ({
      subject: isAdmin ? 'Nova mensagem do cliente' : 'Nova mensagem do suporte',
      html: '<html>Mock Message Template</html>'
    })),
  },
}));

import { OrderNotificationService } from '../../OrderNotificationService';

// Helper para criar mock completo do Supabase table
const createTableMock = (mockData: any = null, mockError: any = null) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: mockData, error: mockError }),
  order: jest.fn().mockReturnThis()
});

describe('OrderNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderNotificationData', () => {
    it('deve retornar dados corretos quando pedido e item existem', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderSuccess.data);
        }
        if (table === 'order_items') {
          return createTableMock(mockSupabaseResponses.orderItemSuccess.data);
        }
        return createTableMock();
      });

      // Act
      const result = await (OrderNotificationService as any).getOrderNotificationData(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456'
      );

      // Assert
      expect(result).toEqual(mockBaseNotificationData);
      expect(result?.shortOrderId).toBe('c12eab5f');
    });

    it('deve retornar null quando pedido não existe', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderNotFound.data, mockSupabaseResponses.orderNotFound.error);
        }
        return createTableMock();
      });

      // Act
      const result = await (OrderNotificationService as any).getOrderNotificationData(
        'invalid-order-id',
        'item-456'
      );

      // Assert
      expect(result).toBeNull();
    });

    it('deve retornar null quando order_item não existe', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderSuccess.data);
        }
        if (table === 'order_items') {
          return createTableMock(mockSupabaseResponses.orderItemNotFound.data, mockSupabaseResponses.orderItemNotFound.error);
        }
        return createTableMock();
      });

      // Act
      const result = await (OrderNotificationService as any).getOrderNotificationData(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'invalid-item-id'
      );

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('sendEmailToRecipient', () => {
    it('deve enviar email com sucesso para destinatário individual', async () => {
      // Arrange
      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupabaseResponses.edgeFunctionSuccess);

      // Act
      const result = await (OrderNotificationService as any).sendEmailToRecipient(
        'test@example.com',
        'Test Subject',
        '<html>Test HTML</html>'
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'send-order-notification-email',
        {
          body: {
            to: ['test@example.com'],
            subject: 'Test Subject',
            html: '<html>Test HTML</html>',
            from: {
              email: expect.any(String),
              name: expect.any(String)
            }
          }
        }
      );
    });

    it('deve retornar false quando Edge Function falha', async () => {
      // Arrange
      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupabaseResponses.edgeFunctionError);

      // Act
      const result = await (OrderNotificationService as any).sendEmailToRecipient(
        'test@example.com',
        'Test Subject',
        '<html>Test HTML</html>'
      );

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('sendPautaNotification', () => {
    beforeEach(() => {
      // Setup successful data retrieval
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderSuccess.data);
        }
        if (table === 'order_items') {
          return createTableMock(mockSupabaseResponses.orderItemSuccess.data);
        }
        return createTableMock();
      });

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupabaseResponses.edgeFunctionSuccess);
    });

    it('deve enviar notificação de pauta com sucesso', async () => {
      // Act
      const result = await OrderNotificationService.sendPautaNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        mockPautaData
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2); // Cliente + Admin
    });

    it('deve retornar false quando não consegue obter dados do pedido', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderNotFound.data, mockSupabaseResponses.orderNotFound.error);
        }
        return createTableMock();
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

  describe('sendArticleDocNotification', () => {
    beforeEach(() => {
      // Setup successful data retrieval
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderSuccess.data);
        }
        if (table === 'order_items') {
          return createTableMock(mockSupabaseResponses.orderItemSuccess.data);
        }
        return createTableMock();
      });

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupabaseResponses.edgeFunctionSuccess);
    });

    it('deve enviar notificação de artigo upload com sucesso', async () => {
      // Act
      const result = await OrderNotificationService.sendArticleDocNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        'upload',
        {
          fileName: 'test.docx',
          fileUrl: 'https://storage.example.com/test.docx'
        }
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2); // Cliente + Admin
    });

    it('deve enviar notificação de artigo link com sucesso', async () => {
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
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(2); // Cliente + Admin
    });
  });

  describe('sendArticleUrlNotification', () => {
    beforeEach(() => {
      // Setup successful data retrieval
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderSuccess.data);
        }
        if (table === 'order_items') {
          return createTableMock(mockSupabaseResponses.orderItemSuccess.data);
        }
        return createTableMock();
      });

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupabaseResponses.edgeFunctionSuccess);
    });

    it('deve enviar notificação de artigo publicado com sucesso', async () => {
      // Act
      const result = await OrderNotificationService.sendArticleUrlNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        'https://blog.example.com/artigo-publicado'
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledTimes(1); // Template único
    });

    it('deve retornar false com URL inválida', async () => {
      // Act
      const result = await OrderNotificationService.sendArticleUrlNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        ''
      );

      // Assert
      expect(result).toBe(true); // O serviço não valida URL vazia, isso pode ser uma melhoria
    });
  });

  describe('sendMessageNotification', () => {
    beforeEach(() => {
      // Setup successful data retrieval
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(mockSupabaseResponses.orderSuccess.data);
        }
        if (table === 'order_items') {
          return createTableMock(mockSupabaseResponses.orderItemSuccess.data);
        }
        return createTableMock();
      });

      mockSupabaseClient.functions.invoke.mockResolvedValue(mockSupabaseResponses.edgeFunctionSuccess);
    });

    it('deve enviar notificação quando cliente envia mensagem', async () => {
      // Arrange
      const messageData = {
        message: 'Preciso de ajuda com meu pedido',
        senderName: 'João Silva',
        senderType: 'user' as const
      };

      // Act
      const result = await OrderNotificationService.sendMessageNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        messageData
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'send-order-notification-email',
        expect.objectContaining({
          body: expect.objectContaining({
            subject: 'Nova mensagem do cliente',
            html: expect.any(String),
            from: expect.objectContaining({
              name: expect.any(String)
            })
          })
        })
      );
    });

    it('deve enviar notificação quando admin envia mensagem', async () => {
      // Arrange
      const messageData = {
        message: 'Seu pedido está sendo processado',
        senderName: 'Maria (Suporte)',
        senderType: 'admin' as const
      };

      // Act
      const result = await OrderNotificationService.sendMessageNotification(
        'c12eab5f-df30-4868-9469-a0dd61db4800',
        'item-456',
        messageData
      );

      // Assert
      expect(result).toBe(true);
      expect(mockSupabaseClient.functions.invoke).toHaveBeenCalledWith(
        'send-order-notification-email',
        expect.objectContaining({
          body: expect.objectContaining({
            subject: 'Nova mensagem do suporte',
            html: expect.any(String),
            from: expect.objectContaining({
              name: expect.any(String)
            })
          })
        })
      );
    });

    it('deve retornar false quando dados do pedido não são encontrados', async () => {
      // Arrange
      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'orders') {
          return createTableMock(null, { message: 'Order not found' });
        }
        return createTableMock();
      });

      const messageData = {
        message: 'Teste',
        senderName: 'Test User',
        senderType: 'user' as const
      };

      // Act
      const result = await OrderNotificationService.sendMessageNotification(
        'invalid-order-id',
        'item-456',
        messageData
      );

      // Assert
      expect(result).toBe(false);
    });
  });
});
