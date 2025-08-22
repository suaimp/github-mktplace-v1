/**
 * Hook para gerenciar o comportamento de clique nas notificações
 * Responsabilidade única: Gerenciar navegação e ações quando uma notificação é clicada
 */

import { useNavigate } from 'react-router-dom';
import { NotificationItem } from '../types';
import { NotificationRedirectService } from '../services';
import { useNotificationDelete } from './useNotificationDelete';

export interface UseNotificationClickReturn {
  handleNotificationClick: (
    notification: NotificationItem, 
    onMarkAsRead: (id: string) => void, 
    onClose: () => void,
    onDelete?: (id: string) => void
  ) => Promise<void>;
  isDeleting: boolean;
  deleteError: string | null;
}

export function useNotificationClick(): UseNotificationClickReturn {
  const navigate = useNavigate();
  const { deleteNotification, isDeleting, deleteError } = useNotificationDelete();

  const handleNotificationClick = async (
    notification: NotificationItem,
    onMarkAsRead: (id: string) => void,
    onClose: () => void,
    onDelete?: (id: string) => void
  ) => {
    console.log(`🔔 [NotificationClick] Clique na notificação ${notification.id}`);

    // Deletar a notificação do banco de dados
    const deleteSuccess = await deleteNotification(notification.id);
    
    if (deleteSuccess && onDelete) {
      // Remover da lista local se a exclusão foi bem-sucedida
      onDelete(notification.id);
      console.log(`✅ [NotificationClick] Notificação ${notification.id} removida da lista local`);
    }

    // Marcar como lida se não estiver lida (mesmo se a exclusão falhar)
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
    handleNotificationClick,
    isDeleting,
    deleteError
  };
}
