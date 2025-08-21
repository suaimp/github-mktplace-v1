/**
 * Componente Avatar do Usuário para Notificações
 * Responsabilidade única: Exibir avatar do usuário em notificações
 * Princípio DRY: Reutiliza lógica de avatar mas simplificada para notificações
 */

import { useState } from 'react';

interface NotificationUserAvatarProps {
  user?: {
    id: string;
    name: string;
    avatar?: string | null;
    isAdmin?: boolean;
  };
  size?: number;
}

// Avatar background colors (usando cores mais básicas para evitar problemas)
const AVATAR_COLORS = [
  'bg-blue-500',    // Blue
  'bg-green-500',   // Green
  'bg-red-500',     // Red
  'bg-orange-500',  // Orange
  'bg-purple-500',  // Purple
  'bg-pink-500',    // Pink
  'bg-cyan-500',    // Cyan
  'bg-yellow-500',  // Yellow
  'bg-emerald-500', // Emerald
  'bg-indigo-500',  // Indigo
];

// Get consistent color based on user ID (mesma lógica do UserAvatar)
const getColorForUser = (userId: string) => {
  const charSum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[charSum % AVATAR_COLORS.length];
};

// Get initials from name (mesma lógica do UserAvatar)
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(part => part[0])
    .filter((_, index, arr) => index === 0 || index === arr.length - 1)
    .join('')
    .toUpperCase();
};

export function NotificationUserAvatar({ 
  user, 
  size = 40 
}: NotificationUserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Se não tem user, usar fallback genérico
  if (!user) {
    return (
      <div 
        className="bg-gray-300 rounded-full flex items-center justify-center text-gray-600"
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.4 }}>?</span>
      </div>
    );
  }

  // Se tem avatar e não deu erro, tentar exibir
  if (user.avatar && !imageError) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        onError={() => {
          console.log('❌ [NotificationUserAvatar] Image error, falling back to initials:', user.avatar);
          setImageError(true);
        }}
        onLoad={() => console.log('✅ [NotificationUserAvatar] Image loaded:', user.avatar)}
      />
    );
  }

  // Fallback: usar initials com cor baseada no ID
  const bgColor = getColorForUser(user.id);
  const initials = getInitials(user.name);
  
  return (
    <div 
      className={`${bgColor} rounded-full flex items-center justify-center text-white font-medium`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}