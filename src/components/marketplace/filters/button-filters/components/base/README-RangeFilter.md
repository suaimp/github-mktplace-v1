# Componente Base de Filtro de Range

Este documento descreve o sistema de filtros de range reutilizável criado para o marketplace, especificamente implementado para filtros de DA (Domain Authority).

## Arquitetura

O sistema segue os princípios SOLID e está organizado de forma modular:

```
src/components/marketplace/filters/button-filters/
├── components/
│   ├── base/
│   │   ├── types/
│   │   │   └── RangeFilterTypes.ts
│   │   ├── BaseRangeFilterDropdown.tsx
│   │   ├── BaseRangeFilterItem.tsx
│   │   └── index.ts
│   └── da/
│       ├── MarketplaceDADropdown.tsx
│       └── index.ts
├── services/
│   └── DAFilterService.ts
└── hooks/
    └── useDAFilter.ts
```

## Componentes Base

### BaseRangeFilterDropdown
Componente base reutilizável para dropdowns de filtro de range que inclui:
- Lista de opções predefinidas (scrollable)
- Seção de intervalo personalizado com inputs de min/max
- Botões de incremento/decremento
- Botão "Aplicar" para confirmar range customizado
- Botão "Limpar filtros"

### BaseRangeFilterItem
Componente para renderizar itens individuais de range:
- Checkbox de seleção
- Badge colorido com classificação
- Label da classificação
- Range de pontuação
- Ícone de informação opcional

## Tipos e Interfaces

### RangeOption
```typescript
interface RangeOption {
  id: string;              // Identificador único (ex: 'A', 'B', 'C')
  label: string;           // Nome da classificação (ex: 'Autoridade Elevada')
  minValue: number;        // Valor mínimo do range
  maxValue: number;        // Valor máximo do range
  backgroundColor: string; // Cor de fundo do badge
  textColor: string;       // Cor do texto do badge
  description?: string;    // Descrição para tooltip
}
```

### CustomRange
```typescript
interface CustomRange {
  min: number | null;      // Valor mínimo personalizado
  max: number | null;      // Valor máximo personalizado
}
```

### RangeFilterState
```typescript
interface RangeFilterState {
  selectedRanges: string[];  // IDs dos ranges selecionados
  customRange: CustomRange;  // Range personalizado
}
```

## Serviços

### DAFilterService
Responsável pela lógica de negócio do filtro de DA:

- `generateDAFilterOptions()`: Gera as opções de classificação de DA
- `isDAValueSelected()`: Verifica se um valor está dentro dos filtros
- `countItemsByClassification()`: Conta itens por classificação
- `extractDAValue()`: Extrai valor numérico de diferentes formatos
- `getDAClassification()`: Determina a classificação de um valor
- `validateCustomRange()`: Valida um range personalizado
- `formatFilterState()`: Formata estado para exibição

## Hook useDAFilter

Gerencia todo o estado e lógica do filtro:

```typescript
const {
  state,                    // Estado atual do filtro
  isOpen,                   // Se dropdown está aberto
  options,                  // Opções de classificação
  hasSelectedItems,         // Se há filtros ativos
  toggleRange,              // Alternar seleção de range
  setCustomRange,           // Atualizar range customizado
  applyCustomRange,         // Aplicar range customizado
  clearFilters,             // Limpar todos os filtros
  setIsOpen,                // Controlar abertura do dropdown
  formatSelectedFilters,    // Formatar para exibição
  isDAValueFiltered         // Verificar se valor passa no filtro
} = useDAFilter();
```

## Classificações de DA

O sistema implementa 5 classificações baseadas nos valores do ApiMetricBadge:

| Classificação | Range | Cor de Fundo | Cor do Texto | Qualidade |
|---------------|--------|--------------|--------------|-----------|
| A (Autoridade Elevada) | 80-100 | #9EF2C9 | #007C65 | Premium |
| B (Autoridade Relevante) | 60-79  | #C4E5FE | #006DCA | Alta |
| C (Autoridade Média)       | 40-59  | #EDD9FF | #8649E1 | Média-Alta |
| D (Autoridade Moderada)   | 20-39  | #FCE081 | #A75800 | Limitada |
| F (Autoridade Inicial)     | 0-19   | #f9b4b4 | #b84f53 | Questionável |

## Uso do Componente

### Implementação Básica
```tsx
import { MarketplaceDADropdown } from './components/da';

<MarketplaceDADropdown
  entries={totalEntries}
  onFilterChange={(filterFn) => applyFilter(filterFn)}
  daFieldName="DA"
/>
```

### Integração com MarketplaceTable
O filtro já está integrado ao MarketplaceTableControls e pode ser usado passando:

```tsx
<MarketplaceTableControls
  // ... outras props
  onDAFilterChange={(filterFn) => handleDAFilter(filterFn)}
  entries={entries}
  fields={fields}
/>
```

## Funcionalidades

### Filtragem por Classificação
- Seleção múltipla de classificações (A, B, C, D, F)
- Cada classificação tem seu range de valores predefinido
- Visual consistente com badges coloridos

### Range Personalizado
- Inputs numéricos para min/max
- Botões de incremento/decremento
- Validação de valores (0-100)
- Validação de lógica (min ≤ max)

### Interface do Usuário
- Design consistente com outros filtros
- Botão principal mostra contador de filtros ativos
- Dropdown com scroll para muitas opções
- Seção fixa para range personalizado
- Botão de limpar filtros sempre visível quando há seleções

## Extensibilidade

O sistema foi projetado para ser facilmente estendido para outros tipos de métricas:

1. **Para outras métricas de score (0-100)**:
   - Usar o mesmo BaseRangeFilterDropdown
   - Criar novo service com classificações específicas
   - Implementar hook específico

2. **Para métricas com ranges diferentes**:
   - Ajustar validações no service
   - Modificar inputs para aceitar ranges apropriados
   - Adaptar classificações conforme necessário

3. **Para filtros mais complexos**:
   - Estender RangeFilterTypes conforme necessário
   - Adicionar novos componentes base
   - Manter separação de responsabilidades

## Princípios SOLID Aplicados

- **Single Responsibility**: Cada classe/componente tem uma responsabilidade específica
- **Open/Closed**: Sistema extensível para novas métricas sem modificar código existente
- **Liskov Substitution**: Componentes base podem ser substituídos por especializações
- **Interface Segregation**: Interfaces pequenas e específicas para cada necessidade
- **Dependency Inversion**: Dependências são injetadas via props e hooks
