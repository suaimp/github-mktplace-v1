# RecentOrdersTable - Estrutura Modular

Este componente foi refatorado seguindo o princípio de responsabilidade única, separando as funcionalidades em diferentes arquivos e pastas.

## Estrutura de Arquivos

```
RecentOrdersTable/
├── RecentOrdersTable.tsx          # Componente principal
├── components/
│   ├── OrderTableHeader.tsx       # Cabeçalho da tabela
│   └── OrderTableRow.tsx          # Linha da tabela
├── hooks/
│   └── useOrdersTable.ts          # Hook personalizado para lógica da tabela
├── styles/
│   └── TableStyles.css            # Estilos customizados da tabela
└── actions/
    ├── getRecentOrders.ts         # Ações para buscar pedidos
    └── pagination.ts              # Utilitários de paginação
```

## Componentes

### RecentOrdersTable.tsx
- Componente principal que orquestra toda a funcionalidade
- Usa o hook `useOrdersTable` para gerenciar estado
- Renderiza componentes filhos (`OrderTableHeader` e `OrderTableRow`)

### OrderTableHeader.tsx
- Responsável apenas pelo cabeçalho da tabela
- Define as colunas "Produto" e "Valor"
- Aplica larguras fixas (75% e 25%)

### OrderTableRow.tsx
- Responsável pela renderização de cada linha da tabela
- Recebe um item de pedido como prop
- Gerencia exibição do favicon e truncamento do texto

## Hook

### useOrdersTable.ts
- Centraliza toda a lógica de estado da tabela
- Gerencia filtros, paginação e busca de dados
- Fornece funções para alternar entre modos e filtros

## Estilos

### TableStyles.css
- Estilos específicos para a tabela
- Define alinhamento vertical e truncamento de texto
- Garante altura fixa das linhas (48px)
- Centraliza conteúdo das células

## Melhorias Implementadas

1. **Redução de Padding**: Removido padding excessivo das células
2. **Largura Fixa**: Tabela com `table-layout: fixed` para controle de largura
3. **Alinhamento Vertical**: Todos os itens centralizados verticalmente
4. **Truncamento**: Nomes de produtos longos são truncados com `...`
5. **Altura Consistente**: Todas as linhas têm altura fixa de 48px
6. **Responsividade**: Mantém responsividade em diferentes tamanhos de tela

## Como Usar

```tsx
import RecentOrdersTable from './RecentOrdersTable/RecentOrdersTable';

function Dashboard() {
  return (
    <div>
      <RecentOrdersTable />
    </div>
  );
}
```

## Princípio de Responsabilidade Única

Cada arquivo tem uma responsabilidade específica:
- **RecentOrdersTable.tsx**: Orquestração e layout principal
- **OrderTableHeader.tsx**: Estrutura do cabeçalho
- **OrderTableRow.tsx**: Renderização de linha individual
- **useOrdersTable.ts**: Lógica de estado e dados
- **TableStyles.css**: Estilos visuais
- **getRecentOrders.ts**: Busca de dados
- **pagination.ts**: Utilitários de paginação

Esta estrutura facilita manutenção, testes e reutilização de componentes.
