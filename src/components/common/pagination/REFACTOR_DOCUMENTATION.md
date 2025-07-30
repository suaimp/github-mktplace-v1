# Sistema de Paginação Globalizado - Documentação

## Resumo das Mudanças

Este documento descreve a refatoração realizada para resolver os problemas no sistema de paginação e no componente "Mostrar ${numero} registros".

## Problemas Identificados

1. **Componente não global**: Cada tabela tinha seu próprio seletor de "Mostrar registros"
2. **Inconsistência**: Implementações diferentes em cada componente  
3. **Falta de sincronização**: Não atualizava a tabela em tempo real
4. **Violação do DRY**: Código duplicado em vários lugares

## Solução Implementada

### 1. Componentes Globais Criados

#### `ItemsPerPageSelector` 
- **Localização**: `src/components/common/pagination/components/ItemsPerPageSelector.tsx`
- **Responsabilidade**: Seletor reutilizável para número de registros por página
- **Props**:
  - `itemsPerPage`: Valor atual 
  - `onItemsPerPageChange`: Callback para mudanças
  - `itemLabel`: Label customizável (padrão: "registros")
  - `options`: Opções disponíveis (padrão: [10, 25, 50, 100])
  - `className`: Classes CSS adicionais

#### `EnhancedTablePagination`
- **Localização**: `src/components/common/pagination/components/EnhancedTablePagination.tsx`
- **Responsabilidade**: Componente de paginação com seletor integrado
- **Recursos**:
  - Inclui `ItemsPerPageSelector` quando habilitado
  - Mantém compatibilidade com `TablePagination` existente
  - Suporte a temas claro/escuro

### 2. Hooks Auxiliares

#### `usePaginationWithItemsPerPage`
- **Localização**: `src/components/common/pagination/hooks/usePaginationWithItemsPerPage.ts`
- **Responsabilidade**: Hook para gerenciar estado de paginação com seletor
- **Funcionalidades**:
  - Estado sincronizado entre página atual e itens por página
  - Reset automático para primeira página ao mudar itens por página
  - Callbacks customizáveis

#### `useCachedPaginationWithItemsPerPage`
- **Localização**: `src/hooks/cache/useCachedPaginationWithItemsPerPage.ts`
- **Responsabilidade**: Extensão do sistema de cache para incluir seletor
- **Integração**: Funciona com o sistema de cache existente

### 3. Refatorações Realizadas

#### TableControls (EditorialManager)
- **Arquivo**: `src/components/EditorialManager/table/components/TableControls.tsx`
- **Mudança**: Substituído seletor inline pelo `ItemsPerPageSelector`
- **Benefício**: Consistência visual e comportamental

#### FormEntriesTable
- **Arquivo**: `src/components/form/FormEntriesTable.tsx`
- **Mudança**: Substituído seletor inline pelo `ItemsPerPageSelector`
- **Benefício**: Redução de código duplicado

#### PlatformUsers
- **Arquivo**: `src/pages/Users/PlatformUsers.tsx`
- **Mudança**: Substituído seletor inline pelo `ItemsPerPageSelector`
- **Benefício**: Padronização da interface

## Estrutura Final

```
src/components/common/pagination/
├── components/
│   ├── ItemsPerPageSelector.tsx       # Seletor global
│   └── EnhancedTablePagination.tsx    # Paginação com seletor
├── hooks/
│   └── usePaginationWithItemsPerPage.ts # Hook de estado
├── types/
│   └── index.ts                       # Interfaces TypeScript
├── TablePagination.tsx                # Componente base (mantido)
└── index.ts                          # Exportações

src/hooks/cache/
├── useCachedPaginationWithItemsPerPage.ts # Hook com cache
└── index.ts                              # Exportações atualizadas
```

## Funcionalidades

### ✅ Resolvido: Componente Global
- Seletor reutilizável em todos os componentes
- Implementação única e consistente

### ✅ Resolvido: Consistência
- Design unificado seguindo o sistema de design
- Comportamento padronizado

### ✅ Resolvido: Sincronização em Tempo Real
- Mudanças no seletor atualizam a tabela imediatamente
- Reset automático para primeira página
- Integração com sistema de cache

### ✅ Resolvido: Princípio de Responsabilidade Única
- Cada componente tem uma responsabilidade específica
- Separação clara entre lógica e apresentação
- Hooks especializados para diferentes cenários

## Uso

### Exemplo Básico - ItemsPerPageSelector
```tsx
import { ItemsPerPageSelector } from "../common/pagination";

<ItemsPerPageSelector
  itemsPerPage={entriesPerPage}
  onItemsPerPageChange={handleEntriesPerPageChange}
  itemLabel="registros"
/>
```

### Exemplo Avançado - EnhancedTablePagination
```tsx
import { EnhancedTablePagination } from "../common/pagination";

<EnhancedTablePagination
  currentPage={currentPage}
  totalPages={totalPages}
  totalItems={totalItems}
  itemsPerPage={itemsPerPage}
  onPageChange={handlePageChange}
  onItemsPerPageChange={handleItemsPerPageChange}
  showItemsPerPageSelector={true}
  itemLabel="usuários"
/>
```

### Hook com Estado Local
```tsx
import { usePaginationWithItemsPerPage } from "../common/pagination";

const {
  currentPage,
  itemsPerPage,
  handlePageChange,
  handleItemsPerPageChange,
  resetToFirstPage
} = usePaginationWithItemsPerPage({
  initialItemsPerPage: 25,
  onPageChange: (page) => console.log(`Página: ${page}`),
  onItemsPerPageChange: (items) => console.log(`Itens: ${items}`)
});
```

## Compatibilidade

- ✅ Mantém compatibilidade com componentes existentes
- ✅ `TablePagination` original permanece inalterado
- ✅ Migração opcional e incremental
- ✅ Suporte completo a TypeScript

## Benefícios Alcançados

1. **Código Mais Limpo**: Eliminação de duplicação
2. **Manutenibilidade**: Mudanças centralizadas
3. **Consistência**: Interface uniforme
4. **Extensibilidade**: Fácil adição de novas funcionalidades
5. **Performance**: Sistema de cache integrado
6. **Developer Experience**: APIs simples e bem documentadas

## Próximos Passos Recomendados

1. **Migração Completa**: Converter todos os componentes restantes
2. **Testes**: Adicionar testes unitários para os novos componentes
3. **Documentação**: Expandir documentação com mais exemplos
4. **Otimizações**: Implementar lazy loading se necessário

## Arquivos Modificados

### Novos Arquivos
- `src/components/common/pagination/components/ItemsPerPageSelector.tsx`
- `src/components/common/pagination/components/EnhancedTablePagination.tsx`
- `src/components/common/pagination/hooks/usePaginationWithItemsPerPage.ts`
- `src/hooks/cache/useCachedPaginationWithItemsPerPage.ts`

### Arquivos Modificados
- `src/components/common/pagination/types/index.ts`
- `src/components/common/pagination/index.ts`
- `src/hooks/cache/index.ts`
- `src/components/EditorialManager/table/components/TableControls.tsx`
- `src/components/form/FormEntriesTable.tsx`
- `src/pages/Users/PlatformUsers.tsx`

## Conclusão

A refatoração resolve todos os problemas identificados mantendo a compatibilidade com o código existente. O sistema agora é mais robusto, consistente e fácil de manter, seguindo os princípios de responsabilidade única e DRY.
