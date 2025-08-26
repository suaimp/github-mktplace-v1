/**
 * Serviço para avatar do usuário
 * Responsabilidade única: Gerenciar lógica de avatar (busca, fallback, etc.)
 * Princípio DRY: Reutilizar a mesma lógica do UserAvatar existente
 */

import { supabase } from '../../../../../lib/supabase';

// Avatar background colors (mesmas do UserAvatar)
const AVATAR_COLORS = [
  'bg-brand-500',   // Blue
  'bg-success-500', // Green
  'bg-error-500',   // Red
  'bg-warning-500', // Orange
  'bg-purple-500',  // Purple
  'bg-pink-500',    // Pink
  'bg-cyan-500',    // Cyan
  'bg-amber-500',   // Amber
  'bg-emerald-500', // Emerald
  'bg-indigo-500',  // Indigo
];

export interface UserAvatarData {
  imageUrl: string | null;
  initials: string;
  backgroundColor: string;
  hasImage: boolean;
}

/**
 * Determina qual tabela usar para buscar dados do usuário
 */
async function getUserTable(userId: string): Promise<'admins' | 'platform_users'> {
  // Check if user exists in admins table
  const { data: adminData } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (adminData) {
    return 'admins';
  }

  // If not admin, must be platform user
  return 'platform_users';
}

/**
 * Gera cor consistente baseada no userId
 */
function getColorForUser(userId: string): string {
  // Se userId está vazio, usar cor padrão para suporte
  if (!userId || userId.trim() === '' || userId === 'default') {
    return 'bg-warning-500'; // Cor laranja para suporte
  }
  
  const charSum = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[charSum % AVATAR_COLORS.length];
}

/**
 * Gera iniciais do nome
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .filter((_, index, arr) => index === 0 || index === arr.length - 1)
    .join('')
    .toUpperCase();
}

/**
 * Busca dados do avatar do usuário
 */
export async function getUserAvatarData(userId: string, userName: string): Promise<UserAvatarData> {
  const defaultData: UserAvatarData = {
    imageUrl: null,
    initials: getInitials(userName),
    backgroundColor: getColorForUser(userId || 'default'),
    hasImage: false
  };

  try {
    // Se não temos userId válido, retornar dados padrão imediatamente
    if (!userId || userId.trim() === '') {
      return defaultData;
    }
    
    // Determinar qual tabela usar
    const table = await getUserTable(userId);

    // Buscar dados do avatar
    const { data: avatarData, error } = await supabase
      .from(table)
      .select('avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return defaultData;
    }

    if (avatarData?.avatar_url) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(avatarData.avatar_url);
      
      // Verificação adicional para produção
      if (import.meta.env.MODE === 'production' && (publicUrl.includes('localhost') || publicUrl.includes('127.0.0.1'))) {
        return defaultData;
      }
      
      return {
        imageUrl: publicUrl,
        initials: getInitials(userName),
        backgroundColor: getColorForUser(userId),
        hasImage: true
      };
    }

    return defaultData;
  } catch (err) {
    return defaultData;
  }
}
