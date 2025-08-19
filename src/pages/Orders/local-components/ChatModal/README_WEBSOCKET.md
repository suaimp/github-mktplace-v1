# Chat WebSocket - Documentação de Implementação

## 📋 Visão Geral

Sistema de chat em tempo real implementado com WebSocket usando Supabase Realtime Broadcast, seguindo os princípios SOLID e arquitetura modular.

## 🏗️ Arquitetura

### 📁 Estrutura de Pastas

```
src/
├── db-service/
│   └── order-chat/
│       ├── websocket/              # 🆕 Nova implementação WebSocket
│       │   ├── types.ts            # Tipos específicos WebSocket
│       │   ├── config.ts           # Configurações e constantes
│       │   ├── utils.ts            # Utilitários WebSocket
│       │   ├── channelManager.ts   # Gerenciador de canais
│       │   ├── orderChatWebSocketService.ts  # Serviço principal
│       │   └── index.ts            # Exportações
│       ├── orderChatService.ts     # Serviço tradicional (mantido)
│       ├── types.ts               # Tipos do banco de dados
│       └── index.ts               # Exportações principais
└── pages/Orders/local-components/ChatModal/
    ├── hooks/
    │   ├── websocket/              # 🆕 Hooks WebSocket
    │   │   ├── types.ts            # Tipos dos hooks
    │   │   ├── useChatWebSocket.ts # Hook principal
    │   │   ├── useTypingIndicator.ts # Hook de digitação
    │   │   ├── useUserPresence.ts  # Hook de presença
    │   │   └── index.ts            # Exportações
    │   ├── useChat.ts             # Hook tradicional (mantido)
    │   ├── useChatModal.ts        # Hook modal tradicional
    │   └── index.ts               # Exportações
    ├── components/
    │   ├── ChatModalWebSocket.tsx  # 🆕 Componente WebSocket
    │   ├── ChatModal.tsx          # Componente tradicional (mantido)
    │   ├── ChatButton.tsx         # Componente botão
    │   └── index.ts               # Exportações
    ├── examples/
    │   └── WebSocketUsage.tsx     # 🆕 Exemplos de uso
    └── types/                     # Tipos do ChatModal
```

## 🚀 Principais Melhorias

### ✅ Vantagens do WebSocket vs Sistema Atual

| Recurso | Sistema Atual | WebSocket |
|---------|---------------|-----------|
| **Latência** | ~500ms-2s | ~50-100ms |
| **Carga no DB** | Alta (polling) | Baixa (eventos) |
| **Indicadores de Digitação** | ❌ | ✅ |
| **Presença Online** | ❌ | ✅ |
| **Reconexão Automática** | ❌ | ✅ |
| **Acknowledgment** | ❌ | ✅ |
| **Escalabilidade** | Limitada | Alta |

### 🆕 Novas Funcionalidades

- **⌨️ Indicadores de Digitação** - Mostra quando outros usuários estão digitando
- **👥 Presença Online** - Lista usuários online no chat
- **🔄 Reconexão Automática** - Reconecta automaticamente em caso de perda de conexão
- **📱 Status Visual** - Indicadores visuais de conexão e estado
- **⚡ Feedback Imediato** - Mensagens aparecem instantaneamente
- **🔧 Configuração Flexível** - Fácil ativação/desativação de recursos

## 📊 Princípios SOLID Aplicados

### 1. **Single Responsibility Principle (SRP)**

- `OrderChatWebSocketService`: Apenas comunicação WebSocket
- `WebSocketChannelManager`: Apenas gerenciamento de canais
- `useChatWebSocket`: Apenas estado do chat
- `useTypingIndicator`: Apenas indicadores de digitação
- `useUserPresence`: Apenas presença de usuários

### 2. **Open/Closed Principle (OCP)**

- Sistema extensível via configuração
- Novos tipos de eventos podem ser adicionados
- Callbacks configuráveis para diferentes comportamentos

### 3. **Liskov Substitution Principle (LSP)**

- `ChatModalWebSocket` pode substituir `ChatModal`
- Mesma interface `ChatModalProps`
- Comportamento compatível

### 4. **Interface Segregation Principle (ISP)**

- Interfaces específicas para cada funcionalidade
- `WebSocketCallbacks`, `ChannelConfig`, `TypingIndicator`
- Clientes usam apenas o que precisam

### 5. **Dependency Inversion Principle (DIP)**

- Hooks dependem de abstrações (interfaces)
- Serviços injetados via hooks
- Fácil teste e substituição

## 🔧 Como Usar

### 1. **Uso Básico**

```tsx
import { ChatModalWebSocket } from './ChatModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ChatModalWebSocket
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      orderId="order-123"
      orderItemId="item-456"
      entryId="entry-789"
      orderItemData={itemData}
    />
  );
}
```

### 2. **Hook Avançado**

