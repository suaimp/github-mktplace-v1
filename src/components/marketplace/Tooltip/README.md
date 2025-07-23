# Marketplace Table Tooltip System

## Visão Geral
Sistema especializado de tooltips para a tabela marketplace que usa posicionamento baseado nos limites da tabela em vez da div com overflow.

## Problema Resolvido
Anteriormente, as tooltips dos ícones de nicho ajustavam seu posicionamento lateral com base nos limites da div com overflow. Agora elas se posicionam baseadas nos limites da tabela marketplace.

## Arquitetura

### Componentes Criados

#### 1. `useMarketplaceTableTooltipPosition.ts`
**Localização:** `src/components/marketplace/Tooltip/hooks/`

**Responsabilidade:** Hook especializado para posicionamento de tooltips na tabela marketplace.

**Funcionalidades:**
- Detecta especificamente a tabela com classe `.marketplace-table`
- Calcula posicionamento vertical (top/bottom) baseado no espaço disponível na tabela
- Calcula posicionamento horizontal (left/center/right) baseado nos limites laterais da tabela
- Escuta eventos de scroll e resize para reposicionamento dinâmico
- Fallback para limites da viewport se a tabela não for encontrada

#### 2. `MarketplaceTableInfoTooltip.tsx`
**Localização:** `src/components/marketplace/Tooltip/`

**Responsabilidade:** Componente tooltip especializado para uso na tabela marketplace.

**Funcionalidades:**
- Usa o hook `useMarketplaceTableTooltipPosition` para posicionamento inteligente
- Mantém a mesma API do InfoTooltip original para compatibilidade
- Aplica o tamanho de fonte de 13px conforme especificações do projeto
- Styling específico para melhor integração com a tabela marketplace

## Integração

### MarketplaceValueFormatter
O componente foi atualizado para usar `MarketplaceTableInfoTooltip` em vez de `InfoTooltip` para os ícones de nicho.

**Mudanças:**
```tsx
// Antes
import InfoTooltip from "../ui/InfoTooltip/InfoTooltip";

// Depois  
import { MarketplaceTableInfoTooltip } from "./Tooltip";

// Uso
<MarketplaceTableInfoTooltip
  text={tooltipText}
>
  {children}
</MarketplaceTableInfoTooltip>
```

## Princípios de Design

### Responsabilidade Única
- **Hook de Posicionamento:** Apenas calcula posições baseadas na tabela
- **Componente Tooltip:** Apenas renderiza a tooltip com posicionamento correto
- **Integração:** Apenas conecta os componentes existentes

### Estrutura Modular
```
src/components/marketplace/Tooltip/
├── hooks/
│   ├── useMarketplaceTableTooltipPosition.ts
│   └── [outros hooks existentes]
├── MarketplaceTableInfoTooltip.tsx
├── [outros componentes existentes]
└── index.ts
```

### Compatibilidade
- Mantém a mesma API do InfoTooltip original
- Não quebra implementações existentes
- Permite migração gradual de outros tooltips se necessário

## Benefícios

1. **Posicionamento Preciso:** Tooltips agora se alinham corretamente com os limites da tabela
2. **Melhor UX:** Usuários veem tooltips completas mesmo em tabelas com scroll horizontal
3. **Reutilizável:** Pode ser usado para outras tooltips na tabela marketplace
4. **Manutenível:** Código organizado seguindo princípios de responsabilidade única
5. **Performático:** Listeners otimizados e cleanup automático

## Uso

Para usar o novo sistema de tooltips na tabela marketplace:

```tsx
import { MarketplaceTableInfoTooltip } from "./Tooltip";

<MarketplaceTableInfoTooltip
  text="Texto da tooltip"
  className="opcional"
>
  <ElementoTrigger />
</MarketplaceTableInfoTooltip>
```

## Extensibilidade

O sistema pode ser facilmente estendido para:
- Outros tipos de tooltips na tabela marketplace
- Posicionamento customizado baseado em outras referências
- Diferentes estilos de tooltip mantendo o mesmo posicionamento
