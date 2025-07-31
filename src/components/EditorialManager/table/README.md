# Table Module - Sistema de Sincronização e Busca

## Responsabilidade Única
- Sincronização de dados em tempo real
- Gerenciamento de estado de tabelas  
- Sistema de busca independente da paginação
- Integração com o sistema de data sync

## Estrutura
```
table/
├── README.md                          # Documentação do módulo
├── hooks/
│   ├── useEnhancedTableSync.ts       # Hook avançado para sync de tabelas
│   └── index.ts                      # Exportações dos hooks
├── types/
│   ├── tableSyncTypes.ts             # Tipos para sincronização de tabelas
│   └── index.ts                      # Exportações dos tipos
├── components/                       # Componentes da tabela
├── EntriesTableSkeleton.tsx         # Skeleton loading
└── index.ts                         # Exportações principais
```

## Como usar o useTableDataSync

### Implementação básica:
```tsx
import { useTableDataSync } from "./dataSync/hooks/useDataSync";

const { refreshEntries } = useCachedPaginatedEntries(formId);

useTableDataSync(
  formId,           // ID do formulário para escutar
  refreshEntries,   // Função para executar quando dados mudarem
  {
    listenerId: `entries-table-${formId}`,  // ID único do listener
    priority: 1     // Prioridade de execução (maior = primeiro)
  }
);
```

### Implementação avançada:
```tsx
import { useEnhancedTableSync } from "./table";

const { isListening, lastRefresh, refreshCount } = useEnhancedTableSync(
  formId,
  refreshEntries,
  { 
    listenerId: `enhanced-table-${formId}`,
    priority: 1,
    autoRefresh: true 
  }
);
```

## Fluxo de sincronização
1. **Evento**: Ação em outro componente (criar/editar/deletar)
2. **Emissão**: `emitFormEntryUpdate()` no data sync
3. **Escuta**: Hook `useTableDataSync` detecta o evento
4. **Refresh**: Executa `refreshEntries()` automaticamente
5. **Atualização**: Tabela recarrega dados do backend

## Vantagens da Sincronização
- ✅ Dados sempre atualizados em tempo real
- ✅ Múltiplas tabelas sincronizadas automaticamente
- ✅ Sistema de prioridades para ordem de execução
- ✅ Logs detalhados para debugging
- ✅ Modular e seguindo responsabilidade única

---

# Sistema de Busca Independente da Paginação

## Problema Resolvido

Anteriormente, a busca na `EntriesTable` só funcionava nos dados já carregados na página atual da paginação. Isso causava o problema onde uma busca por "g1" na primeira página não encontrava registros que estavam na última página.

## Solução Implementada

### 1. Busca Independente da Paginação

A busca agora funciona de forma independente da paginação:
- Quando há um termo de busca, o sistema carrega **todos** os entries do formulário
- Aplica o filtro de busca em todo o dataset
- Depois aplica a paginação nos resultados filtrados

### 2. Busca Abrangente

A busca agora pesquisa em todas as colunas relevantes:
- **Campos do formulário**: text, textarea, email, url
- **Publisher**: nome completo e email
- **Status**: em_analise, verificado, reprovado
- **Data**: created_at
- **Valores numéricos**: preços e outros números

### 3. Busca Manual (Click-to-Search)

- A busca só é executada ao clicar no ícone de lupa ou pressionar Enter
- Não busca mais a cada letra digitada
- Hover do ícone de busca em preto

### 4. Exportação PDF Inteligente

- **Exporta todos os registros da aba**: Não apenas a página atual
- **Informações da aba no cabeçalho**: Mostra qual filtro foi exportado
- **Busca integrada**: Se há termo de busca, exporta apenas os resultados filtrados

#### Exemplos de Exportação:
- **Aba "Todos"**: Exporta todos os 433 registros
- **Aba "Verificado"**: Exporta apenas os registros verificados
- **Busca "g1" na aba "Todos"**: Exporta apenas registros que contêm "g1"

## Arquitetura Modular

### Estrutura de Pastas

```
src/components/EditorialManager/table/
├── components/
│   └── TableControls.tsx           # Componente principal da barra de controles
├── hooks/
│   ├── index.ts                    # Exporta hooks
│   ├── useTableSearch.ts           # Hook para gerenciar busca
│   └── useAllEntriesForExport.ts   # Hook para exportação completa
├── utils/
│   ├── index.ts                    # Exporta utilitários
│   └── searchUtils.ts              # Funções utilitárias de busca
└── export/
    ├── components/
    │   └── PdfExportButton.tsx     # Botão de exportação atualizado
    ├── services/
    │   └── PdfExportService.ts     # Serviço de PDF com cabeçalho melhorado
    └── types/
        └── exportTypes.ts          # Tipos atualizados com info da aba
```

### Componentes Principais

#### 1. `useTableSearch` Hook
- Gerencia o estado local do input de busca
- Sincroniza com o termo de busca externo
- Controla quando a busca é executada

#### 2. `useAllEntriesForExport` Hook (NOVO)
- Busca todos os entries de uma aba específica para exportação
- Não aplica paginação, retorna dataset completo
- Inclui mapeamento de nomes de status para exibição

#### 3. `searchUtils` 
- Funções modulares para diferentes tipos de busca
- `matchEntry`: função principal que combina todos os critérios
- `matchFormFields`, `matchPublisher`, `matchStatus`, etc.

#### 4. `PdfExportButton` (ATUALIZADO)
- Busca todos os entries da aba antes de exportar
- Adiciona informações da aba no cabeçalho do PDF
- Suporte a filtros e busca integrados

#### 5. `FormEntriesService` (Atualizado)
- Implementa busca no banco de dados antes da paginação
- Usa as funções utilitárias para filtrar entries
- Otimizado para performance

## Melhorias de Performance

1. **Cache de Fields**: Carrega campos do formulário apenas uma vez
2. **Busca em Lote**: Carrega publishers em lotes otimizados
3. **Filtro Eficiente**: Usa funções modulares para filtro
4. **Logs de Performance**: Monitora tempo de execução
5. **Exportação Otimizada**: Limite alto (10.000) para capturar todos os registros

## Como Usar

### Busca Manual
```tsx
const { searchInput, setSearchInput, handleSearchSubmit } = useTableSearch({
  searchTerm,
  onSearchChange,
  onPageReset
});
```

### Exportação Completa
```tsx
const { getAllEntries, getStatusDisplayName } = useAllEntriesForExport({
  formId,
  statusFilter,
  searchTerm
});

// Buscar todos os entries da aba
const allEntries = await getAllEntries();
```

### Customização de Busca
```tsx
import { matchEntry } from '../utils';

// Usar função personalizada de busca
const isMatch = matchEntry(entry, searchTerm, fields);
```

## Cabeçalho PDF

O cabeçalho do PDF agora inclui:
- **Título**: Nome do formulário
- **Data**: Data da exportação
- **Filtro**: Qual aba foi exportada (ex: "Todos os Status", "Verificado")
- **Busca**: Termo de busca usado (se houver)
- **Total**: Número de registros exportados

Exemplo:
```
Relatório - Formulário de Sites
Exportado em 29/07/2025
Filtro: Verificado | Busca: "g1" | Total de registros: 15
```

## Princípios Aplicados

- **Responsabilidade Única**: Cada arquivo tem uma responsabilidade específica
- **Modularidade**: Hooks e utilitários separados e reutilizáveis
- **Centralização**: Toda lógica de busca concentrada na pasta `table/`
- **Performance**: Otimizações para lidar com grandes volumes de dados
- **User Experience**: Exportação inteligente que atende às expectativas do usuário
