# Solução para Tooltips Otimizados

## Problema Identificado

As tooltips na tabela de itens do pedido (rota `/order/:id`) estavam sempre presentes no DOM, causando:

- **Espaço invisível reservado**: O React reservava espaço para os tooltips mesmo quando não estavam visíveis
- **Performance degradada**: Muitos elementos DOM desnecessários
- **Layout afetado**: Espaçamento visual inconsistente na tabela

## Solução Implementada

### 1. InfoTooltipOptimized

Criado um novo componente `InfoTooltipOptimized` que:

- **Renderização condicional**: Só renderiza o tooltip no DOM quando está sendo exibido
- **Estados controlados**: Usa `useState` para controlar quando renderizar e quando mostrar
- **Transições suaves**: Mantém as transições de fade in/out
- **Cleanup automático**: Remove do DOM após a transição de saída

**Localização**: `src/components/ui/InfoTooltip/InfoTooltipOptimized.tsx`

### 2. Fluxo de Funcionamento

```typescript
// Estados
const [isVisible, setIsVisible] = useState(false);       // Controla opacidade
const [shouldRender, setShouldRender] = useState(false); // Controla renderização

// Ao passar mouse
handleMouseEnter() {
  setShouldRender(true);  // Renderiza no DOM
  setTimeout(() => {
    setIsVisible(true);   // Torna visível com transição
  }, 10);
}

// Ao sair com mouse
handleMouseLeave() {
  setIsVisible(false);    // Esconde com transição
  setTimeout(() => {
    setShouldRender(false); // Remove do DOM
  }, 300);
}
```

### 3. Benefícios

- ✅ **Zero espaço reservado** quando tooltip não está visível
- ✅ **Melhor performance** com menos elementos DOM
- ✅ **Transições mantidas** - experiência visual inalterada
- ✅ **Compatibilidade total** com posicionamento inteligente existente
- ✅ **Responsividade preservada** - funciona em todas as telas

## Arquivos Modificados

### Principais

- `src/components/ui/InfoTooltip/InfoTooltipOptimized.tsx` - Novo componente otimizado
- `src/components/ui/InfoTooltip/index.ts` - Export do novo componente
- `src/pages/Orders/local-components/OrderItemsTable.tsx` - Uso do componente otimizado

### Adicionais

- `src/components/marketplace/Tooltip/MarketplaceTableTooltipOptimized.tsx` - Versão otimizada para marketplace
- `src/pages/TooltipDemo.tsx` - Página de demonstração

## Como Usar

### Substituição Simples

```typescript
// Antes
import InfoTooltip from "../../components/ui/InfoTooltip/InfoTooltip";

<InfoTooltip text="Texto do tooltip" />

// Depois  
import { InfoTooltipOptimized } from "../../components/ui/InfoTooltip";

<InfoTooltipOptimized text="Texto do tooltip" />
```

### Props Suportadas

```typescript
interface InfoTooltipOptimizedProps {
  text: ReactNode;        // Conteúdo do tooltip
  className?: string;     // Classes CSS adicionais
  children?: ReactNode;   // Trigger customizado (padrão: ícone ?)
}
```

## Testes Recomendados

1. **Inspeção DOM**: Verificar que tooltips só aparecem no DOM quando visíveis
2. **Layout**: Confirmar que não há espaço reservado desnecessário
3. **Performance**: Medir impacto em tabelas com muitos tooltips
4. **Acessibilidade**: Testar navegação por teclado e screen readers

## Migração

### Para novos componentes
Use sempre `InfoTooltipOptimized` em vez de `InfoTooltip`

### Para componentes existentes
Substitua gradualmente onde há problemas de layout ou performance

## Compatibilidade

- ✅ Funciona com posicionamento inteligente existente
- ✅ Mantém todas as funcionalidades visuais
- ✅ Suporta todas as opções de alinhamento
- ✅ Responsivo em todas as resoluções
