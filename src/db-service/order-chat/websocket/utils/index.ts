// Utilitários para WebSocket do order-chat

export const WebSocketUtils = {
  generateChannelName(orderItemId: string) {
    return `chat_${orderItemId}`;
  },
  calculateReconnectDelay(attempt: number) {
    // Exponencial backoff simples
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  },
  validateBroadcastMessage(payload: any) {
    return payload && typeof payload === 'object' && 'message' in payload;
  },
};
