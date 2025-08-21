/**
 * Tipos para o serviço de usuário
 */

export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  isAdmin: boolean;
}
