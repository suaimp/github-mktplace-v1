# Top Sites em Promoção - Componente

Este componente exibe um ranking dos sites com maior desconto da tabela `promotion_sites`.

## Estrutura de Arquivos

```
chart-TopSites/
├── TopSitesPromoChart.tsx          # Componente principal
├── index.ts                        # Exportações centralizadas
├── components/                     # Componentes auxiliares
│   ├── PromotionSiteItem.tsx      # Item individual do ranking
│   ├── LoadingState.tsx           # Estado de carregamento
│   ├── ErrorState.tsx             # Estado de erro
│   └── EmptyState.tsx             # Estado vazio
└── hooks/                         # Hooks customizados
    └── usePromotionSites.ts       # Hook para buscar dados
```

## Services

```
services/db-services/promotion-services/
└── promotionSitesService.ts       # Service para tabela promotion_sites
```

## Funcionalidades

- ✅ Busca dados da tabela `promotion_sites`
- ✅ Ordena por maior desconto (campo `percent`)
- ✅ Exibe URL do site (campo `url`) na coluna "Site"
- ✅ Exibe desconto (campo `percent`) na coluna "Desconto"
- ✅ Estados de carregamento, erro e vazio
- ✅ Formatação automática de URLs (extrai domínio)
- ✅ Responsive design

## Como usar

```tsx
import { TopSitesPromoChart } from './components/ecommerce/chart-TopSites';

function Dashboard() {
  return (
    <div>
      <TopSitesPromoChart />
    </div>
  );
}
```

## Configuração

O componente busca automaticamente os top 5 sites com maior desconto. Para alterar o limite:

```tsx
// No hook usePromotionSites
const { sites, loading, error } = usePromotionSites(10); // 10 sites
```

## Dados da Tabela

O componente consome os seguintes campos da tabela `promotion_sites`:

- `id`: Identificador único
- `url`: URL do site
- `percent`: Percentual de desconto
- `price`: Preço original
- `promotional_price`: Preço promocional

## Princípios Aplicados

- ✅ **Responsabilidade Única**: Cada arquivo tem uma função específica
- ✅ **Modularidade**: Componentes pequenos e reutilizáveis
- ✅ **Separação de Responsabilidades**: Service, Hook, Componentes
- ✅ **Tratamento de Estados**: Loading, Error, Empty, Success
- ✅ **Type Safety**: Interfaces TypeScript para todos os dados
