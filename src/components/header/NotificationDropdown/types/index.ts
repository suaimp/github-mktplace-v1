/**
 * Tipos para o componente NotificationDropdown
 * Responsabilidade única: Definir interfaces para notificações do header
 */

export interface NotificationUser {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
  isAdmin?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  subtitle?: string;
  content?: string;
  type: 'chat' | 'purchase' | 'system';
  user?: NotificationUser;
  createdAt: Date;
  isRead?: boolean;
  relatedUrl?: string;
  orderId?: string; // NOVO: ID do pedido para redirecionamento específico
}

export interface NotificationDropdownState {
  notifications: NotificationItem[];
  isLoading: boolean;
  hasUnread: boolean;
  unreadCount: number;
  error?: string;
}

export interface NotificationFilters {
  type?: 'chat' | 'purchase' | 'system';
  isRead?: boolean;
  limit?: number;
}

export interface UseNotificationsReturn {
  state: NotificationDropdownState;
  actions: {
    loadNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refresh: () => Promise<void>;
  };
}
