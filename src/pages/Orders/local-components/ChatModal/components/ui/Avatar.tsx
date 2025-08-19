/**
 * Componente Avatar para o Chat
 * Responsabilidade única: Exibir avatar do usuário com indicador de status
 */

import { chatStyles } from '../../styles';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'small' | 'medium';
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export function Avatar({ 
  src, 
  alt, 
  size = 'medium', 
  showStatus = false, 
  isOnline = false,
  className = '' 
}: AvatarProps) {
  const sizeClasses = {
    small: 'h-10 w-full max-w-10',
    medium: 'h-12 w-full max-w-[48px]'
  };

  const containerClass = size === 'small' 
    ? `${sizeClasses.small} rounded-full ${className}`
    : `${chatStyles.header.avatar.container} ${className}`;

  return (
    <div className={containerClass}>
      <img 
        src={src} 
        alt={alt} 
        className={chatStyles.header.avatar.image}
      />
      {showStatus && (
        <span 
          className={`${chatStyles.header.avatar.statusIndicator} ${
            isOnline ? chatStyles.states.online : chatStyles.states.offline
          }`}
        />
      )}
    </div>
  );
}
