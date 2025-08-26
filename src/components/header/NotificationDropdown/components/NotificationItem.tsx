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
  onRemove: (id: string) => void;
}

export function NotificationItemComponent({ 
  notification, 
  onClose, 
  onMarkAsRead,
  onRemove 
}: NotificationItemComponentProps) {
  const { handleNotificationClick } = useNotificationClick();

  const handleClick = async () => {
    await handleNotificationClick(notification, onMarkAsRead, onClose, onRemove);
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

  // Função para truncar o conteúdo da mensagem
  const truncateContent = (content: string, maxLength: number = 40): string => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <li>
      <DropdownItem
        onItemClick={handleClick}
        className={`flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5 max-w-[320px] ${
          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
        }`}
      >
        <NotificationUserAvatar
          user={notification.user}
          size={40}
        />

        <span className="block flex-1 min-w-0">
          {/* Subtitle em negrito com pontinho e time ao lado */}
          {notification.subtitle && (
            <div className="mb-1 flex items-center gap-2">
              <span className="text-theme-sm max-[400px]:text-xs font-bold text-gray-800 dark:text-white/90 truncate">
                {formatSubtitle(notification.subtitle)}
              </span>
              <span className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
              <span className="text-theme-xs max-[400px]:text-[10px] text-gray-500 dark:text-gray-400 flex-shrink-0">
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>
          )}

          {/* Nome do usuário */}
          {notification.user && (
            <span className="mb-1 block text-theme-xs max-[400px]:text-[10px] font-medium text-blue-600 dark:text-blue-400 truncate">
              {notification.user.name}
            </span>
          )}

          {/* Content - truncado em 1 linha */}
          {notification.content && (
            <p className="text-theme-xs max-[400px]:text-[10px] text-gray-600 dark:text-gray-400 truncate">
              {truncateContent(notification.content)}
            </p>
          )}
        </span>
      </DropdownItem>
    </li>
  );
}
