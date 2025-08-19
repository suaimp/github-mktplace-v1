/**
 * Hook para gerenciar estado de conexão WebSocket
 * Responsabilidade única: Gerenciar estado e erros de conexão
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { ConnectionStateManager, ConnectionState } from '../../services/connection';

interface UseWebSocketConnectionProps {
  isModalOpen: boolean;
  onConnectionChange?: (isConnected: boolean) => void;
  onError?: (error: string | null) => void;
}

interface UseWebSocketConnectionReturn {
  connectionState: ConnectionState;
  connectionError: string | null;
  setConnected: (connected: boolean) => void;
  setConnecting: () => void;
  setReconnecting: () => void;
  setConnectionError: () => void;
  resetConnection: () => void;
  canRetry: boolean;
}

export function useWebSocketConnection({
  isModalOpen,
  onConnectionChange,
  onError
}: UseWebSocketConnectionProps): UseWebSocketConnectionReturn {
  
  const connectionManager = useRef(new ConnectionStateManager({
    maxReconnectAttempts: 5,
    reconnectDelayMs: 3000,
    showErrorThresholdMs: 2000
  }));

  const [connectionState, setConnectionState] = useState<ConnectionState>(
    connectionManager.current.getState()
  );
  
  const [connectionError, setConnectionErrorState] = useState<string | null>(null);

  /**
   * Atualiza estado interno e notifica mudanças
   */
  const updateState = useCallback(() => {
    const newState = connectionManager.current.getState();
    setConnectionState(newState);

    // Verifica se deve mostrar erro
    const error = connectionManager.current.shouldShowError(isModalOpen);
    const errorMessage = error?.shouldShowToUser ? error.message : null;
    
    setConnectionErrorState(errorMessage);

    // Notifica callbacks
    onConnectionChange?.(newState.isConnected);
    onError?.(errorMessage);
  }, [isModalOpen, onConnectionChange, onError]);

  /**
   * Define como conectado
   */
  const setConnected = useCallback((connected: boolean) => {
    connectionManager.current.setStatus(connected ? 'CONNECTED' : 'DISCONNECTED');
    updateState();
  }, [updateState]);

  /**
   * Define como conectando
   */
  const setConnecting = useCallback(() => {
    connectionManager.current.setStatus('CONNECTING');
    updateState();
  }, [updateState]);

  /**
   * Define como reconectando
   */
  const setReconnecting = useCallback(() => {
    const canRetry = connectionManager.current.incrementReconnectAttempts();
    connectionManager.current.setStatus(canRetry ? 'RECONNECTING' : 'ERROR');
    updateState();
  }, [updateState]);

  /**
   * Define erro de conexão
   */
  const setConnectionError = useCallback(() => {
    connectionManager.current.setStatus('ERROR');
    updateState();
  }, [updateState]);

  /**
   * Reset completo da conexão
   */
  const resetConnection = useCallback(() => {
    connectionManager.current.reset();
    updateState();
  }, [updateState]);

  /**
   * Determina se pode tentar reconectar
   */
  const canRetry = connectionState.reconnectAttempts < connectionState.maxReconnectAttempts;

  /**
   * Reset quando modal fecha
   */
  useEffect(() => {
    if (!isModalOpen) {
      resetConnection();
    }
  }, [isModalOpen, resetConnection]);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      connectionManager.current.dispose();
    };
  }, []);

  return {
    connectionState,
    connectionError,
    setConnected,
    setConnecting,
    setReconnecting,
    setConnectionError,
    resetConnection,
    canRetry
  };
}
