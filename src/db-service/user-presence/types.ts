/**
 * Tipos para serviço de presença de usuários
 * Responsabilidade única: Definir interfaces para persistência de presença
 */

/**
 * Status de presença do usuário
 */
export type UserPresenceStatus = 'online' | 'offline' | 'typing' | 'idle';

/**
 * Interface para presença de usuário
 */
export interface UserPresenceData {
  user_id: string;
  email?: string;
  status: UserPresenceStatus;
  last_seen: string;
  online_at?: string;
  order_item_id?: string;
}

/**
 * Input para criar/atualizar presença
 */
export interface CreateUserPresenceInput {
  userId: string;
  email?: string;
  status: UserPresenceStatus;
  orderItemId?: string;
}

/**
 * Input para buscar presença
 */
export interface GetUserPresenceInput {
  userId?: string;
  orderItemId?: string;
  status?: UserPresenceStatus;
}

/**
 * Callback para mudanças de presença
 */
export interface PresenceChangeCallback {
  (presence: UserPresenceData[]): void;
}
