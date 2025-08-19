/**
 * Avatar para uso no chat
 * Responsabilidade única: Renderizar avatar com dados fornecidos
 * Extensibilidade: Interface padronizada para avatars
 */

import React, { useState } from 'react';
import { UserAvatarData } from '../../services/userAvatarService';

interface ChatAvatarProps {
  avatarData: UserAvatarData;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_SIZES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base'
};

export const ChatAvatar: React.FC<ChatAvatarProps> = ({ 
  avatarData, 
  size = 'md',
  className = '' 
}) => {
  const [imageError, setImageError] = useState(false);
  const sizeClasses = AVATAR_SIZES[size];

  // Se a imagem falhou ou não existe, mostrar iniciais
  if (!avatarData.hasImage || !avatarData.imageUrl || imageError) {
    return (
      <div
        className={`${sizeClasses} ${avatarData.backgroundColor} rounded-full flex items-center justify-center text-white font-medium ${className}`}
      >
        {avatarData.initials}
      </div>
    );
  }

  return (
    <img
      src={avatarData.imageUrl}
      alt="Avatar"
      className={`${sizeClasses} rounded-full object-cover ${className}`}
      onError={() => setImageError(true)}
    />
  );
};
