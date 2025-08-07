# Best Selling Sites Chart - Estrutura Modular

Este módulo implementa o componente de chart para exibir os sites mais vendidos, seguindo o princípio de responsabilidade única.

## Estrutura de Arquivos

```
best-selling-chart/
├── README.md                          # Este arquivo
├── index.ts                           # Exportações principais
├── BestSellingSitesChart.tsx          # Componente principal
├── components/
│   └── SiteRow.tsx                    # Componente para cada linha do chart
├── hooks/
│   └── useBestSellingSitesChart.ts    # Hook para buscar e processar dados
├── types/
│   └── index.ts                       # Tipos TypeScript
└── utils/
    └── dataFormatters.ts              # Utilitários para formatação de dados
```

## Componentes

### 1. BestSellingSitesChart (Principal)
**Arquivo:** `BestSellingSitesChart.tsx`

**Responsabilidades:**
- Renderização da estrutura principal do chart
- Gerenciamento de estados de loading e error
- Integração com o hook de dados

### 2. SiteRow
**Arquivo:** `components/SiteRow.tsx`

**Responsabilidades:**
- Renderização de cada linha individual do chart
- Exibição do favicon do site
- Formatação do nome do site e preço

### 3. useBestSellingSitesChart (Hook)
**Arquivo:** `hooks/useBestSellingSitesChart.ts`

**Responsabilidades:**
- Busca dados da tabela `best_selling_sites`
- Busca preços dos produtos via `form_entry_values`
- Processamento e formatação dos dados
- Gerenciamento de estados (loading, error, data)

## Funcionalidades

### 🎯 **Fonte de Dados**
- **Tabela principal:** `best_selling_sites`
- **Preços:** `form_entry_values` (busca por `entry_id`)
- **Ordenação:** Por quantidade vendida (descendente)
- **Limite:** Top 5 sites

### 💰 **Lógica de Preços**
1. Busca no campo `value_json` primeiro (formato estruturado)
2. Se tem `promotional_price` e não é "0", usa ele
3. Senão, usa o `price` normal
4. Se não tem JSON, usa o campo `value` (texto simples)

### 🌐 **Formatação de Sites**
- **Remove:** `www.`, protocolos (`http://`, `https://`)
- **Mantém:** Domínio principal + extensão (`.com`, `.net`, etc.)
- **Favicon:** Gerado via Google Favicons API

### 🔄 **Estados do Componente**
- **Loading:** Mostra skeleton loader
- **Error:** Mostra mensagem de erro com retry
- **Success:** Exibe lista de sites com preços
- **Empty:** Mensagem quando não há dados

## Tipos

### `SiteDisplayData`
```typescript
{
  siteName: string;    // Nome formatado do site
  siteUrl: string;     // URL original
  price: string;       // Preço formatado
  quantity: number;    // Quantidade vendida
  favicon?: string;    // URL do favicon
}
```

### `PriceData`
```typescript
{
  price: string;
  old_price?: string;
  promotional_price?: string;
  old_promotional_price?: string;
}
```

## Utilitários

### `extractPrice()`
Extrai o preço mais relevante dos dados do formulário

### `formatSiteName()`
Formata URLs em nomes de sites legíveis

### `getFaviconUrl()`
Gera URLs de favicons via Google API

## Integração

Para usar em outros lugares:

```tsx
import { BestSellingSitesChart } from './best-selling-chart';

<BestSellingSitesChart />
```

## Dependências

- ✅ Tabela `best_selling_sites` (migration criada)
- ✅ Trigger automático para popular dados
- ✅ `FormEntryValuesService` para buscar preços
- ✅ Componentes de UI (LoadingState, ErrorState)

## Princípios Seguidos

- ✅ **Responsabilidade Única:** Cada arquivo tem uma função específica
- ✅ **Modularidade:** Separação clara de concerns
- ✅ **Reutilização:** Componentes e utilitários reutilizáveis
- ✅ **Tipagem:** TypeScript completo
- ✅ **Performance:** Hooks otimizados e dados limitados
