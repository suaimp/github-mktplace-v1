# Sistema de Cache para Paginação - Melhoria Implementada

## Problema Resolvido

**Antes:** Ao navegar entre páginas da paginação, os dados da página anterior eram perdidos e precisavam ser solicitados novamente ao banco de dados toda vez que o usuário voltava para uma página já visitada.

**Depois:** Implementado sistema de cache inteligente que mantém os dados das páginas já carregadas em memória, evitando requisições desnecessárias ao banco de dados.

## Implementação

### 1. Sistema de Cache Genérico

Criado um sistema de cache reutilizável em `src/hooks/cache/`:

```
src/hooks/cache/
├── types.ts                    # Interfaces do sistema de cache
├── PaginationCache.ts          # Classe principal do cache com TTL
├── useCachedPagination.ts      # Hook genérico para paginação com cache
└── index.ts                    # Exportações
```

#### Características do Cache:

- **TTL (Time To Live)**: Cache expira automaticamente após tempo configurável
- **Limit de Entradas**: Número máximo de páginas em cache (previne uso excessivo de memória)
- **Cache Key Inteligente**: Leva em conta filtros, busca, ordenação e ID da entidade
- **Limpeza Automática**: Remove entradas expiradas automaticamente
- **Invalidação Seletiva**: Limpa cache quando filtros ou critérios mudam

### 2. Hooks Especializados com Cache

#### EntriesTable (Editorial Manager)
- **Arquivo**: `src/components/EditorialManager/pagination/hooks/useCachedPaginatedEntries.ts`
- **Cache TTL**: 5 minutos
- **Max Entradas**: 100 páginas
- **Uso**: `import { useCachedPaginatedEntries } from "./pagination"`

#### OrderList (Orders)
- **Arquivo**: `src/pages/Orders/actions/useCachedOrderList.ts`
- **Cache TTL**: 2 minutos (dados mais dinâmicos)
- **Max Entradas**: 50 páginas
- **Uso**: `import { useCachedOrderList } from "./actions/useCachedOrderList"`

### 3. Arquivos Atualizados

#### EntriesTable
```tsx
// Antes
import { usePaginatedEntries } from "./pagination";

// Depois  
import { useCachedPaginatedEntries } from "./pagination";

// Hook mudou de:
const { ... } = usePaginatedEntries(selectedFormId);

// Para:
const { ... } = useCachedPaginatedEntries(selectedFormId);
```

#### OrderList
```tsx
// Antes
import { useOrderList } from "./actions/useOrderList";

// Depois
import { useCachedOrderList } from "./actions/useCachedOrderList";

// Hook mudou de:
const { ... } = useOrderList();

// Para:
const { ... } = useCachedOrderList();
```

## Benefícios da Implementação

### 1. Performance
- ✅ **Redução de requisições**: Páginas já visitadas não fazem nova requisição
- ✅ **Carregamento instantâneo**: Navegação entre páginas cached é imediata
- ✅ **Menor carga no servidor**: Reduz tráfego desnecessário para o banco de dados

### 2. Experiência do Usuário
- ✅ **Navegação fluida**: Sem loading ao voltar para páginas já visitadas
- ✅ **Dados consistentes**: Cache mantém estado da página visitada
- ✅ **Resposta imediata**: Interface mais responsiva

### 3. Gestão de Recursos
- ✅ **Controle de memória**: Limite máximo de entradas e TTL
- ✅ **Invalidação inteligente**: Cache limpo quando necessário
- ✅ **Compatibilidade total**: Mesma interface dos hooks originais

## Configuração do Cache

### Configurações Padrão

```typescript
// Para EntriesTable
{
  maxAge: 5 * 60 * 1000,    // 5 minutos
  maxEntries: 100           // 100 páginas máximo
}

// Para OrderList  
{
  maxAge: 2 * 60 * 1000,    // 2 minutos
  maxEntries: 50            // 50 páginas máximo
}
```

### Personalização

```typescript
const { ... } = useCachedPagination({
  fetchFunction: myFetchFunction,
  dependencies: [entityId],
  cacheConfig: {
    maxAge: 10 * 60 * 1000,  // 10 minutos
    maxEntries: 200          // 200 páginas
  }
});
```

## Invalidação do Cache

### Automática
- **Mudança de filtros**: Cache limpo ao alterar busca/filtros
- **Mudança de ordenação**: Cache limpo ao alterar ordem
- **TTL expirado**: Entradas antigas removidas automaticamente
- **Limite excedido**: Entradas mais antigas removidas (FIFO)

### Manual
```typescript
const { clearCache, refreshData } = useCachedPagination(...);

// Limpar cache manualmente
clearCache();

// Forçar reload e limpar cache
refreshData();
```

## Cache Key Strategy

O cache utiliza uma chave composta por todos os parâmetros que afetam os resultados:

```typescript
{
  page: number,
  searchTerm?: string,
  statusFilter?: string,
  sortField?: string,
  sortDirection?: 'asc' | 'desc',
  formId?: string  // ou entityId
}
```

Isso garante que diferentes combinações de filtros tenham cache separado e correto.

## Monitoramento

### Informações Disponíveis
```typescript
const { cacheSize } = useCachedPagination(...);
console.log(`Cache atual: ${cacheSize} páginas`);
```

### Debug do Cache
O cache registra automaticamente operações importantes no console:
- Hits e misses
- Limpeza de entradas expiradas
- Invalidações

## Compatibilidade

### Backward Compatibility
- ✅ **Interface idêntica**: Mesmas props e retornos dos hooks originais
- ✅ **Componentes inalterados**: Pagination components não precisaram mudanças
- ✅ **Tipos mantidos**: TypeScript interfaces preservadas

### Migration Path
```typescript
// Fácil migração - apenas troca o import
// De:
import { usePaginatedEntries } from "./pagination";

// Para:
import { useCachedPaginatedEntries } from "./pagination";
```

## Estrutura Final

```
src/
├── hooks/cache/                 # Sistema de cache genérico
├── components/
│   ├── common/pagination/       # Componente de paginação reutilizável
│   └── EditorialManager/
│       └── pagination/
│           └── hooks/
│               ├── usePaginatedEntries.ts      # Original (mantido)
│               └── useCachedPaginatedEntries.ts # Nova versão com cache
└── pages/Orders/actions/
    ├── useOrderList.ts          # Original (mantido)
    └── useCachedOrderList.ts    # Nova versão com cache
```

## Resultados Esperados

1. **Redução de 60-80%** nas requisições ao banco para navegação de páginas
2. **Melhoria significativa** na experiência do usuário
3. **Menor carga** no servidor de banco de dados
4. **Interface mais responsiva** durante navegação

A implementação mantém total compatibilidade com o código existente, permitindo rollback fácil se necessário, e oferece base sólida para expansão do sistema de cache para outras funcionalidades da aplicação.
