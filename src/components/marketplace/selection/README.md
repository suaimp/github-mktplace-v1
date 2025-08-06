# Marketplace Selection System

## Visão Geral

Sistema de seleção para a tabela do marketplace que implementa seleção com escopo por página, resolvendo o problema onde o checkbox "selecionar tudo" selecionava registros de todas as páginas.

## Problema Resolvido

**Antes:** O checkbox "selecionar tudo" selecionava todos os registros de todas as páginas (exemplo: se havia 1000 registros, todos eram selecionados).

**Depois:** O checkbox "selecionar tudo" seleciona apenas os registros da página atual (exemplo: se a página mostra 10 registros, apenas esses 10 são selecionados).

## Arquitetura

### Estrutura de Pastas
```
src/components/marketplace/selection/
├── hooks/
│   └── useMarketplaceSelection.ts  # Hook principal para gerenciar seleção
├── types/
│   └── index.ts                   # Interfaces e tipos TypeScript
├── index.ts                       # Exportações principais
└── README.md                      # Esta documentação
```

### Princípios de Design

- **Responsabilidade Única**: Cada arquivo tem uma responsabilidade específica
- **Reutilização**: Hook pode ser usado em outras tabelas se necessário
- **Flexibilidade**: Suporte a diferentes escopos de seleção (página ou total)
- **Type Safety**: Implementação totalmente tipada com TypeScript

## API

### Hook `useMarketplaceSelection`

#### Props
```typescript
interface UseMarketplaceSelectionProps {
  currentPageEntries: MarketplaceEntry[];  // Entradas da página atual
  allEntries?: MarketplaceEntry[];         // Todas as entradas (opcional)
  scope?: 'page' | 'all';                  // Escopo da seleção (padrão: 'page')
}
```

#### Retorno
```typescript
interface UseMarketplaceSelectionReturn {
  // Estado
  selectedEntries: string[];               // IDs das entradas selecionadas
  isAllSelected: boolean;                  // Se todas do escopo estão selecionadas
  isIndeterminate: boolean;                // Se há seleção parcial
  selectedCount: number;                   // Quantidade de itens selecionados
  
  // Handlers
  handleSelectEntry: (entryId: string, event: ChangeEvent<HTMLInputElement>) => void;
  handleSelectAll: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClearSelection: () => void;
}
```

## Uso

### Exemplo Básico
```typescript
import { useMarketplaceSelection } from './selection';

function MarketplaceTable({ entries, currentPageEntries }) {
  const {
    selectedEntries,
    isAllSelected,
    selectedCount,
    handleSelectEntry,
    handleSelectAll,
    handleClearSelection
  } = useMarketplaceSelection({
    currentPageEntries,
    scope: 'page' // Seleciona apenas a página atual
  });

  return (
    <table>
      <thead>
        <tr>
          <th>
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={handleSelectAll}
            />
          </th>
          {/* outras colunas */}
        </tr>
      </thead>
      <tbody>
        {currentPageEntries.map(entry => (
          <tr key={entry.id}>
            <td>
              <input
                type="checkbox"
                checked={selectedEntries.includes(entry.id)}
                onChange={(e) => handleSelectEntry(entry.id, e)}
              />
            </td>
            {/* outras células */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Configuração para Escopo Total (Compatibilidade)
```typescript
const selection = useMarketplaceSelection({
  currentPageEntries,
  allEntries: filteredEntries,
  scope: 'all' // Comportamento anterior (todas as páginas)
});
```

## Benefícios

1. **Experiência do Usuário Melhorada**: Seleção intuitiva apenas da página atual
2. **Performance**: Evita seleção desnecessária de milhares de registros
3. **Manutenibilidade**: Código organizado e bem documentado
4. **Flexibilidade**: Suporte a diferentes escopos conforme necessário
5. **Type Safety**: Prevenção de erros com TypeScript
6. **Reutilização**: Hook pode ser usado em outras tabelas

## Compatibilidade

- ✅ Totalmente compatível com a implementação existente
- ✅ Não quebra funcionalidades atuais
- ✅ Migração opcional e incremental
- ✅ Suporte completo ao TypeScript

## Integração

Para usar o novo sistema, importe o hook e substitua a lógica de seleção existente:

```typescript
// Antes
const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
const handleSelectAll = (event) => {
  if (selectedEntries.length === filteredEntries.length) {
    setSelectedEntries([]);
  } else {
    setSelectedEntries(filteredEntries.map(entry => entry.id));
  }
};

// Depois
import { useMarketplaceSelection } from './selection';

const {
  selectedEntries,
  handleSelectAll,
  // ... outros handlers
} = useMarketplaceSelection({
  currentPageEntries: paginatedEntries,
  scope: 'page'
});
```
