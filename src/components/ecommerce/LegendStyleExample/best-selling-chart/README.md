# Best Selling Sites Chart - Estrutura Modular com Lógica de Preços do Marketplace

Este módulo implementa o componente de chart para exibir os sites mais vendidos, seguindo o princípio de responsabilidade única e a mesma lógica visual de preços usada no MarketplaceTable.

## 🎯 Funcionalidades

### Exibição de Preços
- ✅ **Preços Promocionais**: Quando há `promotional_price`, exibe preço original riscado + preço promocional + % de desconto
- ✅ **Preços Normais**: Quando não há `promotional_price`, exibe apenas o preço normal
- ✅ **Formatação**: Mesma formatação de moeda brasileira usada no MarketplaceTable
- ✅ **Lógica Consistente**: Prioriza `promotional_price` se disponível e válido, senão usa `price`

### Dados e Integração
- ✅ Busca dados da tabela `best_selling_sites`
- ✅ Integração com `form_entry_values` para obter preços estruturados
- ✅ Ordenação por quantidade de vendas
- ✅ Favicons automáticos dos sites
- ✅ Formatação inteligente de nomes de sites

## 📁 Estrutura de Arquivos

```
best-selling-chart/
├── README.md                          # Este arquivo
├── index.ts                           # Exportações centralizadas
├── BestSellingSitesChart.tsx          # Componente principal
├── components/
│   ├── SiteRow.tsx                    # Componente para cada linha do chart
│   └── PriceDisplay.tsx               # 🆕 Componente para exibir preços com lógica do Marketplace
├── hooks/
│   └── useBestSellingSitesChart.ts    # Hook para buscar e processar dados
├── types/
│   └── index.ts                       # Tipos TypeScript (atualizado com PriceInfo)
└── utils/
    ├── dataFormatters.ts              # Utilitários originais (mantidos para compatibilidade)
    └── priceCalculators.ts            # 🆕 Utilitários para cálculo de preços
```

## 🔧 Componentes

### 1. BestSellingSitesChart (Principal)
**Arquivo:** `BestSellingSitesChart.tsx`

**Responsabilidades:**
- Renderização da estrutura principal do chart
- Gerenciamento de estados de loading e error
- Integração com o hook de dados

### 2. SiteRow (Atualizado)
**Arquivo:** `components/SiteRow.tsx`

**Responsabilidades:**
- Renderização de cada linha individual do chart
- Exibição do favicon do site
- Formatação do nome do site
- **🆕 Integração com PriceDisplay** para exibir preços

### 3. PriceDisplay (🆕 Novo)
**Arquivo:** `components/PriceDisplay.tsx`

**Responsabilidades:**
- Exibição de preços seguindo a lógica visual do MarketplaceTable
- Preço promocional com desconto (preço original riscado + % OFF)
- Preço normal quando não há promoção
- Formatação consistente de moeda

### 4. useBestSellingSitesChart (Hook Atualizado)
**Arquivo:** `hooks/useBestSellingSitesChart.ts`

**Responsabilidades:**
- Busca dados da tabela `best_selling_sites`
- Busca preços dos produtos via `form_entry_values`
- **🆕 Calcula informações estruturadas** de preço usando `calculatePriceInfo`
- Processamento e formatação dos dados
- Gerenciamento de estados (loading, error, data)

## 📋 Tipos

### PriceInfo (🆕 Novo)
```typescript
interface PriceInfo {
  originalPrice: number;
  promotionalPrice?: number;
  discountPercentage: number;
}
```

### SiteDisplayData (Atualizado)
```typescript
interface SiteDisplayData {
  siteName: string;
  siteUrl: string;
  price: string; // Mantido para compatibilidade
  priceInfo?: PriceInfo; // 🆕 Nova propriedade
  quantity: number;
  favicon?: string;
}
```

## 🛠️ Utilitários

### priceCalculators.ts (🆕 Novo)
- `calculatePriceInfo()`: Calcula informações estruturadas de preço
- `parseBrazilianPrice()`: Converte valores brasileiros para números
- `extractPrice()`: Função original mantida para compatibilidade
- `formatSiteName()`: Extrai nome do site da URL
- `getFaviconUrl()`: Gera URL do favicon

### dataFormatters.ts (Mantido)
- Funções originais mantidas para compatibilidade com código existente

## 💻 Integração

### Como usar no Dashboard
```tsx
import { BestSellingSitesChart } from './components/ecommerce/LegendStyleExample/best-selling-chart';

function Dashboard() {
  return (
    <div>
      <BestSellingSitesChart />
    </div>
  );
}
```

### Exemplo de exibição de preços
- **Com promoção**: ~~R$ 150,00~~ **R$ 120,00** `20% OFF`
- **Sem promoção**: R$ 150,00

## 📦 Dependências

- React 18+
- Supabase (para dados)
- FormEntryValuesService (para buscar preços)
- Tailwind CSS (para estilos)

## ⚙️ Princípios Seguidos

- ✅ **Responsabilidade Única**: Cada arquivo tem uma função específica
- ✅ **Modularidade**: Componentes pequenos e reutilizáveis
- ✅ **Separação de Responsabilidades**: Lógica de negócio, apresentação e dados separados
- ✅ **Consistência Visual**: Mesma lógica de preços do MarketplaceTable
- ✅ **Compatibilidade**: Funcionalidade original mantida
- ✅ **Type Safety**: Interfaces TypeScript para todos os dados
- ✅ **Tratamento de Estados**: Loading, Error, Empty, Success

## 🔄 Migração e Compatibilidade

- ✅ **Backward Compatible**: Código existente continuará funcionando
- ✅ **Gradual Migration**: Novos recursos são opcionais
- ✅ **Fallback**: Se `priceInfo` não estiver disponível, usa o `price` string original

## 🎨 Visual

### Antes
```
Site                    Preço
example.com             R$ 120,00
```

### Depois (Com Promoção)
```
Site                    Preço
                       R$ 150,00  (riscado)
example.com            R$ 120,00  20% OFF
```

### Depois (Sem Promoção)
```
Site                    Preço
example.com             R$ 150,00
```
