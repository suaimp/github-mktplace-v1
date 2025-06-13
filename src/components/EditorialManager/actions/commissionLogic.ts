/**
 * Aplica comissão aos preços nos valores do formulário
 * @param formValues - Os valores do formulário
 * @param commissionFieldId - ID do campo de comissão
 * @returns Os valores do formulário com comissão aplicada
 */
export function applyCommissionToFormValues(
  formValues: Record<string, any>,
  commissionFieldId: string | null
): Record<string, any> {
  // Criar uma cópia dos valores para não modificar o original
  const updatedFormValues = { ...formValues };

  // Buscar o valor da comissão em formValues
  let commissionPercent = 0;
  if (commissionFieldId && formValues[commissionFieldId]) {
    commissionPercent =
      parseFloat(
        formValues[commissionFieldId]
          .toString()
          .replace(/\./g, "")
          .replace(",", ".")
      ) || 0;
  }

  // Se não há comissão, retorna os valores originais
  if (commissionPercent === 0) {
    return updatedFormValues;
  }

  // Atualizar price e promotional_price nos formValues quando necessário
  Object.entries(updatedFormValues).forEach(([fieldId, value]) => {
    let obj = value;

    // Se o valor é uma string, tenta fazer parse para ver se é JSON
    if (typeof value === "string") {
      try {
        obj = JSON.parse(value);
      } catch {
        obj = value;
      }
    }

    // Verifica se o objeto tem propriedades de preço
    if (
      obj &&
      typeof obj === "object" &&
      (obj.price || obj.promotional_price)
    ) {
      // Processa o price
      if (obj.price) {
        const priceStr = String(obj.price).replace(/\./g, "").replace(",", ".");
        const price = parseFloat(priceStr);

        if (!isNaN(price)) {
          const result = price + (price * commissionPercent) / 100;
          obj.price = String(Math.trunc(result * 100) / 100).replace(".", ",");
        }
      }

      // Processa o promotional_price
      if (obj.promotional_price) {
        const promoStr = String(obj.promotional_price)
          .replace(/\./g, "")
          .replace(",", ".");
        const promo = parseFloat(promoStr);

        if (!isNaN(promo)) {
          const result = promo + (promo * commissionPercent) / 100;
          obj.promotional_price = String(
            Math.trunc(result * 100) / 100
          ).replace(".", ",");
        }
      }

      // Atualiza o valor processado no formValues
      updatedFormValues[fieldId] = obj;
    }
  });

  return updatedFormValues;
}

/**
 * Formata um valor numérico para string no formato brasileiro (vírgula como decimal)
 * @param value - Valor numérico
 * @returns String formatada
 */
export function formatPriceValue(value: number): string {
  return String(Math.trunc(value * 100) / 100).replace(".", ",");
}

/**
 * Parse um valor de preço do formato brasileiro para número
 * @param priceStr - String do preço no formato brasileiro
 * @returns Número parseado
 */
export function parsePriceValue(priceStr: string): number {
  return parseFloat(priceStr.replace(/\./g, "").replace(",", "."));
}
