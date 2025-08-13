# Base Filter Components

Componentes base reutilizáveis para todos os tipos de filtros do marketplace.

## 📁 Estrutura

```
base/
├── BaseFilterDropdown.tsx    # Dropdown padrão para todos os filtros
├── BaseFilterItem.tsx        # Item padrão para listas de filtros
├── BaseFilterButton.tsx      # Botão padrão para filtros
└── index.ts                  # Exportações
```

## 🎯 Objetivos

- **DRY (Don't Repeat Yourself)**: Evitar duplicação de código
- **Consistência**: Design uniforme em todos os filtros
- **Manutenibilidade**: Mudanças em um lugar refletem em todos
- **Reutilização**: Componentes agnósticos ao tipo de filtro

## 🧩 Componentes

### 1. BaseFilterButton

Botão base para todos os filtros.

**Props:**
```tsx
interface BaseFilterButtonProps {
  selectedCount: number;
  onClick: () => void;
  isOpen: boolean;
  label: string;
  icon: ReactNode;
  ariaLabel?: string;
}
```

**Uso:**
```tsx
<BaseFilterButton
  selectedCount={3}
  onClick={() => setOpen(true)}
  isOpen={false}
  label="País"
  icon={<PlusCircleIcon className="mr-2 h-4 w-4" />}
/>
```

### 2. BaseFilterDropdown

Container base para dropdowns de filtro.

**Props:**
```tsx
interface BaseFilterDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  searchPlaceholder: string;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  hasSelectedItems: boolean;
  onClearFilters: () => void;
  children: ReactNode;
  emptyMessage?: string;
}
```

**Características:**
- ✅ Input de busca padronizado
- ✅ Botão "Limpar filtros" automático
- ✅ Backdrop para fechar
- ✅ Layout responsivo
- ✅ Dark mode

### 3. BaseFilterItem

Item base para listas de opções.

**Props:**
```tsx
interface BaseFilterItemProps {
  id: string;
  label: string;
  isSelected: boolean;
  onToggle: (id: string, selected: boolean) => void;
  icon?: ReactNode;
  secondaryInfo?: string | number;
  className?: string;
}
```

**Características:**
- ✅ Checkbox customizado consistente
- ✅ Suporte a ícones (bandeiras, categorias, etc.)
- ✅ Informação secundária (códigos, contadores)
- ✅ Estados de hover e seleção

## 🔄 Migração de Componentes

### Antes (Duplicado)
```tsx
// MarketplaceCountryButton.tsx
<button className="...longClassName...">
  <PlusCircleIcon />
  País
  {count > 0 && <span>{count}</span>}
</button>

// MarketplaceCategoryButton.tsx  
<button className="...sameLongClassName...">
  <PlusCircleIcon />
  Categoria
  {count > 0 && <span>{count}</span>}
</button>
```

### Depois (Reutilizado)
```tsx
// MarketplaceCountryButton.tsx
<BaseFilterButton
  label="País"
  icon={<PlusCircleIcon />}
  selectedCount={count}
  onClick={onClick}
  isOpen={isOpen}
/>

// MarketplaceCategoryButton.tsx
<BaseFilterButton
  label="Categoria" 
  icon={<PlusCircleIcon />}
  selectedCount={count}
  onClick={onClick}
  isOpen={isOpen}
/>
```

## 🎨 Design System

### Cores
- **Borda padrão**: `border-gray-300 dark:border-gray-700`
- **Background**: `bg-white dark:bg-gray-800`
- **Selecionado**: `border-brand-500 bg-brand-50 dark:bg-brand-900/20`
- **Hover**: `hover:bg-gray-50 dark:hover:bg-gray-700`

### Tipografia
- **Label**: `text-sm text-gray-900 dark:text-gray-100`
- **Secondary**: `text-xs text-gray-500 dark:text-gray-400`
- **Placeholder**: `placeholder:text-gray-400 dark:placeholder:text-gray-500`

### Spacing
- **Padding**: `px-2 py-1.5` (itens), `px-3` (container)
- **Gap**: `gap-2` (elementos)
- **Margin**: `mr-2` (ícones)

## ✅ Benefícios Alcançados

### 1. **Redução de Código**
- **Antes**: ~150 linhas por componente
- **Depois**: ~30 linhas por componente
- **Economia**: ~80% menos código

### 2. **Consistência Visual**
- Design 100% idêntico entre filtros
- Comportamentos padronizados
- Estados visuais unificados

### 3. **Manutenibilidade**
- Mudança em um lugar → reflete em todos
- Bug fixes centralizados
- Novas features propagam automaticamente

### 4. **Extensibilidade**
- Novos filtros: apenas definir label e icon
- Customizações via props opcionais
- Reutilização em outros contextos

## 🚀 Próximos Filtros

Para criar um novo filtro:

```tsx
// 1. Criar botão específico
export const MarketplacePriceButton = ({ selectedCount, onClick, isOpen }) => (
  <BaseFilterButton
    label="Preço"
    icon={<DollarIcon className="mr-2 h-4 w-4" />}
    selectedCount={selectedCount}
    onClick={onClick}
    isOpen={isOpen}
  />
);

// 2. Criar dropdown específico  
export const MarketplacePriceDropdown = ({ ranges, ... }) => (
  <BaseFilterDropdown
    title="Filtrar por Preço"
    searchPlaceholder="Buscar faixas..."
    // ... props
  >
    {ranges.map(range => (
      <BaseFilterItem
        key={range.id}
        label={range.label}
        secondaryInfo={range.count}
        // ... props
      />
    ))}
  </BaseFilterDropdown>
);
```

## 🧪 Testes

Os componentes base devem ser testados para:
- ✅ Renderização correta
- ✅ Eventos de clique
- ✅ Estados visuais
- ✅ Acessibilidade
- ✅ Dark mode
- ✅ Responsividade
