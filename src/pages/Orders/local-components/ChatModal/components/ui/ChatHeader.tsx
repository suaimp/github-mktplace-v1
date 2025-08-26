/**
 * Componente ChatHeader
 * Responsabilidade única: Exibir cabeçalho do chat com informações do usuário
 * Agora usa o sistema de avatar do projeto
 */

import { chatStyles } from '../../styles';
import { ChatAvatar } from './ChatAvatar';
import { useUserAvatar } from '../../hooks/useUserAvatar';

interface ChatHeaderProps {
  userName: string;
  userId: string;
  productName?: string;
  isOnline: boolean;
  isConnected: boolean;
  isLoading: boolean;
  error?: string | null;
  onClose?: () => void;
}

export function ChatHeader({ 
  userName, 
  userId,
  productName,
  isOnline: _isOnline, 
  isConnected: _isConnected, 
  isLoading: _isLoading,
  error: _error,
  onClose 
}: ChatHeaderProps) {
  const { avatarData, isLoading: avatarLoading } = useUserAvatar({
    userId,
    userName,
    enabled: !!userId && !!userName
  });

  // Temporariamente comentado - funções de status online/offline
  /*
  const getStatusText = () => {
    if (error) return error;
    if (isLoading) return 'Conectando...';
    // if (!isConnected) return 'Desconectado';
    // return isOnline ? 'Online' : 'Offline';
    return ''; // Temporariamente removido
  };

  const getStatusColor = () => {
    if (error) return 'text-red-500 dark:text-red-400';
    if (isLoading) return 'text-yellow-500 dark:text-yellow-400';
    // if (!isConnected) return 'text-gray-400 dark:text-gray-500';
    return 'text-gray-400 dark:text-gray-500';
  };
  */

  return (
    <div className={chatStyles.header.wrapper}>
      <div className={chatStyles.header.userInfo}>
        {avatarLoading ? (
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        ) : (
          <ChatAvatar 
            avatarData={avatarData || {
              imageUrl: null,
              initials: userName
                .split(' ')
                .map(part => part[0])
                .filter((_, index, arr) => index === 0 || index === arr.length - 1)
                .join('')
                .toUpperCase(),
              backgroundColor: 'bg-blue-500',
              hasImage: false
            }} 
            size="md" 
          />
        )}

        <div>
          <h5 className={chatStyles.header.userName}>
            {userName}
          </h5>
          {productName && (
            <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
              {productName}
            </p>
          )}
          {/* Temporariamente comentado - status online/offline */}
          {/* <span className={`text-xs ${getStatusColor()}`}>
            {getStatusText()}
          </span> */}
        </div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          title="Fechar chat"
        >
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" 
            />
          </svg>
        </button>
      )}
    </div>
  );
}
