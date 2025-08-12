/**
 * Dados de teste para notificações de pedidos
 */

import {
  OrderNotificationData,
  PautaEmailData,
  ArticleDocEmailData,
  ArticleUrlEmailData,
  EmailRecipients
} from '../../../db-service/order-notifications/types';

export const mockOrderData = {
  id: 'c12eab5f-df30-4868-9469-a0dd61db4800',
  user_id: 'user-123',
  billing_name: 'Moises Azevedo',
  billing_email: 'moises@teste.com'
};

export const mockOrderItemData = {
  id: 'item-456',
  order_id: 'c12eab5f-df30-4868-9469-a0dd61db4800',
  product_name: 'Pacote Básico de Artigos',
  product_url: 'https://example.com/produto/123'
};

export const mockBaseNotificationData: OrderNotificationData = {
  orderId: 'c12eab5f-df30-4868-9469-a0dd61db4800',
  shortOrderId: 'c12eab5f',
  orderItemId: 'item-456',
  userName: 'Moises Azevedo',
  userEmail: 'moises@teste.com',
  productName: 'Pacote Básico de Artigos',
  productUrl: 'https://example.com/produto/123'
};

export const mockPautaData = {
  palavraChave: 'marketing digital',
  urlSite: 'https://exemplo.com',
  textoAncora: 'clique aqui',
  requisitosEspeciais: 'Artigo deve ter tom formal e técnico'
};

export const mockPautaEmailData: PautaEmailData = {
  ...mockBaseNotificationData,
  pautaData: mockPautaData
};

export const mockArticleDocEmailData: ArticleDocEmailData = {
  ...mockBaseNotificationData,
  articleType: 'upload',
  articleData: {
    fileName: 'artigo-teste.docx',
    fileUrl: 'https://storage.example.com/artigo-teste.docx'
  }
};

export const mockArticleLinkEmailData: ArticleDocEmailData = {
  ...mockBaseNotificationData,
  articleType: 'link',
  articleData: {
    articleUrl: 'https://docs.google.com/document/d/123/edit'
  }
};

export const mockArticleUrlEmailData: ArticleUrlEmailData = {
  ...mockBaseNotificationData,
  publishedUrl: 'https://blog.exemplo.com/artigo-publicado'
};

export const mockEmailRecipients: EmailRecipients = {
  userEmail: 'moises@teste.com',
  adminEmail: 'contato@suaimprensa.com.br'
};

export const mockSupabaseResponses = {
  orderSuccess: {
    data: mockOrderData,
    error: null
  },
  orderItemSuccess: {
    data: mockOrderItemData,
    error: null
  },
  orderNotFound: {
    data: null,
    error: { code: 'PGRST116', message: 'No rows found' }
  },
  orderItemNotFound: {
    data: null,
    error: { code: 'PGRST116', message: 'No rows found' }
  },
  edgeFunctionSuccess: {
    data: { success: true, messageId: 'msg-123' },
    error: null
  },
  edgeFunctionError: {
    data: null,
    error: { message: 'Failed to send email' }
  }
};
