/**
 * Função melhorada para converter valor brasileiro para número
 */
function parsePrice(value: any): number {
  let str = String(value);

  // Tratamento específico para diferentes formatos
  if (str.includes(",") && str.includes(".")) {
    // Formato brasileiro completo: 1.000,50 ou 10.000,25
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    // Apenas vírgula: 1000,50
    str = str.replace(",", ".");
  } else if (str.includes(".")) {
    // Verificar se é decimal ou separador de milhares
    const parts = str.split(".");
    if (parts.length === 2 && parts[1].length <= 2) {
      // Provavelmente decimal: 1000.50
      // Mantém como está
    } else {
      // Separador de milhares: 1.000 ou 10.000
      str = str.replace(/\./g, "");
    }
  }

  const result = parseFloat(str);

  if (isNaN(result)) {
    return 0;
  }

  return result;
}

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
  console.log("🔍 [DEBUG] applyCommissionToFormValues - INÍCIO");
  console.log("📝 [DEBUG] formValues recebidos:", formValues);
  console.log("📋 [DEBUG] commissionFieldId:", commissionFieldId);

  // Proteção contra valores nulos ou indefinidos
  if (!formValues || typeof formValues !== 'object') {
    console.log("⚠️ [DEBUG] formValues inválido, retornando objeto vazio");
    return {};
  }

  // Criar uma cópia dos valores para não modificar o original
  const updatedFormValues = { ...formValues };

  // Buscar o valor da comissão em formValues
  let commissionPercent = 0;
  if (commissionFieldId && formValues[commissionFieldId]) {
    console.log(
      "💰 [DEBUG] Valor bruto da comissão:",
      formValues[commissionFieldId]
    );

    commissionPercent =
      parseFloat(
        formValues[commissionFieldId]
          .toString()
          .replace(/\./g, "")
          .replace(",", ".")
      ) || 0;

    console.log("📊 [DEBUG] Comissão parseada (%):", commissionPercent);
  } else {
    console.log(
      "❌ [DEBUG] Não foi encontrado commissionFieldId ou valor está vazio"
    );
  }
  // Se não há comissão, define como 0 e prossegue com o fluxo normal
  if (commissionPercent === 0) {
    console.log("⚠️ [DEBUG] Comissão é 0, prosseguindo com fluxo normal");
    commissionPercent = 0;
  }

  console.log(
    "✅ [DEBUG] Aplicando comissão de",
    commissionPercent,
    "% aos valores"
  );
  // Atualizar price e promotional_price nos formValues quando necessário
  Object.entries(updatedFormValues).forEach(([fieldId, value]) => {
    console.log(`🔄 [DEBUG] Processando campo ${fieldId}:`, value);

    // Pular campos com valores nulos ou indefinidos
    if (value === null || value === undefined) {
      console.log(`⚠️ [DEBUG] ${fieldId} - Valor nulo/indefinido, pulando`);
      return;
    }

    let obj = value;

    // Se o valor é uma string, tenta fazer parse para ver se é JSON
    if (typeof value === "string") {
      try {
        obj = JSON.parse(value);
        console.log(`📄 [DEBUG] ${fieldId} - JSON parseado:`, obj);
      } catch {
        console.log(`📝 [DEBUG] ${fieldId} - Não é JSON, mantendo como string`);
        obj = value;
      }
    }

    // Verifica se o objeto tem propriedades de preço
    if (
      obj &&
      typeof obj === "object" &&
      (obj.price || obj.promotional_price)
    ) {
      console.log(`💰 [DEBUG] ${fieldId} - Encontrou objeto com preços:`, obj);

      // Processa o price usando old_price como base
      if (obj.old_price || obj.price) {
        const basePrice = obj.old_price || obj.price;
        console.log(
          `💵 [DEBUG] ${fieldId} - Processando price usando old_price:`,
          basePrice
        );

        const price = parsePrice(basePrice);

        console.log(`💵 [DEBUG] ${fieldId} - basePrice original:`, basePrice);
        console.log(`💵 [DEBUG] ${fieldId} - Price parseado:`, price);
        if (!isNaN(price)) {
          const result = price + (price * commissionPercent) / 100;

          console.log(`💰 [DEBUG] ${fieldId} - CÁLCULO DETALHADO:`);
          console.log(`💰 [DEBUG] ${fieldId} - price:`, price);
          console.log(
            `💰 [DEBUG] ${fieldId} - commissionPercent:`,
            commissionPercent
          );
          console.log(
            `💰 [DEBUG] ${fieldId} - (price * commissionPercent) / 100:`,
            (price * commissionPercent) / 100
          );
          console.log(
            `💰 [DEBUG] ${fieldId} - result (price + margem):`,
            result
          );

          const formattedResult = result.toFixed(2).replace(".", ",");

          console.log(
            `💰 [DEBUG] ${fieldId} - formattedResult:`,
            formattedResult
          );

          console.log(
            `💵 [DEBUG] ${fieldId} - Price original (old_price):`,
            price
          );
          console.log(`💵 [DEBUG] ${fieldId} - Price com comissão:`, result);
          console.log(
            `💵 [DEBUG] ${fieldId} - Price formatado final:`,
            formattedResult
          );

          // Preserva old_price e atualiza price com comissão
          if (!obj.old_price) {
            obj.old_price = String(price).replace(".", ",");
          }
          obj.price = formattedResult;
        } else {
          console.log(
            `❌ [DEBUG] ${fieldId} - Price não é um número válido:`,
            price
          );
        }
      } // Processa o promotional_price usando old_promotional_price como base
      if (obj.old_promotional_price || obj.promotional_price) {
        const basePromotionalPrice =
          obj.old_promotional_price || obj.promotional_price;
        console.log(
          `🏷️ [DEBUG] ${fieldId} - Processando promotional_price usando old_promotional_price:`,
          basePromotionalPrice
        );

        const promo = parsePrice(basePromotionalPrice);

        console.log(
          `🏷️ [DEBUG] ${fieldId} - Promotional_price parseado:`,
          promo
        ); // Só aplica comissão se for um número válido E diferente de 0
        if (!isNaN(promo) && promo !== 0) {
          const result = promo + (promo * commissionPercent) / 100;
          const formattedResult = result.toFixed(2).replace(".", ",");

          console.log(
            `🏷️ [DEBUG] ${fieldId} - Promotional_price original (old_promotional_price):`,
            promo
          );
          console.log(
            `🏷️ [DEBUG] ${fieldId} - Promotional_price com comissão:`,
            result
          );
          console.log(
            `🏷️ [DEBUG] ${fieldId} - Promotional_price formatado final:`,
            formattedResult
          );

          // Preserva old_promotional_price e atualiza promotional_price com comissão
          if (!obj.old_promotional_price) {
            obj.old_promotional_price = String(promo).replace(".", ",");
          }
          obj.promotional_price = formattedResult;
        } else {
          console.log(
            `❌ [DEBUG] ${fieldId} - Promotional_price não válido (NaN ou 0):`,
            promo
          );
        }
      }

      // Atualiza o valor processado no formValues
      console.log(
        `📋 [DEBUG] ${fieldId} - Objeto final após processamento:`,
        obj
      );
      updatedFormValues[fieldId] = obj;
    } else {
      console.log(
        `⏭️ [DEBUG] ${fieldId} - Não é um objeto com preços, pulando`
      );
    }
  });

  console.log("🎉 [DEBUG] applyCommissionToFormValues - FINALIZADO");
  console.log("📤 [DEBUG] Valores finais retornados:", updatedFormValues);

  return updatedFormValues;
}

/**
 * Formata um valor numérico para string no formato brasileiro (vírgula como decimal)
 * @param value - Valor numérico
 * @returns String formatada
 */
export function formatPriceValue(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

/**
 * Parse um valor de preço do formato brasileiro para número
 * @param priceStr - String do preço no formato brasileiro
 * @returns Número parseado
 */
export function parsePriceValue(priceStr: string): number {
  return parsePrice(priceStr);
}
