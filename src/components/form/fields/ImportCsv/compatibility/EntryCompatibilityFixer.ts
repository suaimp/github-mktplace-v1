import { supabase } from "../../../../../lib/supabase";

/**
 * Serviço responsável por corrigir incompatibilidades entre CSV Import e EntriesEditModal
 */
export class EntryCompatibilityFixer {
  /**
   * Corrige um registro para ser compatível com EntriesEditModal
   */
  static async fixEntry(entryId: string, formId: string): Promise<boolean> {
    try {
      console.log("🔧 [EntryCompatibilityFixer] Iniciando correção do entry:", entryId);

      // 1. Buscar todos os campos do formulário
      const { data: formFields, error: fieldsError } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("position");

      if (fieldsError || !formFields) {
        throw new Error("Erro ao buscar campos do formulário");
      }

      // 2. Buscar valores existentes do entry
      const { data: existingValues, error: valuesError } = await supabase
        .from("form_entry_values")
        .select("*")
        .eq("entry_id", entryId);

      if (valuesError) {
        throw new Error("Erro ao buscar valores existentes");
      }

      const existingFieldIds = (existingValues || []).map((v: any) => v.field_id);
      const missingFields = formFields.filter(field => 
        !existingFieldIds.includes(field.id)
      );

      // 3. Criar valores padrão para campos faltantes
      const defaultValues = missingFields.map(field => ({
        entry_id: entryId,
        field_id: field.id,
        value: this.getDefaultValueForField(field),
        value_json: this.getDefaultJsonValueForField(field)
      })).filter(v => v.value !== null || v.value_json !== null);

      // 4. Inserir valores padrão se houver campos faltantes
      if (defaultValues.length > 0) {
        const { error: insertError } = await supabase
          .from("form_entry_values")
          .insert(defaultValues);

        if (insertError) {
          console.error("❌ [EntryCompatibilityFixer] Erro ao inserir valores padrão:", insertError);
          throw insertError;
        }

        console.log(`✅ [EntryCompatibilityFixer] Adicionados ${defaultValues.length} campos faltantes`);
      }

      // 5. Corrigir valores incompatíveis existentes
      const updatedValues: Array<{id: string; value: string | null; value_json: any}> = [];
      for (const value of existingValues || []) {
        const field = formFields.find(f => f.id === value.field_id);
        if (!field) continue;

        const correctedValue = this.correctValueForField(value, field);
        if (correctedValue && 
            (correctedValue.value !== value.value || 
             JSON.stringify(correctedValue.value_json) !== JSON.stringify(value.value_json))) {
          updatedValues.push({
            id: value.id,
            ...correctedValue
          });
        }
      }

      // 6. Atualizar valores corrigidos
      for (const update of updatedValues) {
        const { error: updateError } = await supabase
          .from("form_entry_values")
          .update({
            value: update.value,
            value_json: update.value_json
          })
          .eq("id", update.id);

        if (updateError) {
          console.error("❌ [EntryCompatibilityFixer] Erro ao atualizar valor:", updateError);
        }
      }

      console.log(`✅ [EntryCompatibilityFixer] Entry ${entryId} corrigido com sucesso`);
      return true;

    } catch (error: any) {
      console.error("❌ [EntryCompatibilityFixer] Erro na correção:", error);
      return false;
    }
  }

  /**
   * Retorna valor padrão para um campo específico baseado em seu tipo e configurações
   */
  private static getDefaultValueForField(field: any): string | null {
    // Se o campo é obrigatório, garantir que tenha um valor válido
    const isRequired = field.is_required;
    
    switch (field.field_type) {
      case "text":
      case "textarea":
        return isRequired ? "Não informado" : "";
      case "email":
        return isRequired ? "email@example.com" : "";
      case "url":
        return "https://www.example.com";
      case "number":
      case "commission":
        return "0";
      case "select":
        // Para campos select obrigatórios, usar primeira opção disponível
        const options = field.form_field_settings?.options;
        if (options && options.length > 0) {
          return options[0].value || "";
        }
        return isRequired ? "default" : "";
      case "da":
        return isRequired ? "0" : "";
      default:
        return isRequired ? "Não informado" : null;
    }
  }

  /**
   * Retorna valor JSON padrão para um campo específico
   */
  private static getDefaultJsonValueForField(field: any): any {
    switch (field.field_type) {
      case "product":
        return {
          price: "0",
          old_price: "0",
          promotional_price: "0",
          old_promotional_price: "0"
        };
      case "multiselect":
      case "checkbox":
        return [];
      default:
        return null;
    }
  }

  /**
   * Corrige um valor específico baseado no tipo do campo
   */
  private static correctValueForField(value: any, field: any): any {
    switch (field.field_type) {
      case "url":
        if (value.value && !value.value.startsWith("http")) {
          return {
            value: `https://${value.value}`,
            value_json: value.value_json
          };
        }
        break;

      case "product":
        if (value.value_json) {
          const json = value.value_json;
          // Garantir que todos os campos de preço existam
          const correctedJson = {
            price: json.price || "0",
            old_price: json.old_price || json.price || "0",
            promotional_price: json.promotional_price || json.price || "0",
            old_promotional_price: json.old_promotional_price || json.price || "0"
          };
          
          if (JSON.stringify(correctedJson) !== JSON.stringify(json)) {
            return {
              value: value.value,
              value_json: correctedJson
            };
          }
        }
        break;
    }

    return null;
  }

  /**
   * Corrige múltiplos registros de uma vez
   */
  static async fixBatch(entryIds: string[], formId: string): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const entryId of entryIds) {
      const result = await this.fixEntry(entryId, formId);
      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    console.log(`📊 [EntryCompatibilityFixer] Batch concluído: ${success} sucessos, ${failed} falhas`);
    return { success, failed };
  }
}
