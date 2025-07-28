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
            promotional_price: "0",
            old_promotional_price: "0"
          };
          console.log(`💰 [CsvDataProcessor] Preço: ${precoValue}, Preço promocional: 0`);
        }
        else {
          // Campos não mapeados - valores padrão para campos obrigatórios
          if (field.is_required) {
            switch (field.field_type) {
              case 'email':
                value = "nao-informado@exemplo.com";
                break;
              case 'url':
                value = "https://www.nao-informado.com";
                break;
              case 'text':
              case 'textarea':
                value = "Não informado";
                break;
              case 'number':
                value = "0";
                break;
              case 'select':
                // Verificar primeiro se é campo específico
                console.log(`🔍 [CsvDataProcessor] Analisando campo select: "${field.label}" - id: ${field.id}`);
                
                if (field.label?.toLowerCase().includes('patrocinado') || field.id === '445441d1-bde2-4895-ae47-3da4ea03d6f7') {
                  // Campo "Artigo é patrocinado" sempre usa "Não"
                  console.log(`✅ [CsvDataProcessor] Campo patrocinado detectado! Usando "Não"`);
                  value = "Não";
                } else {
                  // Para outros selects, usar primeira opção disponível
                  const settings = field.form_field_settings;
                  if (settings?.options && Array.isArray(settings.options) && settings.options.length > 0) {
                    console.log(`📋 [CsvDataProcessor] Campo select "${field.label}" tem ${settings.options.length} opções:`, settings.options);
                    value = settings.options[0].value || settings.options[0];
                    console.log(`✅ [CsvDataProcessor] Usando primeira opção: "${value}"`);
                  } else {
                    console.log(`⚠️ [CsvDataProcessor] Campo select "${field.label}" sem opções, usando padrão`);
                    value = "Padrão";
                  }
                }
                break;
              case 'product':
                valueJson = {
                  price: "0",
                  old_price: "0", 
                  promotional_price: "0",
                  old_promotional_price: "0"
                };
                break;
              case 'multiselect':
              case 'checkbox':
                valueJson = [];
                break;
              case 'brand':
                value = "Marca não informada";
                break;
              case 'category':
                value = "Categoria não informada";
                break;
              default:
                value = "Não informado";
            }
            console.log(`⚠️ [CsvDataProcessor] Campo obrigatório preenchido: ${field.label} = ${value || JSON.stringify(valueJson)}`);
          }
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
    console.log(`   - Campos obrigatórios preenchidos: ${formFields.filter(f => f.is_required).length * recordCount}`);
    
    return { entryValues, entryIds };
  }
}
