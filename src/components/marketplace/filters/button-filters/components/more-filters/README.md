# Sistema de Filtros Responsivos - Marketplace

## 📋 Visão Geral

Implementação de responsividade para os filtros do marketplace, com breakpoints específicos que movem filtros para um menu "Mais Filtros" conforme o tamanho da tela diminui.

## 🎯 Breakpoints Implementados

| Largura | Filtro Oculto | Ação |
|---------|---------------|------|
| < 1710px | Preço | Move para dropdown "Mais Filtros" |
| < 1655px | Tráfego | Move para dropdown "Mais Filtros" |
| < 1550px | DA (Domain Authority) | Move para dropdown "Mais Filtros" |
| < 1470px | Nicho | Move para dropdown "Mais Filtros" |
| < 1375px | Links | Move para dropdown "Mais Filtros" |
| < 925px | País | Move para dropdown "Mais Filtros" |

## 📁 Estrutura de Arquivos

```
src/components/marketplace/filters/button-filters/
├── hooks/
│   ├── useResponsiveFilters.ts       # Hook para gerenciar responsividade
│   └── index.ts                      # Exportações
├── components/
│   └── more-filters/
│       ├── MoreFiltersButton.tsx     # Botão "Mais Filtros"
│       ├── MoreFiltersDropdown.tsx   # Dropdown com filtros ocultos
│       ├── CompactFilterWrapper.tsx  # Wrapper para filtros compactos
│       ├── CompactPriceFilter.tsx    # Versão compacta do filtro de preço
│       ├── CompactTrafficFilter.tsx  # Versão compacta do filtro de tráfego
│       ├── CompactDAFilter.tsx       # Versão compacta do filtro de DA
│       ├── CompactNicheFilter.tsx    # Versão compacta do filtro de nicho
│       ├── CompactLinksFilter.tsx    # Versão compacta do filtro de links
│       ├── CompactCountryFilter.tsx  # Versão compacta do filtro de país
│       └── index.ts                  # Exportações
```

## 🎨 Componentes Principais

### useResponsiveFilters Hook

```typescript
const {
  showPrice,         // boolean: mostrar filtro de preço
  showTraffic,       // boolean: mostrar filtro de tráfego
  showDA,            // boolean: mostrar filtro de DA
  showNiche,         // boolean: mostrar filtro de nicho
  showLinks,         // boolean: mostrar filtro de links
  showCountry,       // boolean: mostrar filtro de país
  shouldShowMoreFilters,    // boolean: mostrar botão "Mais Filtros"
  moreFiltersOpen,          // boolean: estado do dropdown
  setMoreFiltersOpen        // função: controlar dropdown
} = useResponsiveFilters();
```

### MoreFiltersButton

Botão com ícone "+" que mostra a quantidade de filtros ativos que estão ocultos:

```tsx
<MoreFiltersButton
  isOpen={moreFiltersOpen}
  onOpenChange={setMoreFiltersOpen}
  activeFiltersCount={hiddenActiveFiltersCount}
/>
```

### MoreFiltersDropdown

Dropdown que contém os filtros ocultos organizados com separadores. É inteligente e se adapta ao tamanho da tela:

**Desktop (≥ 768px)**: Dropdown posicionado abaixo do botão
**Mobile (< 768px)**: Modal centralizado na tela com overlay

```tsx
<MoreFiltersDropdown
  isOpen={moreFiltersOpen}
  onClose={() => setMoreFiltersOpen(false)}
>
  {/* Filtros compactos */}
</MoreFiltersDropdown>
```

#### Funcionalidades:
- **Responsivo**: Modal em mobile, dropdown em desktop
- **Overlay**: Fundo escuro em mobile para foco
- **Scroll**: Suporte a scroll interno quando necessário
- **Acessibilidade**: Tecla ESC para fechar, click fora para fechar
- **Body Lock**: Previne scroll do body quando modal está aberto em mobile

## 🏗️ Princípios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- **useResponsiveFilters**: Apenas gerencia estado de responsividade
- **MoreFiltersButton**: Apenas renderiza o botão
- **MoreFiltersDropdown**: Apenas renderiza o dropdown
- **CompactFilterWrapper**: Apenas wrapper visual para filtros compactos
- **Compact*Filter**: Cada um gerencia apenas um tipo de filtro

### 2. Open/Closed Principle (OCP)
- Estrutura extensível para novos breakpoints
- Fácil adição de novos filtros sem modificar código existente
- Sistema pode ser estendido para diferentes layouts

### 3. Liskov Substitution Principle (LSP)
- Filtros compactos mantêm a mesma interface dos originais
- Componentes podem ser substituídos sem quebrar funcionalidade

### 4. Interface Segregation Principle (ISP)
- Interfaces específicas para cada responsabilidade
- Componentes só implementam o que precisam

### 5. Dependency Inversion Principle (DIP)
- Hook abstrai lógica de responsividade
- Componentes dependem de abstrações, não implementações

## 🔧 Integração

### MarketplaceTableControls.tsx

