# Sistema de Presença em Tempo Real - Chat Modal

## Visão Geral

Este documento descreve a arquitetura modular do sistema de presença em tempo real implementado para o chat modal, seguindo rigorosamente os princípios SOLID.

## Estrutura de Pastas

```
src/pages/Orders/local-components/ChatModal/
├── components/
│   └── presence/                    # Componentes visuais de presença
│       ├── types.ts                 # Tipos para componentes de presença
│       ├── PresenceIndicator.tsx    # Indicador visual (bolinha)
│       ├── PresenceStatusText.tsx   # Texto de status
│       ├── UserPresenceDisplay.tsx  # Componente combinado
│       └── index.ts                 # Barrel exports
├── hooks/
│   └── presence/
│       ├── status/                  # Hooks específicos de status
│       │   ├── useOtherUserPresence.ts  # Hook para presença do outro usuário
│       │   └── index.ts             # Exports do status
│       ├── useGlobalPresence.ts     # Presença global (existente)
│       ├── useChatPresence.ts       # Presença específica do chat (existente)
│       └── index.ts                 # Barrel exports
└── components/
    └── ChatModalWebSocket.tsx       # Componente principal atualizado
```

## Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)

- **PresenceIndicator**: Apenas exibe o indicador visual (bolinha colorida)
- **PresenceStatusText**: Apenas exibe o texto de status
- **UserPresenceDisplay**: Combina os dois componentes acima
- **useOtherUserPresence**: Gerencia apenas o estado de presença do outro usuário

### 2. Open/Closed Principle (OCP)

- Componentes extensíveis via props (size, showUserName, etc.)
- Novos tipos de indicadores podem ser adicionados sem modificar existentes
- Textos customizáveis via props

### 3. Liskov Substitution Principle (LSP)

- Interfaces consistentes entre componentes similares
- Hooks intercambiáveis com contratos bem definidos

### 4. Interface Segregation Principle (ISP)

- Interfaces específicas para cada responsabilidade:
  - `PresenceIndicatorProps`: Apenas para indicador visual
  - `PresenceStatusTextProps`: Apenas para texto
  - `UserPresenceStatus`: Dados puros de presença

### 5. Dependency Inversion Principle (DIP)

- Componentes dependem de abstrações (types/interfaces)
- Hooks usam serviços injetados (UserPresenceService)
- Baixo acoplamento entre camadas

## Funcionalidades Implementadas

### ✅ Prevenção do Flash "Online"

- **Problema**: Status mostrava "Online" antes de verificar presença real
- **Solução**: Estado `isLoading` previne exibição prematura
- **Loading State**: Exibe "Verificando..." com animação pulse

### ✅ Verificação Correta de Status

- **Antes**: Lógica simplificada com falsos positivos
- **Agora**: Verificação robusta via `UserPresenceService.getOnlineUsersForChat()`
- **Filtragem**: Exclui usuário atual da lista de "outros usuários"

### ✅ Interface Consistente

- **Loading**: Animação pulse durante verificação
- **Offline**: Indicador cinza + texto "Usuário offline"
- **Online**: Indicador verde + texto "Nome do usuário online"
- **Desconectado**: Indicador vermelho + texto "Desconectado"

### ✅ Nomes de Usuário Dinâmicos

- Extrai nome do email (parte antes do @)
- Fallback para "Usuário" se email não disponível
- Opção `showUserName` para controlar exibição

## Como Usar

### Componente Básico

```tsx
import { UserPresenceDisplay } from './presence';

<UserPresenceDisplay 
  status={presenceStatus}
  isConnected={chatState.isConnected}
  showUserName={true}
  showIndicator={true}
  showText={true}
  size="md"
/>
```

### Hook de Presença

```tsx
import { useOtherUserPresence } from '../hooks/presence';

const { presenceStatus } = useOtherUserPresence({
  orderItemId,
  isConnected: chatState.isConnected
});
```

## Estados Possíveis

| Estado | Indicador | Texto | Descrição |
|--------|-----------|-------|-----------|
| Loading | Pulse cinza | "Verificando..." | Carregando status |
| Desconectado | Vermelho | "Desconectado" | Sem conexão WebSocket |
| Online | Verde | "Nome online" | Outro usuário ativo |
| Offline | Cinza | "Nome offline" | Outro usuário inativo |

## Configurações

### Polling de Presença

```tsx
const { presenceStatus } = useOtherUserPresence({
  orderItemId,
  isConnected: chatState.isConnected,
  refreshInterval: 30000 // 30 segundos (padrão)
});
```

### Customização Visual

```tsx
<UserPresenceDisplay 
  status={presenceStatus}
  isConnected={isConnected}
  showUserName={false}     // Ocultar nome
  showIndicator={true}     // Mostrar bolinha
  showText={false}         // Ocultar texto
  size="lg"               // Tamanho grande
/>
```

## Melhorias Futuras

1. **Cache de Presença**: Evitar polling excessivo
2. **WebSocket Real-time**: Atualização instantânea via presença Supabase
3. **Múltiplos Usuários**: Suporte a mais de 2 usuários no chat
4. **Histórico de Atividade**: "Visto por último às 14:30"
5. **Indicadores de Digitação**: Integração com typing indicators

## Dependências

- **UserPresenceService**: Serviço global para CRUD de presença
- **Supabase Auth**: Obtenção do usuário atual
- **React Hooks**: useState, useEffect, useCallback
- **TypeScript**: Tipagem forte e contratos de interface
