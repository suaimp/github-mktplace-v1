/**
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { ChatNotificationFilterService } from '../../../../db-service/notifications';
import { UserDisplayService } from '../services/userDisplayService';
import { 
  NotificationDropdownState, 
  NotificationItem, 
  UseNotificationsReturn 
} from '../types';ara gerenciar notificações do header
 * Responsabilidade única: Buscar e gerenciar estado das notificações do usuário
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { ChatNotificationFilterService } from '../../../../db-service/notifications';
import { UserDisplayService, NotificationRedirectService } from '../services';
import { 
  NotificationDropdownState, 
  NotificationItem, 
  UseNotificationsReturn 
} from '../types';

export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationDropdownState>({
    notifications: [],
    isLoading: true,
    hasUnread: false,
    unreadCount: 0
  });

  /**
   * Busca informações do usuário que enviou a mensagem
   */
  const getUserInfo = useCallback(async (userId: string) => {
    try {
      const userDisplayInfo = await UserDisplayService.getUserDisplayInfo(userId);
      return {
        id: userDisplayInfo.id,
        name: userDisplayInfo.name,
        avatar: userDisplayInfo.avatar || `/images/default-avatar.png`,
        isAdmin: userDisplayInfo.isAdmin
      };
    } catch (error) {
      console.error('Erro ao buscar informações do usuário:', error);
      return {
        id: userId,
        name: 'Usuário',
        avatar: `/images/default-avatar.png`,
        isAdmin: false
      };
    }
  }, []);

  /**
   * Converte notificação do banco para o formato do componente
   */
  const convertNotification = useCallback(async (dbNotification: any): Promise<NotificationItem> => {
    // Para notificações, o sender_id é sempre o usuário que enviou a mensagem
    let user: NotificationItem['user'] = undefined;
    
    if (dbNotification.sender_id) {
      // Buscar informações do usuário que enviou a mensagem (sender)
      user = await getUserInfo(dbNotification.sender_id);
    }

    // Gerar URL de redirecionamento usando o novo serviço
    const redirectUrl = NotificationRedirectService.generateRedirectUrl({
      type: dbNotification.type,
      orderId: dbNotification.order_id, // NOVO: Usar order_id da coluna
      subtitle: dbNotification.subtitle
    });

    return {
      id: dbNotification.id,
      title: dbNotification.title,
      subtitle: dbNotification.subtitle,
      content: dbNotification.content,
      type: dbNotification.type,
      user,
      createdAt: new Date(dbNotification.created_at),
      isRead: false, // Por enquanto, todas são consideradas não lidas
      relatedUrl: redirectUrl,
      orderId: dbNotification.order_id // NOVO: Incluir order_id no item
    };
  }, [getUserInfo]);

  /**
   * Carrega notificações do usuário atual
   */
  const loadNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));

      // Verificar se o usuário está autenticado
      const { data: user, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Erro de autenticação:', authError);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Erro de autenticação' 
        }));
        return;
      }

      if (!user.user) {
        console.log('Usuário não autenticado - mostrando estado vazio');
        setState({
          notifications: [],
          isLoading: false,
          hasUnread: false,
          unreadCount: 0,
          error: undefined
        });
        return;
      }

      console.log('Usuário autenticado:', user.user.id);

      // Buscar notificações filtradas (aplicando regras de negócio para chat)
      console.log('Buscando notificações...');
      const notifications = await ChatNotificationFilterService.getAllFilteredNotifications(
        user.user.id, 
        10 // Limite de 10 notificações mais recentes
      );

      console.log('Notificações encontradas:', notifications.length);

      // Converter para o formato do componente
      const convertedNotifications = await Promise.all(
        notifications.map(convertNotification)
      );

      // Filtro de segurança no frontend: verificar se o usuário atual é o sender
      // (não deve ver notificações que ele mesmo enviou)
      const secureNotifications = convertedNotifications.filter(notification => {
        // Buscar a notificação original para verificar o sender_id
        const originalNotification = notifications.find(n => n.id === notification.id);
        const isOwnMessage = originalNotification?.sender_id === user.user.id;
        
        if (isOwnMessage) {
          console.log(`🔒 Filtro de segurança: removendo notificação própria ${notification.id}`);
        }
        
        return !isOwnMessage; // Não mostrar notificações que o próprio usuário enviou
      });

      const unreadCount = secureNotifications.filter(n => !n.isRead).length;

      console.log(`📊 Notificações após filtro de segurança: ${secureNotifications.length}/${convertedNotifications.length}`);

      setState({
        notifications: secureNotifications,
        isLoading: false,
        hasUnread: unreadCount > 0,
        unreadCount,
        error: undefined
      });

    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: `Falha ao carregar notificações: ${errorMessage}`
      }));
    }
  }, [convertNotification]);

  /**
   * Marca uma notificação como lida
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      // Atualizar no estado local imediatamente
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      }));

      // TODO: Implementar quando tivermos campo is_read na tabela
      // await NotificationService.updateNotification(notificationId, { is_read: true });
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  }, []);

  /**
   * Marca todas as notificações como lidas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({ ...n, isRead: true })),
        hasUnread: false,
        unreadCount: 0
      }));

      // TODO: Implementar quando tivermos campo is_read na tabela
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  }, []);

  /**
   * Remove uma notificação da lista local
   */
  const removeNotification = useCallback((notificationId: string) => {
    setState(prev => {
      const filteredNotifications = prev.notifications.filter(n => n.id !== notificationId);
      const unreadCount = filteredNotifications.filter(n => !n.isRead).length;
      
      return {
        ...prev,
        notifications: filteredNotifications,
        hasUnread: unreadCount > 0,
        unreadCount
      };
    });
  }, []);

  /**
   * Recarrega as notificações
   */
  const refresh = useCallback(async () => {
    await loadNotifications();
  }, [loadNotifications]);

  // Carregar notificações ao montar o componente
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Polling para atualizar notificações periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, [loadNotifications]);

  return {
    state,
    actions: {
      loadNotifications,
      markAsRead,
      markAllAsRead,
      removeNotification,
      refresh
    }
  };
}
