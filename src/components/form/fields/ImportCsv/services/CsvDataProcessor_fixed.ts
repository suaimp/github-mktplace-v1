import { v4 as uuidv4 } from "uuid";
import { supabase } from "../../../../../lib/supabase";
import { CsvImportData, FormEntryValue } from "../types";
import { UrlValidationService } from "../utils/UrlValidationService";

/**
 * Serviço responsável pela conversão de dados CSV para FormEntryValue
 * Agora cria TODOS os campos obrigatórios para compatibilidade com EntriesEditModal
 */
export class CsvDataProcessor {
  /**
   * Converte dados CSV para array de FormEntryValue com TODOS os campos obrigatórios
   */
  static async processCSVData(
    csvData: CsvImportData,
    formId: string
  ): Promise<{ entryValues: FormEntryValue[], entryIds: string[] }> {
    console.log("🔄 [CsvDataProcessor] Processando dados CSV com campos completos");

    // 1. Buscar TODOS os campos do formulário
    const { data: formFields, error } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', formId)
      .order('position');

    if (error || !formFields) {
      throw new Error(`Erro ao buscar campos do formulário: ${error?.message}`);
    }

    console.log("📋 [CsvDataProcessor] Campos do formulário encontrados:", formFields.length);

    // 2. Identificar campos específicos por tipo/nome
    const urlField = formFields.find(f => 
      f.field_type === 'url' || 
      f.label?.toLowerCase().includes('url') ||
      f.label?.toLowerCase().includes('site')
    );
    
    const daField = formFields.find(f => 
      f.label?.toLowerCase().includes('da') ||
      f.label?.toLowerCase().includes('domain authority') ||
      (f.field_type === 'number' && f.label?.toLowerCase().includes('da'))
    );
    
    const precoField = formFields.find(f => 
      f.field_type === 'product' ||
      f.label?.toLowerCase().includes('preço') ||
      f.label?.toLowerCase().includes('preco') ||
      f.label?.toLowerCase().includes('price')
    );

    console.log("🎯 [CsvDataProcessor] Campos mapeados:", {
      url: urlField?.label,
      da: daField?.label, 
      preco: precoField?.label
    });

    // 3. Determinar quantos registros temos
    const recordCount = Math.max(
      csvData.url?.length || 0,
      csvData.da?.length || 0,
      csvData.preco?.length || 0
    );

    console.log("📊 [CsvDataProcessor] Quantidade de registros:", recordCount);

    if (recordCount === 0) {
      throw new Error("Nenhum dado para importar");
    }

    const entryValues: FormEntryValue[] = [];
    const entryIds: string[] = [];

    // 4. Para cada registro (site)
    for (let i = 0; i < recordCount; i++) {
      const entryId = uuidv4();
      entryIds.push(entryId);

      console.log(`📝 [CsvDataProcessor] Processando registro ${i + 1}/${recordCount} - entryId: ${entryId}`);

      // 5. Para CADA campo do formulário, criar um valor
      for (const field of formFields) {
        let value: string | null = null;
        let valueJson: any = null;

        // Mapear dados do CSV para campos específicos
        if (field.id === urlField?.id && csvData.url?.[i]) {
          // Campo URL - aplicar formatação https://www
          value = UrlValidationService.formatUrl(csvData.url[i]);
          console.log(`🔗 [CsvDataProcessor] URL formatada: ${csvData.url[i]} → ${value}`);
        }
        else if (field.id === daField?.id && csvData.da?.[i]) {
          // Campo DA
          value = csvData.da[i];
          console.log(`📊 [CsvDataProcessor] DA: ${value}`);
        }
        else if (field.id === precoField?.id && csvData.preco?.[i]) {
          // Campo Preço - estrutura JSON completa
          const precoValue = csvData.preco[i];
          valueJson = {
            price: precoValue,
            old_price: precoValue,
            promotional_price: precoValue,
            old_promotional_price: precoValue
          };
          console.log(`💰 [CsvDataProcessor] Preço: ${precoValue}`);
        }
        else {
          // Campos não mapeados - deixar vazios em vez de forçar valores padrão
          // Apenas criar entrada se o campo tiver algum valor natural
          value = null;
          valueJson = null;
        }

        // Criar entrada para TODOS os campos (obrigatórios e opcionais)
        entryValues.push({
          entry_id: entryId,
          field_id: field.id,
          value: value,
          value_json: valueJson
        });
      }
    }

    console.log("📦 [CsvDataProcessor] Resumo:");
    console.log(`   - Registros processados: ${recordCount}`);
    console.log(`   - Campos por registro: ${formFields.length}`);
    console.log(`   - Total FormEntryValue: ${entryValues.length}`);
    console.log(`   - Campos preenchidos apenas com dados do CSV (URL, DA, Preço)`);
    console.log(`   - Demais campos ficam vazios/null para preenchimento posterior`);
    
    return { entryValues, entryIds };
  }
}
