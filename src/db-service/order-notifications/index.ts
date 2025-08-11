/**
 * Índice dos serviços de notificação de pedidos
 */

export { OrderNotificationService } from './OrderNotificationService';
export { EmailTemplateService } from './templates';
export { EMAIL_CONFIG } from './config';

export type {
  EmailRecipients,
  OrderNotificationData,
  PautaEmailData,
  ArticleDocEmailData,
  ArticleUrlEmailData,
  EmailNotificationType,
  EmailTemplate
} from './types';
