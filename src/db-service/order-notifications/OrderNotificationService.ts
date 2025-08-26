/**
 * Serviço principal para envio de notificações por email
 */
import { supabase } from '../../lib/supabase';
import { EmailTemplateService } from './templates';
import { EMAIL_CONFIG, getPlatformName } from './config';
import {
  PautaEmailData,
  ArticleDocEmailData,
  ArticleUrlEmailData,
  MessageEmailData,
  EmailRecipients,
  OrderNotificationData
} from './types';
export class OrderNotificationService {
  /**
   * Obtém dados básicos do usuário e pedido
   */
  private static async getOrderNotificationData(orderId: string, orderItemId: string): Promise<OrderNotificationData | null> {
    try {
      // Buscar dados do pedido
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          billing_name,
          billing_email
        `)
        .eq('id', orderId)
        .single();
      if (orderError) {
        console.error('❌ [EMAIL_DEBUG] Erro ao buscar dados do pedido:', orderError);
        return null;
      }
      // Buscar dados do order_item para obter URL do produto
      const { data: orderItemData, error: orderItemError } = await supabase
        .from('order_items')
        .select(`
          id,
          product_name,
          product_url
        `)
        .eq('id', orderItemId)
        .single();
      if (orderItemError) {
        console.error('❌ [EMAIL_DEBUG] Erro ao buscar dados do order_item:', orderItemError);
        return null;
      }
      // Extrair apenas o primeiro grupo de caracteres do orderId (antes do primeiro "-")
      const shortOrderId = orderId.split('-')[0];
      const result = {
        orderId,
        shortOrderId,
        orderItemId,
        userName: orderData.billing_name || 'Usuário',
        userEmail: orderData.billing_email || '',
        productName: orderItemData.product_name || 'Produto',
        productUrl: orderItemData.product_url || ''
      };
      return result;
    } catch (error) {
      console.error('❌ [EMAIL_DEBUG] Erro ao obter dados da notificação:', error);
      return null;
    }
  }
  /**
   * Envia email para um destinatário específico
   */
  private static async sendEmailToRecipient(
    email: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    try {
      // Buscar nome dinâmico da plataforma
      const platformName = await getPlatformName();
      const { error } = await supabase.functions.invoke('send-order-notification-email', {
        body: {
          to: [email],
          subject,
          html,
          from: {
            email: EMAIL_CONFIG.FROM_EMAIL,
            name: platformName
          }
        }
      });
      if (error) {
        console.error('❌ [EMAIL_DEBUG] ERRO DETALHADO da edge function:', {
          email,
          error,
          errorType: typeof error,
          errorMessage: error instanceof Error ? error.message : String(error),
          errorDetails: (error as any).details || 'N/A',
          errorContext: (error as any).context || 'N/A'
        });
        return false;
      }      return true;
    } catch (error) {
      console.error('❌ [EMAIL_DEBUG] EXCEPTION no envio de email:', {
        email,
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : 'N/A'
      });
      return false;
    }
  }
  /**
   * Envia email via função Supabase Edge
   */
  private static async sendEmail(
    recipients: EmailRecipients,
    subject: string,
    html: string
  ): Promise<boolean> {
    try {
      // Buscar nome dinâmico da plataforma
      const platformName = await getPlatformName();
      const { error } = await supabase.functions.invoke('send-order-notification-email', {
        body: {
          to: [recipients.userEmail, recipients.adminEmail],
          subject,
          html,
          from: {
            email: EMAIL_CONFIG.FROM_EMAIL,
            name: platformName
          }
        }
      });
      if (error) {
        console.error('❌ [EMAIL_DEBUG] Erro ao invocar função Edge:', error);
        return false;
      }      return true;
    } catch (error) {
      console.error('❌ [EMAIL_DEBUG] Erro no envio de email:', error);
      return false;
    }
  }
  /**
   * Envia notificação de nova pauta
   */
  static async sendPautaNotification(
    orderId: string,
    orderItemId: string,
    pautaData: {
      palavraChave: string;
      urlSite: string;
      textoAncora: string;
      requisitosEspeciais: string;
    }
  ): Promise<boolean> {
    try {
      const baseData = await this.getOrderNotificationData(orderId, orderItemId);
      if (!baseData) {
        console.error('❌ [EMAIL_DEBUG] Não foi possível obter dados do pedido - ABORTANDO');
        return false;
      }
      // Buscar nome dinâmico da plataforma
      const platformName = await getPlatformName();
      const emailData: PautaEmailData = {
        ...baseData,
        pautaData
      };      
      // Gerar template para o cliente
      const clientTemplate = EmailTemplateService.generatePautaTemplate(emailData, false, platformName);      
      // Gerar template para o admin
      const adminTemplate = EmailTemplateService.generatePautaTemplate(emailData, true, platformName);      
      // Enviar email para o cliente
      const clientResult = await this.sendEmailToRecipient(
        baseData.userEmail, 
        clientTemplate.subject, 
        clientTemplate.html
      );
      // Enviar email para o admin
      const adminResult = await this.sendEmailToRecipient(
        EMAIL_CONFIG.ADMIN_EMAIL, 
        adminTemplate.subject, 
        adminTemplate.html
      );
      const result = clientResult && adminResult;      return result;
    } catch (error) {
      console.error('❌ [EMAIL_DEBUG] Erro ao enviar notificação de pauta:', error);
      return false;
    }
  }
  /**
   * Envia notificação de novo artigo (upload ou link)
   */
  static async sendArticleDocNotification(
    orderId: string,
    orderItemId: string,
    articleType: 'upload' | 'link',
    articleData?: {
      fileName?: string;
      fileUrl?: string;
      articleUrl?: string;
    }
  ): Promise<boolean> {
    try {
      const baseData = await this.getOrderNotificationData(orderId, orderItemId);
      if (!baseData) {
        console.error('❌ [EMAIL_DEBUG] Não foi possível obter dados do pedido - ABORTANDO');
        return false;
      }
      // Buscar nome dinâmico da plataforma
      const platformName = await getPlatformName();
      const emailData: ArticleDocEmailData = {
        ...baseData,
        articleType,
        articleData
      };      
      // Gerar template para o cliente
      const clientTemplate = EmailTemplateService.generateArticleDocTemplate(emailData, false, platformName);      
      // Gerar template para o admin
      const adminTemplate = EmailTemplateService.generateArticleDocTemplate(emailData, true, platformName);      
      // Enviar email para o cliente
      const clientResult = await this.sendEmailToRecipient(
        baseData.userEmail, 
        clientTemplate.subject, 
        clientTemplate.html
      );
      // Enviar email para o admin
      const adminResult = await this.sendEmailToRecipient(
        EMAIL_CONFIG.ADMIN_EMAIL, 
        adminTemplate.subject, 
        adminTemplate.html
      );
      const result = clientResult && adminResult;      return result;
    } catch (error) {
      console.error('❌ [EMAIL_DEBUG] Erro ao enviar notificação de artigo:', error);
      return false;
    }
  }
  /**
   * Envia notificação de artigo publicado (URL final)
   */
  static async sendArticleUrlNotification(
    orderId: string,
    orderItemId: string,
    publishedUrl: string
  ): Promise<boolean> {
    try {
      const baseData = await this.getOrderNotificationData(orderId, orderItemId);
      if (!baseData) {
        console.error('❌ [EMAIL_DEBUG] Não foi possível obter dados do pedido - ABORTANDO');
        return false;
      }
      // Buscar nome dinâmico da plataforma
      const platformName = await getPlatformName();
      const emailData: ArticleUrlEmailData = {
        ...baseData,
        publishedUrl
      };      const template = EmailTemplateService.generateArticleUrlTemplate(emailData, platformName);      
      const recipients: EmailRecipients = {
        userEmail: baseData.userEmail,
        adminEmail: EMAIL_CONFIG.ADMIN_EMAIL
      };
      const result = await this.sendEmail(recipients, template.subject, template.html);      return result;
    } catch (error) {
      console.error('❌ [EMAIL_DEBUG] Erro ao enviar notificação de artigo publicado:', error);
      return false;
    }
  }
  /**
   * Envia notificação de nova mensagem de chat
   */
  static async sendMessageNotification(
    orderId: string,
    orderItemId: string,
    messageData: {
      message: string;
      senderName: string;
      senderType: 'user' | 'admin';
    }
  ): Promise<boolean> {
    try {
      const baseData = await this.getOrderNotificationData(orderId, orderItemId);
      if (!baseData) {
        console.error('❌ [EMAIL_DEBUG] Não foi possível obter dados do pedido - ABORTANDO');
        return false;
      }
      // Buscar nome dinâmico da plataforma
      const platformName = await getPlatformName();
      const emailData: MessageEmailData = {
        ...baseData,
        message: messageData.message,
        senderName: messageData.senderName,
        senderType: messageData.senderType
      };      
      // Gerar template para o cliente (quando admin envia mensagem)
      const clientTemplate = EmailTemplateService.generateMessageTemplate(emailData, false, platformName);      
      // Gerar template para o admin (quando cliente envia mensagem)
      const adminTemplate = EmailTemplateService.generateMessageTemplate(emailData, true, platformName);      
      let clientResult = true;
      let adminResult = true;
      if (messageData.senderType === 'user') {
        // Cliente enviou mensagem - notificar admin
        adminResult = await this.sendEmailToRecipient(
          EMAIL_CONFIG.ADMIN_EMAIL, 
          adminTemplate.subject, 
          adminTemplate.html
        );      } else {
        // Admin enviou mensagem - notificar cliente
        clientResult = await this.sendEmailToRecipient(
          baseData.userEmail, 
          clientTemplate.subject, 
          clientTemplate.html
        );      }
      const result = clientResult && adminResult;      return result;
    } catch (error) {
      console.error('❌ [EMAIL_DEBUG] Erro ao enviar notificação de mensagem:', error);
      return false;
    }
  }
}
