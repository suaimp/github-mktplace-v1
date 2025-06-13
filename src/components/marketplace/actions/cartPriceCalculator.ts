/**
 * Calculadora de preços para o carrinho de compras
 * Centraliza a lógica de cálculo de preços com promotional_price
 */

import { parsePrice } from "../utils";

interface PriceValue {
  field_id: string;
  value?: string;
  value_json?: any;
}

interface ProductPriceField {
  id: string;
  field_type: string;
}

/**
 * Calcula o preço do produto a partir dos dados de entrada
 * Aplica a lógica do promotional_price: usa promotional_price se disponível, senão usa price
 *
 * @param entryValues - Array com todos os valores da entrada
 * @param productPriceField - Campo que contém os dados de preço
 * @returns Preço calculado (promotional_price ou price)
 */
export function calculateCartProductPrice(
  entryValues: PriceValue[],
  productPriceField: ProductPriceField | undefined
): number {
  console.log("[cartPriceCalculator] Valores recebidos:", {
    entryValues,
    productPriceField,
    entryValuesLength: entryValues?.length || 0
  });

  let productPrice = 0;

  if (!productPriceField) {
    console.log("[cartPriceCalculator] productPriceField não definido");
    return productPrice;
  }
  const priceValue = entryValues.find(
    (v) => v.field_id === productPriceField.id
  );

  console.log("[cartPriceCalculator] priceValue encontrado:", {
    priceValue,
    productPriceFieldId: productPriceField.id,
    found: !!priceValue
  });

  if (!priceValue) {
    console.log("[cartPriceCalculator] priceValue não encontrado");
    return productPrice;
  }
  try {
    let priceData: any = null;

    // Primeiro tenta value_json (parece ser onde os dados estão)
    if (priceValue.value_json) {
      priceData =
        typeof priceValue.value_json === "string"
          ? JSON.parse(priceValue.value_json)
          : priceValue.value_json;
      console.log(
        "[cartPriceCalculator] Dados encontrados em value_json:",
        priceData
      );
    }
    // Fallback para value se value_json não existir
    else if (priceValue.value) {
      priceData =
        typeof priceValue.value === "string"
          ? JSON.parse(priceValue.value)
          : priceValue.value;
      console.log(
        "[cartPriceCalculator] Dados encontrados em value:",
        priceData
      );
    }

    if (priceData) {
      // Verifica se promotional_price tem valor válido e maior que 0
      if (priceData.promotional_price) {
        const promotionalPriceNum = parsePrice(priceData.promotional_price);
        if (promotionalPriceNum > 0) {
          productPrice = promotionalPriceNum;
          console.log("[cartPriceCalculator] Usando promotional_price:", {
            promotional_price: priceData.promotional_price,
            parsed_price: productPrice,
            reason: "promotional_price > 0"
          });
        } else {
          // promotional_price existe mas é 0 ou inválido, usa price normal
          productPrice = parsePrice(priceData.price);
          console.log(
            "[cartPriceCalculator] promotional_price é 0, usando price normal:",
            {
              promotional_price: priceData.promotional_price,
              price: priceData.price,
              parsed_price: productPrice
            }
          );
        }
      } else {
        // Não tem promotional_price, usa price normal
        productPrice = parsePrice(priceData.price);
        console.log("[cartPriceCalculator] Usando price normal:", {
          price: priceData.price,
          parsed_price: productPrice,
          reason: "promotional_price não existe"
        });
      }
    }
  } catch (e) {
    console.error("[cartPriceCalculator] Error parsing product price:", e);
  }

  return productPrice;
}

/**
 * Verifica se um valor de promotional_price é válido
 * @param promotionalPrice - Valor do promotional_price a verificar
 * @returns true se o promotional_price é válido
 */
export function hasValidPromotionalPrice(promotionalPrice: any): boolean {
  return (
    promotionalPrice &&
    promotionalPrice !== "" &&
    promotionalPrice !== null &&
    promotionalPrice !== undefined
  );
}

/**
 * Extrai dados de preço de um objeto de entrada
 * @param priceData - Objeto contendo price e/ou promotional_price
 * @returns Objeto com o preço a ser usado e informações de debug
 */
export function extractPriceFromData(priceData: any): {
  price: number;
  usedPromotionalPrice: boolean;
  rawData: any;
} {
  let price = 0;
  let usedPromotionalPrice = false;

  if (hasValidPromotionalPrice(priceData.promotional_price)) {
    price = parsePrice(priceData.promotional_price);
    usedPromotionalPrice = true;
  } else {
    price = parsePrice(priceData.price);
  }
  return {
    price,
    usedPromotionalPrice,
    rawData: priceData
  };
}

/**
 * DOCUMENTAÇÃO DE USO:
 *
 * Este arquivo centraliza toda a lógica de cálculo de preços para o carrinho de compras,
 * incluindo a lógica do promotional_price.
 *
 * FUNÇÃO PRINCIPAL:
 * - calculateCartProductPrice(): Calcula o preço correto (promotional_price ou price)
 *
 * FUNÇÕES AUXILIARES:
 * - hasValidPromotionalPrice(): Verifica se promotional_price é válido
 * - extractPriceFromData(): Extrai dados de preço com informações de debug
 *
 * LÓGICA DO PROMOTIONAL_PRICE:
 * 1. Se promotional_price existe e não está vazio → usa promotional_price
 * 2. Senão → usa price normal
 * 3. Fallback para value_json se value não existir
 *
 * LOGGING:
 * Todas as funções incluem console.log com prefixo [cartPriceCalculator] para debug
 */
