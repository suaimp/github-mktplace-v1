/**
 * Tipos para o sistema de notificações de pedidos
 */

export interface EmailRecipients {
  userEmail: string;
  adminEmail: string;
}

export interface OrderNotificationData {
  orderId: string;
  shortOrderId: string;
  orderItemId: string;
  userName: string;
  userEmail: string;
  productName: string;
  productUrl: string;
}

export interface PautaEmailData extends OrderNotificationData {
  pautaData: {
    palavraChave: string;
    urlSite: string;
    textoAncora: string;
    requisitosEspeciais: string;
  };
}

export interface ArticleDocEmailData extends OrderNotificationData {
  articleType: 'upload' | 'link';
  articleData?: {
    fileName?: string;
    fileUrl?: string;
    articleUrl?: string;
  };
}

export interface ArticleUrlEmailData extends OrderNotificationData {
  publishedUrl: string;
}

export interface MessageEmailData extends OrderNotificationData {
  message: string;
  senderName: string;
  senderType: 'user' | 'admin';
}

export type EmailNotificationType = 
  | 'nova_pauta_enviada'
  | 'novo_artigo_enviado'
  | 'novo_artigo_publicado'
  | 'nova_mensagem_chat';

export interface EmailTemplate {
  subject: string;
  html: string;
}