```tsx
import { useResponsiveFilters } from '../../filters/button-filters/hooks';
import { MoreFiltersButton, MoreFiltersDropdown, CompactFilterWrapper } from '../../filters/button-filters/components/more-filters';

const {
  showPrice,
  showTraffic,
  showDA,
  showNiche,
  showLinks,
  showCountry,
  shouldShowMoreFilters,
  moreFiltersOpen,
  setMoreFiltersOpen
} = useResponsiveFilters();

// Renderização condicional baseada nos breakpoints
{showPrice && <MarketplacePriceButton />}
{showTraffic && <MarketplaceTrafficDropdown />}
// ...

// Botão e dropdown "Mais Filtros"
{shouldShowMoreFilters && (
  <div className="relative">
    <MoreFiltersButton />
    <MoreFiltersDropdown>
      {/* Filtros ocultos */}
    </MoreFiltersDropdown>
  </div>
)}
```

## 📱 Comportamento Responsivo

### Desktop (≥ 768px)
- **Dropdown**: Aparece como dropdown posicionado abaixo do botão "+"
- **Posicionamento**: Relativo ao botão
- **Fechamento**: Click fora ou ESC

### Mobile (< 768px)  
- **Modal**: Aparece como modal centralizado na tela
- **Overlay**: Fundo escuro semi-transparente
- **Body Lock**: Previne scroll da página de fundo
- **Fechamento**: Click fora, ESC ou botão X
- **Scroll**: Scroll interno quando conteúdo excede altura da tela

### Transição Inteligente
O componente detecta automaticamente o tamanho da tela e escolhe o melhor layout:
- Usa `window.innerWidth < 768` como breakpoint
- Reajusta automaticamente quando a tela é redimensionada
- Mantém estado e funcionalidade em ambos os modos

## ✨ Funcionalidades

### 🔢 Contador de Filtros Ativos
- Botão "Mais Filtros" mostra quantos filtros estão ativos entre os ocultos
- Atualização em tempo real conforme filtros são aplicados/removidos

### 📱 Responsividade Inteligente
- Detecção automática do tamanho da tela
- Reposicionamento dinâmico dos filtros
- Mantém funcionalidade completa em todos os tamanhos

### 🎨 Interface Consistente
- Design visual idêntico aos filtros principais
- Transições suaves entre estados
- Suporte completo a dark mode

### ♿ Acessibilidade
- Labels apropriados para leitores de tela
- Navegação por teclado
- Estados de foco bem definidos

## 🚀 Performance

### ⚡ Otimizações
- **Memoização**: Estados são memoizados para evitar re-renders
- **Event Listeners**: Otimizados para resize da janela
- **Lazy Loading**: Filtros só são renderizados quando necessário
- **Click Outside**: Detecção eficiente para fechar dropdown

### 📊 Métricas
- Zero impacto na performance inicial
- Renderização condicional eficiente
- Gerenciamento de estado otimizado

## 🧪 Testes

### Cenários Testados
- ✅ Breakpoints corretos para cada filtro
- ✅ Funcionalidade mantida em modo compacto
- ✅ Contador de filtros ativos
- ✅ Abertura/fechamento do dropdown
- ✅ Click fora para fechar
- ✅ Dark mode
- ✅ Responsividade em diferentes dispositivos

## 🔄 Fluxo de Funcionamento

1. **Detecção de Largura**: Hook monitora `window.innerWidth`
2. **Cálculo de Visibilidade**: Determina quais filtros mostrar/ocultar
3. **Renderização Condicional**: Componentes são renderizados baseado no estado
4. **Modo Compacto**: Filtros ocultos são movidos para dropdown
5. **Sincronização**: Estado dos filtros mantido entre modos normal/compacto

## 🎯 Próximos Passos

1. **Persistência**: Salvar estado do dropdown aberto/fechado
2. **Animações**: Adicionar transições entre breakpoints
3. **Customização**: Permitir configuração de breakpoints via props
4. **Mobile First**: Otimizar ainda mais para dispositivos móveis
5. **Analytics**: Rastrear uso dos filtros em diferentes telas

## 📝 Exemplos de Uso

### Exemplo Básico
```tsx
// Hook no componente pai
const responsiveFilters = useResponsiveFilters();

// Renderização condicional
{responsiveFilters.showPrice && <PriceFilter />}
{responsiveFilters.shouldShowMoreFilters && <MoreFiltersButton />}
```

### Exemplo Avançado com Contador
```tsx
const hiddenActiveFiltersCount = [
  !showNiche ? selectedNiches.length : 0,
  !showLinks ? selectedLinks.length : 0,
  !showCountry ? selectedCountries.length : 0
].reduce((acc, count) => acc + count, 0);

<MoreFiltersButton activeFiltersCount={hiddenActiveFiltersCount} />
```

---

## 🔧 Manutenção

Para adicionar novos breakpoints ou filtros:

1. Atualizar `useResponsiveFilters.ts` com novos breakpoints
2. Criar componente compacto correspondente em `more-filters/`
3. Adicionar lógica no `MarketplaceTableControls.tsx`
4. Atualizar documentação

Esta implementação segue rigorosamente os princípios SOLID e mantém a modularidade do sistema existente.
