/**
 * Hook para gerenciar a exclusão de notificações
 * Responsabilidade única: Deletar notificações do banco de dados
 */

import { useState } from 'react';
import { NotificationService } from '../../../../db-service/notifications';

export interface UseNotificationDeleteReturn {
  deleteNotification: (notificationId: string) => Promise<boolean>;
  isDeleting: boolean;
  deleteError: string | null;
}

export function useNotificationDelete(): UseNotificationDeleteReturn {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteNotification = async (notificationId: string): Promise<boolean> => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await NotificationService.deleteNotification(notificationId);
      console.log(`✅ [NotificationDelete] Notificação ${notificationId} deletada com sucesso`);
      return true;
    } catch (error) {
      console.error(`❌ [NotificationDelete] Erro ao deletar notificação ${notificationId}:`, error);
      setDeleteError('Falha ao deletar notificação');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    deleteNotification,
    isDeleting,
    deleteError
  };
}
