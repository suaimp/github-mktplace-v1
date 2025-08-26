// Listener oficial de status do Supabase para WebSocket
import { WebSocketCallbacks } from '../types';

/**
 * Utilitário para ser usado como callback do .subscribe(status => ...) do Supabase
 */
export function handleChannelStatusCallback(
  status: string,
  callbacks: WebSocketCallbacks
) {
  if (status === 'SUBSCRIBED') {
    callbacks.onConnectionChange?.(true);
  } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
    callbacks.onConnectionChange?.(false);
    callbacks.onError?.(`Status do canal: ${status}`);
  }
}
