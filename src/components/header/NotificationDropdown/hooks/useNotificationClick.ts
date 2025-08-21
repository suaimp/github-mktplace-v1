/**
 * Hook para gerenciar o comportamento de clique nas notificações
 * Responsabilidade única: Gerenciar navegação e ações quando uma notificação é clicada
 */

import { useNavigate } from 'react-router-dom';
import { NotificationItem } from '../types';
import { NotificationRedirectService } from '../services';

export interface UseNotificationClickReturn {
  handleNotificationClick: (notification: NotificationItem, onMarkAsRead: (id: string) => void, onClose: () => void) => void;
}

export function useNotificationClick(): UseNotificationClickReturn {
  const navigate = useNavigate();

  const handleNotificationClick = (
    notification: NotificationItem,
    onMarkAsRead: (id: string) => void,
    onClose: () => void
  ) => {
    // Marcar como lida se não estiver lida
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }

    // Fechar o dropdown
    onClose();

    // Redirecionamento baseado no order_id ou relatedUrl
    const redirectUrl = notification.orderId 
      ? `/orders/${notification.orderId}` // Prioridade para order_id específico
      : notification.relatedUrl; // Fallback para relatedUrl existente

    if (redirectUrl) {
      navigate(redirectUrl);
    } else {
      // Fallback: tentar gerar URL usando o serviço
      const generatedUrl = NotificationRedirectService.generateRedirectUrl({
        type: notification.type,
        orderId: notification.orderId,
        subtitle: notification.subtitle
      });

      if (generatedUrl) {
        navigate(generatedUrl);
      }
    }
  };

  return {
    handleNotificationClick
  };
}
