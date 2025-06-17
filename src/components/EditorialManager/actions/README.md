# PriceSimulationDisplay

Componente reutilizável para exibir simulação de preços com comissão, seguindo o padrão estabelecido no projeto.

## Funcionalidades

- **Exibição de preços**: Preço original, preço promocional e preço final com comissão
- **Cálculo de margem**: Calcula automaticamente a margem baseada na comissão
- **Desconto visual**: Mostra percentual de desconto quando há preço promocional
- **Layouts flexíveis**: Suporte para layout inline (uma linha) ou block (bloco expandido)
- **Formatação automática**: Formatação de moeda em Real brasileiro (BRL)

## Uso

### Importação

```tsx
import {
  PriceSimulationDisplay,
  usePriceCalculation
} from "../EditorialManager/actions";
```

### Componente PriceSimulationDisplay

```tsx
<PriceSimulationDisplay
  commission={15} // Percentual da comissão (15%)
  productData={productData} // Dados do produto com price e promotional_price
  layout="inline" // "inline" ou "block"
  showMarginBelow={true} // Se deve mostrar a margem abaixo
  className="custom-styles" // Classes CSS adicionais
/>
```

### Hook usePriceCalculation

```tsx
const priceInfo = usePriceCalculation(commission, productData);

if (priceInfo) {
  console.log(priceInfo.priceWithCommission); // Preço final com comissão
  console.log(priceInfo.marginValue); // Valor da margem
  console.log(priceInfo.discountPercentage); // Percentual de desconto
}
```

## Props

### PriceSimulationDisplay

| Prop              | Tipo                  | Padrão     | Descrição                                      |
| ----------------- | --------------------- | ---------- | ---------------------------------------------- |
| `commission`      | `number`              | -          | Percentual da comissão (ex: 15 para 15%)       |
| `productData`     | `any`                 | -          | Dados do produto com price e promotional_price |
| `layout`          | `"inline" \| "block"` | `"inline"` | Layout de exibição                             |
| `showMarginBelow` | `boolean`             | `true`     | Se deve mostrar a margem abaixo                |
| `className`       | `string`              | `""`       | Classes CSS adicionais                         |

## Formato dos Dados do Produto

O componente aceita dados do produto nos seguintes formatos:

```tsx
// Formato 1: Objeto direto
const productData = {
  price: 100.0,
  promotional_price: 80.0 // Opcional
};

// Formato 2: String JSON
const productData = '{"price": 100.00, "promotional_price": 80.00}';

// Formato 3: Com campos alternativos (old_price, old_promotional_price)
const productData = {
  old_price: 100.0,
  old_promotional_price: 80.0
};
```

## Padrão Visual

### Layout Inline (usado no CommissionField)

- Preço original riscado (se houver desconto)
- Preço final em destaque
- Badge de desconto verde
- Margem exibida abaixo (opcional)

### Layout Block (versão expandida)

- Seção dedicada com fundo cinza
- Título "Simulação de Preço com Comissão"
- Detalhamento completo dos valores
- Separador visual entre seções

## Exemplos de Uso

### No CommissionField (layout inline)

```tsx
const priceInfo = usePriceCalculation(commissionValue, productData);

return (
  <div className="flex items-center gap-4">
    <Input type="number" value={value} onChange={handleChange} />
    {priceInfo && (
      <div className="flex flex-col">
        {priceInfo.promotionalPrice && (
          <div className="text-xs text-gray-500 line-through">
            {priceInfo.formatCurrency(priceInfo.originalPrice)}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            {priceInfo.formatCurrency(priceInfo.priceWithCommission)}
          </span>
          {priceInfo.hasDiscount && (
            <span className="text-green-600 text-xs">
              {priceInfo.discountPercentage}% OFF
            </span>
          )}
        </div>
      </div>
    )}
  </div>
);
```

### Em outros contextos (layout block)

```tsx
<PriceSimulationDisplay
  commission={commissionValue}
  productData={productData}
  layout="block"
  className="mt-4"
/>
```

## Funções Utilitárias

### extractProductPrice

Extrai dados de preço de diferentes formatos de entrada.

### usePriceCalculation

Hook que retorna todos os cálculos de preço formatados e prontos para uso.