```tsx
import { useChatWebSocket } from './ChatModal';

function CustomChat({ orderId, orderItemId }) {
  const { 
    chatState, 
    error, 
    sendMessage, 
    startTyping, 
    stopTyping 
  } = useChatWebSocket({
    orderId,
    orderItemId,
    isOpen: true
  });

  return (
    <div>
      <div>Status: {chatState.connectionStatus}</div>
      <div>Online: {chatState.onlineUsers.length}</div>
      <div>Digitando: {chatState.typingUsers.join(', ')}</div>
      {/* ... resto da UI */}
    </div>
  );
}
```

### 3. **Migração Gradual**

```tsx
import { AdaptiveChatModal } from './examples/WebSocketUsage';

function OrderItemsTable() {
  const useWebSocket = shouldUseWebSocket(); // Feature flag

  return (
    <AdaptiveChatModal
      useWebSocket={useWebSocket}
      isOpen={chatOpen}
      orderId={orderId}
      orderItemId={orderItemId}
      // ... outras props
    />
  );
}
```

## ⚙️ Configuração

### 1. **Configurações WebSocket**

```typescript
// src/db-service/order-chat/websocket/config.ts
export const WEBSOCKET_CONFIG = {
  RECONNECT_INTERVAL: 5000,      // Intervalo de reconexão
  MAX_RECONNECT_ATTEMPTS: 5,     // Máximo de tentativas
  HEARTBEAT_INTERVAL: 30000,     // Heartbeat para manter conexão
  MESSAGE_TIMEOUT: 10000,        // Timeout para mensagens
  TYPING_TIMEOUT: 3000,          // Timeout para digitação
};
```

### 2. **Configuração do Canal**

```typescript
await OrderChatWebSocketService.connectToChat(
  orderItemId,
  callbacks,
  {
    enablePresence: true,    // Presença de usuários
    enableTyping: true,      // Indicadores de digitação
    selfBroadcast: false     // Receber próprias mensagens
  }
);
```

## 🔄 Estratégia de Migração

### Fase 1: **Implementação Paralela** ✅
- [x] Novo sistema WebSocket implementado
- [x] Sistema tradicional mantido
- [x] Estrutura modular criada

### Fase 2: **Testes A/B** 🔄
- [ ] Feature flag para alternar sistemas
- [ ] Testes com usuários específicos
- [ ] Monitoramento de performance

### Fase 3: **Migração Gradual** 📋
- [ ] Migração por funcionalidade
- [ ] Feedback dos usuários
- [ ] Ajustes finos

### Fase 4: **Depreciação** 📋
- [ ] Remoção do sistema tradicional
- [ ] Cleanup do código legado
- [ ] Documentação final

## 🧪 Testes

### 1. **Testes Unitários**

```bash
# Testar serviços WebSocket
npm test -- websocket

# Testar hooks
npm test -- hooks/websocket

# Testar componentes
npm test -- ChatModalWebSocket
```

### 2. **Testes de Integração**

```bash
# Testar conexão WebSocket
npm test -- integration/websocket

# Testar fluxo completo
npm test -- integration/chat-flow
```

### 3. **Testes de Performance**

```bash
# Benchmark de latência
npm run test:performance

# Teste de carga
npm run test:load
```

## 📈 Monitoramento

### 1. **Métricas Importantes**

- Latência de mensagens
- Taxa de reconexão
- Usuários simultâneos
- Erros de conexão

### 2. **Logs**

```typescript
// Configurar logs para debug
OrderChatWebSocketService.enableDebugLogs(true);
```

### 3. **Health Check**

```typescript
// Verificar status de conexões
const connectedChats = OrderChatWebSocketService.getConnectedChats();
console.log('Chats conectados:', connectedChats.length);
```

## 🔧 Troubleshooting

### 1. **Problemas Comuns**

| Problema | Causa | Solução |
|----------|-------|---------|
| Não conecta | Token inválido | Verificar autenticação |
| Mensagens duplicadas | Self-broadcast ativo | Configurar `selfBroadcast: false` |
| Reconexão falha | Limite atingido | Aumentar `MAX_RECONNECT_ATTEMPTS` |
| Indicadores presos | Timeout não configurado | Verificar `TYPING_TIMEOUT` |

### 2. **Debug**

```typescript
// Ativar logs detalhados
console.log('Chat State:', chatState);
console.log('Connection Status:', getConnectionStatus(orderItemId));
console.log('Online Users:', onlineUsers);
```

## 📚 Referências

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [WebSocket Best Practices](https://supabase.com/docs/guides/realtime/concepts)
- [Princípios SOLID](https://en.wikipedia.org/wiki/SOLID)

## 🤝 Contribuição

1. Siga os princípios SOLID
2. Mantenha responsabilidade única
3. Documente mudanças
4. Teste antes de commitar
5. Use TypeScript rigorosamente
