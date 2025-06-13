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

  // Criar uma cópia dos valores para não modificar o original
  const updatedFormValues = { ...formValues };

  // Buscar o valor da comissão em formValues
  let commissionPercent = 0;
  if (commissionFieldId && formValues[commissionFieldId]) {
    console.log("💰 [DEBUG] Valor bruto da comissão:", formValues[commissionFieldId]);
    
    commissionPercent =
      parseFloat(
        formValues[commissionFieldId]
          .toString()
          .replace(/\./g, "")
          .replace(",", ".")
      ) || 0;
    
    console.log("📊 [DEBUG] Comissão parseada (%):", commissionPercent);
  } else {
    console.log("❌ [DEBUG] Não foi encontrado commissionFieldId ou valor está vazio");
  }

  // Se não há comissão, retorna os valores originais
  if (commissionPercent === 0) {
    console.log("⚠️ [DEBUG] Comissão é 0, retornando valores originais");
    return updatedFormValues;
  }

  console.log("✅ [DEBUG] Aplicando comissão de", commissionPercent, "% aos valores");
  // Atualizar price e promotional_price nos formValues quando necessário
  Object.entries(updatedFormValues).forEach(([fieldId, value]) => {
    console.log(`🔄 [DEBUG] Processando campo ${fieldId}:`, value);
    
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
      console.log(`💰 [DEBUG] ${fieldId} - Encontrou objeto com preços:`, obj);      // Processa o price
      if (obj.price) {
        console.log(`💵 [DEBUG] ${fieldId} - Processando price:`, obj.price);
        
        const priceStr = String(obj.price).replace(/\./g, "").replace(",", ".");
        const price = parseFloat(priceStr);
        
        console.log(`💵 [DEBUG] ${fieldId} - Price string formatada:`, priceStr);
        console.log(`💵 [DEBUG] ${fieldId} - Price parseado:`, price);

        if (!isNaN(price)) {
          const result = price + (price * commissionPercent) / 100;
          const formattedResult = String(Math.trunc(result * 100) / 100).replace(".", ",");
          
          console.log(`💵 [DEBUG] ${fieldId} - Price original:`, price);
          console.log(`💵 [DEBUG] ${fieldId} - Price com comissão:`, result);
          console.log(`💵 [DEBUG] ${fieldId} - Price formatado final:`, formattedResult);
          
          obj.price = formattedResult;
        } else {
          console.log(`❌ [DEBUG] ${fieldId} - Price não é um número válido:`, price);
        }
      }      // Processa o promotional_price
      if (obj.promotional_price) {
        console.log(`🏷️ [DEBUG] ${fieldId} - Processando promotional_price:`, obj.promotional_price);
        
        const promoStr = String(obj.promotional_price)
          .replace(/\./g, "")
          .replace(",", ".");
        const promo = parseFloat(promoStr);
        
        console.log(`🏷️ [DEBUG] ${fieldId} - Promotional_price string formatada:`, promoStr);
        console.log(`🏷️ [DEBUG] ${fieldId} - Promotional_price parseado:`, promo);

        // Só aplica comissão se for um número válido E diferente de 0
        if (!isNaN(promo) && promo !== 0) {
          const result = promo + (promo * commissionPercent) / 100;
          const formattedResult = String(Math.trunc(result * 100) / 100).replace(".", ",");
          
          console.log(`🏷️ [DEBUG] ${fieldId} - Promotional_price original:`, promo);
          console.log(`🏷️ [DEBUG] ${fieldId} - Promotional_price com comissão:`, result);
          console.log(`🏷️ [DEBUG] ${fieldId} - Promotional_price formatado final:`, formattedResult);
          
          obj.promotional_price = formattedResult;
        } else {
          console.log(`❌ [DEBUG] ${fieldId} - Promotional_price não válido (NaN ou 0):`, promo);
        }
      }

      // Atualiza o valor processado no formValues
      console.log(`📋 [DEBUG] ${fieldId} - Objeto final após processamento:`, obj);
      updatedFormValues[fieldId] = obj;
    } else {
      console.log(`⏭️ [DEBUG] ${fieldId} - Não é um objeto com preços, pulando`);
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
