# Componentes da Tabela de Itens de Pedido

Esta estrutura modular segue os princípios SOLID, especialmente o princípio da responsabilidade única (SRP).

## Estrutura de Pastas

```
OrderItemsTable/
├── components/           # Componentes UI
│   ├── ChatButton.tsx   # Botão de chat com notificações
│   └── index.ts         # Exportações centralizadas
├── hooks/               # Lógica de negócio
│   └── useChatButtonNotifications.ts
├── types/               # Definições de tipos
│   └── chat-button.types.ts
└── README.md           # Documentação
```

## Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)
- **ChatButton.tsx**: Responsável apenas por renderizar o botão de chat
- **useChatButtonNotifications.ts**: Responsável apenas pela lógica de notificações
- **chat-button.types.ts**: Responsável apenas pelas definições de tipos

### Open/Closed Principle (OCP)
- Componente extensível via props sem modificação do código base
- Hook reutilizável em outros contextos

### Dependency Inversion Principle (DIP)
- Componente depende de abstrações (interfaces) não de implementações concretas
- Hook encapsula dependência do `useChatNotifications` original

## Componentes

### ChatButton
Botão de chat com indicador visual de novas mensagens.

**Props:**
- `orderItemId`: ID do item do pedido
- `onOpenChat`: Callback para abrir o chat
- `className?`: Classes CSS adicionais
- `disabled?`: Estado de desabilitação

**Funcionalidades:**
- Indicador visual pulsante para novas mensagens
- Loading state durante operações
- Auto-marca mensagens como lidas ao abrir chat

### useChatButtonNotifications
Hook para gerenciar notificações de chat.

**Retorna:**
- `hasNewMessages`: Boolean indicando novas mensagens
- `isLoading`: Boolean indicando carregamento
- `markAsRead`: Função para marcar mensagens como lidas
- `notifyNewMessage`: Função para notificar nova mensagem

## Uso

```tsx
import { ChatButton } from './OrderItemsTable/components';

<ChatButton
  orderItemId={item.id}
  onOpenChat={() => handleOpenChat(item)}
/>
```

## Benefícios da Estrutura

1. **Modularidade**: Cada arquivo tem uma responsabilidade específica
2. **Reutilização**: Componentes podem ser reutilizados em outros contextos
3. **Testabilidade**: Cada unidade pode ser testada independentemente
4. **Manutenibilidade**: Mudanças são isoladas e não afetam outros componentes
5. **DRY**: Reutiliza lógica existente sem duplicação
