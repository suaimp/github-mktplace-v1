# Marketplace Button Filters

Sistema modular de botões de filtro para o marketplace seguindo os princípios SOLID.

## 📁 Estrutura

```
button-filters/
├── types/
│   └── index.ts              # Interfaces e tipos TypeScript
├── hooks/
│   ├── useMarketplaceCountryFilter.ts  # Hook para filtros de país
│   └── index.ts              # Exportações dos hooks
├── services/
│   ├── MarketplaceCountryFilterService.ts  # Serviços de país
│   └── index.ts              # Exportações dos serviços
├── components/
│   ├── category/
│   │   ├── MarketplaceCategoryButton.tsx   # Botão de categoria
│   │   └── index.ts          # Exportações de categoria
│   ├── country/
│   │   ├── MarketplaceCountryButton.tsx    # Botão de país
│   │   ├── MarketplaceCountryDropdown.tsx  # Dropdown de países
│   │   ├── MarketplaceCountryFilter.tsx    # Filtro completo de país
│   │   └── index.ts          # Exportações de país
│   └── index.ts              # Exportações dos componentes
└── index.ts                  # Exportações principais
```

## 🎯 Princípios SOLID Aplicados

### Single Responsibility Principle (SRP)
- **Componentes**: Cada componente tem uma única responsabilidade
- **Hooks**: Cada hook gerencia apenas um tipo de estado
- **Serviços**: Cada serviço lida apenas com operações específicas
- **Tipos**: Arquivo dedicado apenas para definições de tipos

### Open/Closed Principle (OCP)
- Estrutura extensível para novos tipos de filtros
- Fácil adição de novos botões sem modificar código existente

### Liskov Substitution Principle (LSP)
- Todos os botões implementam a interface `BaseButtonProps`
- Componentes podem ser substituídos sem quebrar funcionalidade

### Interface Segregation Principle (ISP)
- Interfaces específicas para cada tipo de filtro
- Não força implementação de métodos desnecessários

### Dependency Inversion Principle (DIP)
- Componentes dependem de abstrações (interfaces)
- Serviços podem ser facilmente substituídos

## 🚀 Componentes

### 1. Country Filter (Filtro de País)

#### MarketplaceCountryFilter
Componente principal que combina botão e dropdown.

```tsx
<MarketplaceCountryFilter
  selectedCountries={selectedCountries}
  onCountriesChange={setSelectedCountries}
/>
```

#### MarketplaceCountryButton
Botão que mostra contador de países selecionados.

#### MarketplaceCountryDropdown
Dropdown com lista de países, busca e bandeiras.

### 2. Category Filter (Filtro de Categoria)

#### MarketplaceCategoryButton
Botão para filtros de categoria (movido da estrutura anterior).

## 🔧 Hooks

### useMarketplaceCountryFilter
Hook para gerenciar estado de filtros de país.

**Retorna:**
- `selectedCountries`: Array de códigos de países selecionados
- `isOpen`: Estado do dropdown
- `searchTerm`: Termo de busca
- `filteredCountries`: Países filtrados pela busca
- `toggleCountry`: Função para adicionar/remover país
- `clearFilters`: Limpar todos os filtros

## 🛠️ Serviços

### MarketplaceCountryFilterService
Serviço para operações relacionadas a filtros de país.

**Métodos principais:**
- `getAvailableCountries()`: Obtém todos os países
- `searchCountries(term)`: Busca países por termo
- `formatCountriesForFilter()`: Formata para uso em filtros
- `getCountryByCode(code)`: Busca país específico

## 🌐 API de Países

O sistema utiliza o `CountriesService` existente:
- **Fonte**: `src/services/db-services/common/countriesService.ts`
- **Bandeiras**: https://flagcdn.com/
- **Formato**: SVG de alta qualidade

## 📋 Uso no Marketplace

### Integração com MarketplaceTableControls

```tsx
import { MarketplaceCountryFilter } from '../../filters';

// No componente MarketplaceTableControls
<div className="flex flex-wrap gap-2">
  <MarketplaceFilter
    filterGroups={filterGroups}
    selectedFilters={selectedFilters}
    onFiltersChange={onFiltersChange}
  />
  
  <MarketplaceCountryFilter
    selectedCountries={selectedCountries}
    onCountriesChange={onCountriesChange}
  />
</div>
```

### Estado no MarketplaceTable

```tsx
// Estado para filtros de país
const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

// Passagem de props
<MarketplaceTableControls
  // ... outras props
  selectedCountries={selectedCountries}
  onCountriesChange={setSelectedCountries}
/>
```

## 🔄 Fluxo de Dados

1. **Usuário clica no botão** → `MarketplaceCountryButton`
2. **Abre dropdown** → `MarketplaceCountryDropdown`
3. **Seleciona países** → `useMarketplaceCountryFilter`
4. **Atualiza estado** → `MarketplaceCountryFilter`
5. **Notifica pai** → `onCountriesChange`
6. **Atualiza tabela** → `MarketplaceTable`

## ✨ Características

- **🎨 UI Consistente**: Mesmo design do filtro de categoria
- **🔍 Busca em Tempo Real**: Filtragem instantânea de países
- **🏳️ Bandeiras Visuais**: Ícones de países para melhor UX
- **♿ Acessibilidade**: Labels, ARIA attributes e navegação por teclado
- **🌙 Dark Mode**: Suporte completo a tema escuro
- **📱 Responsivo**: Adaptável a diferentes tamanhos de tela

## 🚀 Próximos Passos

1. **Implementar lógica de filtro** na consulta de dados
2. **Adicionar novos tipos de filtro** (preço, data, etc.)
3. **Criar filtros combinados** (categoria + país)
4. **Adicionar persistência** de filtros selecionados
5. **Implementar Redux** para estado global se necessário

## 🧪 Extensibilidade

Para adicionar um novo tipo de filtro:

1. **Criar pasta** em `components/` (ex: `price/`)
2. **Implementar componentes** seguindo o padrão
3. **Criar hook** específico em `hooks/`
4. **Adicionar serviço** se necessário em `services/`
5. **Definir tipos** em `types/`
6. **Exportar** nos arquivos `index.ts`

Exemplo para filtro de preço:
```tsx
// components/price/MarketplacePriceFilter.tsx
// hooks/useMarketplacePriceFilter.ts
// services/MarketplacePriceFilterService.ts
```
