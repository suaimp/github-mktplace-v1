import { supabase } from "../../../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { FormField, CsvImportData, FormEntryValue, CsvImportResult } from "../types/csvImportTypes";

export class CsvImportService {
  /**
   * Converte preço do formato brasileiro/CSV para número
   */
  private static processPriceValue(priceString: string): string {
    console.log(`🔍 [processPriceValue] Input:`, { priceString, type: typeof priceString });
    
    if (!priceString) return "0,00";
    
    let cleanedPrice = String(priceString);
    
    // Remove símbolos de moeda, espaços, aspas (simples e duplas) e barras invertidas
    cleanedPrice = cleanedPrice.replace(/[R$\s"'\\]/g, "");
    
    console.log(`🧹 [processPriceValue] Após limpeza:`, cleanedPrice);
    
    // Tratamento para diferentes formatos, preservando os centavos originais
    if (cleanedPrice.includes(",") && cleanedPrice.includes(".")) {
      // Formato brasileiro completo: 17.390,28 -> 17390,28
      cleanedPrice = cleanedPrice.replace(/\./g, "");
    } else if (cleanedPrice.includes(",")) {
      // Apenas vírgula: 17390,28 -> 17390,28 (mantém como está)
      // Não faz nada, já está no formato correto
    } else if (cleanedPrice.includes(".")) {
      // Formato americano ou decimal: 4.28 -> 4,28
      const parts = cleanedPrice.split(".");
      if (parts.length === 2 && parts[1].length <= 2) {
        // É decimal: 4.28 -> 4,28
        cleanedPrice = cleanedPrice.replace(".", ",");
      } else {
        // Separador de milhares: 1.000 -> 1000
        cleanedPrice = cleanedPrice.replace(/\./g, "");
      }
    }
    
    // Se não tem vírgula (centavos), adiciona ,00
    if (!cleanedPrice.includes(",")) {
      cleanedPrice = cleanedPrice + ",00";
    }
    
    console.log(`🔧 [processPriceValue] Após formatação:`, cleanedPrice);
    
    // Valida se é um número válido
    const testValue = cleanedPrice.replace(",", ".");
    const numericValue = parseFloat(testValue);
    console.log(`🧮 [processPriceValue] Teste numérico:`, { testValue, numericValue, isValid: !isNaN(numericValue) });
    
    if (isNaN(numericValue)) return "0,00";
    
    // Retorna no formato brasileiro preservando os centavos originais
    console.log(`✅ [processPriceValue] Resultado final:`, cleanedPrice);
    return cleanedPrice;
  }

  /**
   * Converte dados do CSV para o formato da tabela form_entry_values
   */
  static async importCsvData(
    csvData: CsvImportData,
    formFields: FormField[]
  ): Promise<CsvImportResult> {
    try {
      console.log("🚀 CsvImportService.importCsvData iniciado");
      console.log("📥 csvData:", csvData);
      console.log("📋 formFields:", formFields);

      // Criar mapa de field_key -> field_id
      const fieldMap = new Map<string, string>();
      formFields.forEach(field => {
        // Suporte tanto para 'key' quanto para 'field_key' 
        const fieldKey = field.key || field.field_key;
        if (fieldKey) {
          fieldMap.set(fieldKey, field.id);
        }
        
        // Também mapear por label para facilitar o mapeamento
        if (field.label) {
          const labelKey = field.label.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[()]/g, '')
            .replace('url_do_site', 'url')
            .replace('da_domain_authority', 'da')
            .replace('preço', 'preco');
          fieldMap.set(labelKey, field.id);
        }
      });

      console.log("🗺️ fieldMap criado:", Object.fromEntries(fieldMap));

      // Verificar se todos os campos mapeados existem no formulário
      const requiredFields = ['url', 'da', 'preco'];
      for (const fieldKey of requiredFields) {
        if (!fieldMap.has(fieldKey)) {
          return { 
            success: false, 
            error: `Campo '${fieldKey}' não encontrado no formulário` 
          };
        }
      }

      // Determinar quantos registros (sites) temos
      const recordCount = Math.max(
        csvData.url?.length || 0,
        csvData.da?.length || 0,
        csvData.preco?.length || 0
      );

      console.log("📊 Quantidade de registros:", recordCount);

      if (recordCount === 0) {
        return { success: false, error: "Nenhum dado para importar" };
      }

      const formEntryValues: FormEntryValue[] = [];
      const entryIds: string[] = [];

      // Para cada registro (site)
      for (let i = 0; i < recordCount; i++) {
        const entryId = uuidv4();
        entryIds.push(entryId);

        console.log(`📝 Processando registro ${i + 1}/${recordCount} - entryId: ${entryId}`);

        // Campo URL
        if (csvData.url && csvData.url[i]) {
          formEntryValues.push({
            entry_id: entryId,
            field_id: fieldMap.get('url')!,
            value: csvData.url[i],
            value_json: null
          });
        }

        // Campo DA
        if (csvData.da && csvData.da[i]) {
          formEntryValues.push({
            entry_id: entryId,
            field_id: fieldMap.get('da')!,
            value: csvData.da[i],
            value_json: null
          });
        }

        // Campo Preço (JSON complexo como na tabela)
        if (csvData.preco && csvData.preco[i]) {
          const rawPrecoValue = csvData.preco[i];
          const processedPrice = this.processPriceValue(rawPrecoValue);
          
          formEntryValues.push({
            entry_id: entryId,
            field_id: fieldMap.get('preco')!,
            value: null,
            value_json: {
              price: processedPrice,
              old_price: processedPrice,
              promotional_price: processedPrice,
              old_promotional_price: processedPrice
            }
          });
        }
      }

      console.log("📦 Total de form_entry_values criados:", formEntryValues.length);
      console.log("🔍 Primeiros 3 registros:", formEntryValues.slice(0, 3));

      // Salvar no banco
      console.log("💾 Executando insert no Supabase...");
      const { error } = await supabase
        .from("form_entry_values")
        .insert(formEntryValues);

      if (error) {
        console.error("❌ Erro ao salvar dados do CSV:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Dados salvos com sucesso no banco!");
      return { 
        success: true, 
        entries: entryIds 
      };

    } catch (error: any) {
      console.error("Erro no import do CSV:", error);
      return { success: false, error: error.message };
    }
  }
}
