/**
 * Hook para gerenciar dados do avatar
 * Responsabilidade única: Gerenciar estado e loading do avatar
 * Reutilização: Pode ser usado em qualquer componente que precise de avatar
 */

import { useState, useEffect } from 'react';
import { getUserAvatarData, UserAvatarData } from '../services/userAvatarService';
import { UserDisplayService } from '../../../../../components/header/NotificationDropdown/services/userDisplayService';

interface UseUserAvatarOptions {
  userId: string;
  userName: string;
  enabled?: boolean;
}

export interface ExtendedUserAvatarData extends UserAvatarData {
  realName?: string; // Nome real do usuário do banco de dados
}

export function useUserAvatar({ userId, userName, enabled = true }: UseUserAvatarOptions) {
  const [avatarData, setAvatarData] = useState<ExtendedUserAvatarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !userId || !userName) return;

    let isMounted = true;
    setIsLoading(true);

    // Buscar tanto dados do avatar quanto informações completas do usuário
    Promise.all([
      getUserAvatarData(userId, userName),
      UserDisplayService.getUserDisplayInfo(userId)
    ])
      .then(([avatarInfo, userInfo]) => {
        if (isMounted) {
          setAvatarData({
            ...avatarInfo,
            realName: userInfo.name // Adiciona o nome real do usuário
          });
        }
      })
      .catch((err) => {
        console.error('Error in useUserAvatar:', err);
        if (isMounted) {
          // Fallback para dados básicos em caso de erro
          setAvatarData({
            imageUrl: null,
            initials: userName
              .split(' ')
              .map(part => part[0])
              .filter((_, index, arr) => index === 0 || index === arr.length - 1)
              .join('')
              .toUpperCase(),
            backgroundColor: 'bg-brand-500',
            hasImage: false,
            realName: userName // Fallback para o nome fornecido
          });
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, userName, enabled]);

  return {
    avatarData,
    isLoading
  };
}
