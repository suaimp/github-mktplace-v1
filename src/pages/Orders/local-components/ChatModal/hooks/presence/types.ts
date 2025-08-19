/**
 * Tipos para sistema de presença de usuários
 * Responsabilidade única: Definir interfaces para presença
 */

import { UserPresence } from '../../../../../../db-service/order-chat';

/**
 * Status de presença do usuário
 */
export type PresenceStatus = 'online' | 'offline' | 'typing' | 'idle';

/**
 * Evento de mudança de presença
 */
export interface PresenceChangeEvent {
  userId: string;
  status: PresenceStatus;
  timestamp: string;
  orderItemId: string;
}

/**
 * Props para hook de presença global
 */
export interface UseGlobalPresenceProps {
  userId: string;
  userEmail?: string;
  onPresenceChange?: (event: PresenceChangeEvent) => void;
}

/**
 * Props para hook de presença por chat
 */
export interface UseChatPresenceProps {
  orderItemId: string;
  onlineUsers?: UserPresence[];
  onPresenceUpdate?: (users: UserPresence[]) => void;
}

/**
 * Retorno do hook de presença global
 */
export interface UseGlobalPresenceReturn {
  setOnline: () => Promise<void>;
  setOffline: () => Promise<void>;
  setTyping: () => Promise<void>;
  setIdle: () => Promise<void>;
  currentStatus: PresenceStatus;
  isOnline: boolean;
}

/**
 * Retorno do hook de presença por chat
 */
export interface UseChatPresenceReturn {
  otherUsersOnline: UserPresence[];
  isOtherUserOnline: boolean;
  otherUsersCount: number;
}
