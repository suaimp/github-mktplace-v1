# Serviço de Notificações

Este módulo implementa o sistema de notificações para o chat do marketplace, seguindo os princípios SOLID e DRY.

## Estrutura

```
src/db-service/notifications/
├── index.ts                          # Exportações principais
├── types.ts                          # Interfaces e tipos
├── notificationService.ts            # CRUD básico de notificações
├── chatNotificationService.ts        # Lógica específica do chat
└── __tests__/
    └── notificationService.test.ts   # Testes unitários
```

## Funcionalidades

### 1. NotificationService
Responsabilidade única: Operações CRUD na tabela `notifications`

- `createNotification()` - Cria uma notificação
- `getNotifications()` - Busca notificações com filtros
- `updateNotification()` - Atualiza uma notificação
- `deleteNotification()` - Remove uma notificação
- `getUserNotifications()` - Notificações de um usuário
- `countUserNotifications()` - Conta notificações

### 2. ChatNotificationService
Responsabilidade única: Lógica de notificações do chat

- `sendChatNotifications()` - Processa e envia notificações
- `createChatNotification()` - Cria notificação de chat
- `getNotificationRecipients()` - Determina destinatários

## Como Funciona

### Fluxo de Notificação no Chat

1. **Cliente envia mensagem** → Notifica todos os **admins**
2. **Admin envia mensagem** → Notifica o **cliente** do pedido

### Integração Automática

O serviço é integrado automaticamente no `OrderChatService.createMessage()`:

```typescript
// Ao enviar uma mensagem no chat, uma notificação é criada automaticamente
await OrderChatService.createMessage({
  order_id: "12345",
  order_item_id: "item-123",
  message: "Olá, preciso de ajuda",
  sender_type: "user"
});
// ✅ Notificação criada automaticamente para admins
```

### Dados da Notificação

Cada notificação de chat contém:

- **title**: "Nova mensagem do cliente" ou "Nova mensagem do suporte"
- **subtitle**: "Pedido #12345" (ID do pedido)
- **content**: Texto da mensagem enviada
- **type**: "chat"
- **user_id**: ID do destinatário

### Políticas RLS

A tabela `notifications` possui RLS habilitado:
- Usuários só veem suas próprias notificações
- CRUD limitado ao próprio usuário autenticado

## Uso Manual (se necessário)

```typescript
import { NotificationService, ChatNotificationService } from '../db-service/notifications';

// Buscar notificações de um usuário
const notifications = await NotificationService.getUserNotifications('user-id');

// Enviar notificação de chat manualmente
await ChatNotificationService.sendChatNotifications({
  orderId: '12345',
  orderItemId: 'item-123',
  senderId: 'sender-id',
  senderType: 'user',
  message: 'Mensagem de teste',
  recipientId: '' // Será determinado automaticamente
});
```

## Vantagens da Implementação

### ✅ Princípios SOLID
- **S**: Cada classe tem uma responsabilidade única
- **O**: Aberto para extensão, fechado para modificação
- **L**: Substituição de Liskov respeitada
- **I**: Interfaces segregadas por funcionalidade
- **D**: Dependência de abstrações, não implementações

### ✅ Princípio DRY
- Lógica de notificação centralizada
- Reutilização entre diferentes tipos de chat
- Evita duplicação de código

### ✅ Modularidade
- Pastas organizadas por funcionalidade
- Fácil manutenção e teste
- Expansível para outros tipos de notificação

## Extensibilidade Futura

Para adicionar novos tipos de notificação:

1. Criar novo serviço específico (ex: `orderNotificationService.ts`)
2. Usar o `NotificationService` como base
3. Implementar lógica específica do novo tipo
4. Exportar no `index.ts`

## Testes

Execute os testes com:
```bash
npm test -- notificationService.test.ts
```

## Dependências

- `supabase` - Cliente do banco de dados
- Tabelas: `notifications`, `notification_types`, `admins`, `roles`, `orders`
