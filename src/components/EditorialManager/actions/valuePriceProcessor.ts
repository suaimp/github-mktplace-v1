/**
 * Processador de valores para entries do Editorial Manager
 * Lógica extraída para processar valores com price e promotional_price
 */

interface EntryValue {
  field_id: string;
  value: string;
  value_json: any;
}

/**
 * Processa um valor individual de entry, tratando casos especiais de price/promotional_price
 */
export async function processEntryValue(entryValue: EntryValue): Promise<any> {
  const { value, value_json } = entryValue;

  console.log(`🔍 [processEntryValue] field_id: ${entryValue.field_id}`);
  console.log(`   - value:`, value);
  console.log(`   - value_json:`, value_json);

  // Se value_json não é null, usa ele diretamente
  if (value_json !== null) {
    console.log(`✅ [processEntryValue] Usando value_json para field ${entryValue.field_id}`);
    // Se tem price no value_json, busca dados relacionados
    if (value_json && typeof value_json === "object") {
      if (value_json.price) {
        console.log(`💰 [processEntryValue] Encontrou price em value_json:`, value_json.price);
      }
      if (value_json.promotional_price) {
        console.log(`🏷️ [processEntryValue] Encontrou promotional_price em value_json:`, value_json.promotional_price);
      }
    }
    return value_json;
  }

  // Caso contrário, processa o valor string
  try {
    const parsedValue = JSON.parse(value);

    if (
      parsedValue &&
      typeof parsedValue === "object" &&
      parsedValue.promotional_price
    ) {
      // Removido console.log("valuePriceProcessor.ts - Found promotional_price in parsed value:", parsedValue.promotional_price);

      // Se tem promotional_price e price, é provavelmente um campo de produto
      // Retorna o objeto completo para preservar ambos os valores
      if (parsedValue.price) {
        // Removido console.log(
        //   "valuePriceProcessor.ts - Found both price and promotional_price:",
        //   {
        //     price: parsedValue.price,
        //     promotional_price: parsedValue.promotional_price
        //   }
        // );
        return parsedValue;
      } else {
        // Se só tem promotional_price, retorna apenas esse valor
        // Removido console.log(
        //   "valuePriceProcessor.ts - Found only promotional_price:",
        //   parsedValue.promotional_price
        // );
        return parsedValue.promotional_price;
      }
    } else {
      return value;
    }
  } catch {
    // Se não conseguir fazer parse, usa o valor original
    return value;
  }
}

/**
 * Processa todos os valores de uma entry, retornando um objeto com field_id como chave
 */
export async function processEntryValues(
  entryValues: EntryValue[]
): Promise<Record<string, any>> {
  const processedValues: Record<string, any> = {};

  // Processa todos os valores de forma assíncrona
  await Promise.all(
    entryValues.map(async (entryValue) => {
      processedValues[entryValue.field_id] = await processEntryValue(
        entryValue
      );
    })
  );
  return processedValues;
}
