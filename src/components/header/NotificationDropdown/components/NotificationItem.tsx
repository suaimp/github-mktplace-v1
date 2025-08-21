/**
 * Componente individual de notificação
 * Responsabilidade única: Renderizar uma notificação específica
 */

import { NotificationItem } from '../types';
import { DropdownItem } from '../../../ui/dropdown/DropdownItem';
import { NotificationUserAvatar } from './NotificationUserAvatar';
import { useNotificationClick } from '../hooks/useNotificationClick';

interface NotificationItemComponentProps {
  notification: NotificationItem;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationItemComponent({ 
  notification, 
  onClose, 
  onMarkAsRead 
}: NotificationItemComponentProps) {
  const { handleNotificationClick } = useNotificationClick();

  const handleClick = () => {
    handleNotificationClick(notification, onMarkAsRead, onClose);
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} dia${diffInDays > 1 ? 's' : ''} atrás`;
  };

  const formatSubtitle = (subtitle: string): string => {
    // Extrair os primeiros caracteres do ID (antes do primeiro hífen)
    const firstGroup = subtitle.split('-')[0];
    return `Pedido: ${firstGroup}`;
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'chat': return 'Chat';
      case 'purchase': return 'Pedido';
      case 'system': return 'Sistema';
      default: return 'Notificação';
    }
  };

  return (
    <li>
      <DropdownItem
        onItemClick={handleClick}
        className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 ${
          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
        }`}
      >
        <NotificationUserAvatar
          user={notification.user}
          size={40}
        />

        <span className="block flex-1">
          {/* Título */}
          <span className="mb-1 block text-theme-sm font-medium text-gray-800 dark:text-white/90">
            {notification.title}
          </span>
          
          {/* Subtitle embaixo do título */}
          {notification.subtitle && (
            <span className="mb-2 block text-theme-xs font-medium text-gray-600 dark:text-gray-300">
              {formatSubtitle(notification.subtitle)}
            </span>
          )}

          {/* Nome do usuário acima do content */}
          {notification.user && (
            <span className="mb-1 block text-theme-xs font-medium text-blue-600 dark:text-blue-400">
              {notification.user.name}
            </span>
          )}

          {/* Content */}
          {notification.content && (
            <p className="mb-2 text-theme-xs text-gray-600 dark:text-gray-400 line-clamp-2">
              {notification.content}
            </p>
          )}

          <span className="flex items-center gap-2 text-gray-500 text-theme-xs dark:text-gray-400">
            <span>{getTypeLabel(notification.type)}</span>
            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
            <span>{formatTimeAgo(notification.createdAt)}</span>
          </span>
        </span>
      </DropdownItem>
    </li>
  );
}
