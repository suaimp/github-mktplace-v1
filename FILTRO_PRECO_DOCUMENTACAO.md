# Filtro de Preço - Documentação

## Visão Geral

O sistema de filtro de preço foi implementado seguindo os mesmos padrões dos filtros de DA e Tráfego, utilizando a arquitetura baseada em componentes modulares e princípios SOLID.

## Estrutura de Arquivos

```
src/components/marketplace/filters/button-filters/components/price/
├── types/
│   └── PriceFilterTypes.ts          # Interfaces TypeScript
├── services/
│   └── PriceFilterService.ts        # Lógica de negócio
├── hooks/
│   └── usePriceFilter.ts           # Hook para gerenciamento de estado
├── MarketplacePriceDropdown.tsx     # Componente dropdown
├── MarketplacePriceFilter.tsx       # Componente principal
└── index.ts                         # Exportações centralizadas
```

## Funcionalidades

### 1. Intervalos Predefinidos
- **R$ 5.000+**: Sites com preço acima de R$ 5.000
- **R$ 1.000 - R$ 5.000**: Faixa intermediária alta
- **R$ 500 - R$ 1.000**: Faixa intermediária
- **R$ 200 - R$ 500**: Faixa média
- **R$ 100 - R$ 200**: Faixa baixa-média
- **R$ 50 - R$ 100**: Faixa baixa
- **R$ 1 - R$ 50**: Faixa mínima

### 2. Faixa Personalizada
- Input manual de valores mínimo e máximo
- Validação de valores (não pode ser negativo, min deve ser menor que max)
- Formatação automática em moeda brasileira (R$)

### 3. Detecção Automática de Campos
- Busca automaticamente por campos do tipo 'product'
- Fallback para campos com 'preço', 'price' ou 'valor' no label
- Suporte para estruturas de dados aninhadas

### 4. Lógica de Preços
- **Priorização**: `promotional_price` > `price`
- **Formatos suportados**: 
  - Números: `1234.56`
  - Strings brasileiras: `"R$ 1.234,56"`
  - Strings americanas: `"1,234.56"`
- **Parsing inteligente**: Remove símbolos e converte automaticamente

## Como Usar

### Integração Básica

```tsx
import { MarketplacePriceFilter } from './filters/button-filters/components/price';

// No seu componente
<MarketplacePriceFilter
  entries={entries}
  fields={fields}
  onFilterChange={(filteredEntries) => {
    // Processa as entradas filtradas
    setFilteredData(filteredEntries);
  }}
/>
```

### Usando o Hook Diretamente

```tsx
import { usePriceFilter } from './filters/button-filters/components/price';

const MyComponent = () => {
  const priceFilter = usePriceFilter(entries, fields, onFilterChange);
  
  return (
    <div>
      <button onClick={() => priceFilter.setIsOpen(true)}>
        {priceFilter.getActiveFiltersText()}
      </button>
      
      {priceFilter.isActive && (
        <div>Filtros ativos: {priceFilter.getActiveFiltersCount()}</div>
      )}
    </div>
  );
};
```

### Usando o Serviço

```tsx
import { PriceFilterService } from './filters/button-filters/components/price';

// Obter intervalos predefinidos
const intervals = PriceFilterService.getPriceIntervals();

// Contar sites por intervalo
const counts = PriceFilterService.countSitesInIntervals(entries, fields);

// Filtrar sites
const filtered = PriceFilterService.filterSites(sites, criteria, fields);

// Parsear valores brasileiros
const value = PriceFilterService.parseBrazilianCurrency("R$ 1.234,56"); // 1234.56
```

## Exemplos de Dados Suportados

### Campo Produto (field_type: 'product')
```json
{
  "values": {
    "product_field_id": {
      "promotional_price": "R$ 99,99",
      "price": "R$ 149,99",
      "name": "Site de E-commerce"
    }
  }
}
```

### Campo Preço Simples
```json
{
  "values": {
    "price_field_id": "R$ 299,99"
  }
}
```

### Valores Numéricos
```json
{
  "values": {
    "price_field_id": 299.99
  }
}
```

## Validações

### Faixa Personalizada
- ✅ Min e Max devem ser números positivos
- ✅ Min deve ser menor ou igual ao Max
- ✅ Valores null são aceitos (sem limite)
- ❌ Valores negativos são rejeitados

### Detecção de Preços
- ✅ Campos do tipo 'product' têm prioridade
- ✅ Fallback para campos com palavras-chave no label
- ✅ `promotional_price` sempre tem prioridade sobre `price`
- ❌ Campos sem dados válidos retornam 0

## Integração com MarketplaceTable

O filtro está integrado automaticamente no `MarketplaceTable` através do `MarketplaceTableControls`. A filtragem funciona em cascata com outros filtros:

1. **Filtro de Aba** (promoção/favoritos)
2. **Filtros Customizados** (categorias)
3. **Filtro de País**
4. **Filtro de Links**
5. **Filtro de DA**
6. **Filtro de Tráfego**
7. **Filtro de Preço** ← Novo
8. **Busca por texto**

## Performance

- ✅ **Memoização**: Intervalos e contagens são memoizados
- ✅ **Lazy Loading**: Componentes carregam apenas quando necessário
- ✅ **Debounce**: Mudanças de estado são otimizadas
- ✅ **Cache**: Resultados de parsing são reutilizados

## Debugging

Para debugar o filtro de preço, habilite os logs no console:

```javascript
// No console do navegador
localStorage.setItem('debug-price-filter', 'true');
```

Os logs aparecerão com o prefixo `[Price Filter]` mostrando:
- Campos detectados
- Valores parseados
- Contagens por intervalo
- Resultados de filtragem

## Melhorias Futuras

1. **Histórico de Preços**: Suporte para `old_price` e `old_promotional_price`
2. **Moedas Internacionais**: Suporte para USD, EUR, etc.
3. **Análise de Tendências**: Gráficos de distribuição de preços
4. **Exportação**: Relatórios de sites por faixa de preço
5. **Alertas**: Notificações para mudanças de preço

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console
2. Confirme que os campos de preço estão corretos
3. Teste com dados de exemplo
4. Verifique a estrutura dos `entries` e `fields`
