# Controle de Visibilidade da Coluna de Chat

Esta funcionalidade implementa o controle de visibilidade da coluna de chat na tabela de itens do pedido baseado no status do pagamento.

## Arquitetura

### Estrutura de Pastas

```
OrderItemsTable/
├── hooks/
│   ├── __tests__/
│   │   └── useChatColumnVisibility.test.ts
│   ├── useChatColumnVisibility.ts
│   └── index.ts
├── services/
├── types/
├── utils/
└── index.ts
```

### Princípios Aplicados

- **SOLID**: Responsabilidade única aplicada na separação de hooks, serviços e tipos
- **DRY**: Lógica centralizada em um hook reutilizável
- **Modularidade**: Cada funcionalidade em sua pasta específica

## Funcionalidade

### Hook: `useChatColumnVisibility`

**Localização**: `src/pages/Orders/local-components/OrderItemsTable/hooks/useChatColumnVisibility.ts`

**Responsabilidade**: Controlar a visibilidade da coluna de chat baseado no status do pagamento.

#### API

```typescript
const { shouldShowChatColumn } = useChatColumnVisibility(paymentStatus);
```

#### Parâmetros

- `paymentStatus` (string | undefined): Status do pagamento do pedido

#### Retorno

- `shouldShowChatColumn` (boolean): Indica se a coluna de chat deve ser exibida

#### Lógica

- **Esconde** a coluna quando `paymentStatus === 'pagamento pendente'`
- **Mostra** a coluna para todos os outros casos (incluindo undefined/null)

### Implementação

A funcionalidade foi aplicada em dois contextos:

1. **Tabela Desktop**: Header e células da tabela principal
2. **Versão Mobile/Responsiva**: Seção de actions nos cards

#### Locais de Aplicação

1. **Header da tabela** (linha ~361):
```tsx
{shouldShowChatColumn && (
  <th className="px-4 py-3 text-left...">
    {/* Sem título conforme solicitado */}
  </th>
)}
```

2. **Células da tabela** (linha ~743):
```tsx
{shouldShowChatColumn && (
  <td className="whitespace-nowrap px-4 py-4 text-sm">
    <div className="flex items-center space-x-2">
      {/* Botão de Chat */}
      {/* Botão de Detalhes (admin) */}
    </div>
  </td>
)}
```

3. **Versão Responsiva** (linha ~1103):
```tsx
{shouldShowChatColumn && (
  <div className="border-t border-gray-100...">
    <div className="flex items-center justify-end space-x-3">
      {/* Botões de ação */}
    </div>
  </div>
)}
```

## Testes

Os testes cobrem todos os cenários possíveis:

- ✅ Mostra coluna quando status não é "pagamento pendente"
- ✅ Esconde coluna quando status é "pagamento pendente"
- ✅ Mostra coluna quando status é undefined
- ✅ Mostra coluna quando status é string vazia
- ✅ Mostra coluna para outros status (pago, cancelado, etc.)

## Como Usar

1. O hook já está integrado no componente `OrderItemsTable`
2. A prop `paymentStatus` deve ser passada para o componente
3. A coluna será automaticamente escondida quando o status for "pagamento pendente"

## Benefícios

- **Manutenibilidade**: Lógica centralizada em um local
- **Testabilidade**: Hook isolado e facilmente testável
- **Reutilização**: Pode ser usado em outros componentes se necessário
- **Consistência**: Mesma lógica aplicada em desktop e mobile
