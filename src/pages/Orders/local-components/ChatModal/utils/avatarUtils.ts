/**
 * Utilitários para avatar do usuário
 * Responsabilidade única: Gerar avatares para usuários
 */

/**
 * Gera avatar com iniciais do nome
 */
export function generateAvatarFromName(name: string): string {
  if (!name) return '/images/user/user-17.jpg';
  
  // Por enquanto retorna avatar padrão, mas poderia gerar avatar com iniciais
  // const initials = name.split(' ').map(word => word.charAt(0).toUpperCase()).slice(0, 2).join('');
  return `/images/user/user-17.jpg`;
}

/**
 * Gera avatar baseado no email usando Gravatar
 */
export function generateGravatarUrl(email: string): string {
  if (!email) return '/images/user/user-17.jpg';
  
  // Simples hash MD5 seria necessário aqui, mas por simplicidade
  // vamos usar o avatar padrão por enquanto
  return '/images/user/user-17.jpg';
}

/**
 * Obtém avatar do usuário com fallbacks
 */
export function getUserAvatar(name?: string, email?: string, avatarUrl?: string): string {
  // 1. Se tem URL de avatar, usa ela
  if (avatarUrl) return avatarUrl;
  
  // 2. Tenta gerar do email (Gravatar)
  if (email) return generateGravatarUrl(email);
  
  // 3. Tenta gerar do nome (iniciais)
  if (name) return generateAvatarFromName(name);
  
  // 4. Fallback para avatar padrão
  return '/images/user/user-17.jpg';
}
