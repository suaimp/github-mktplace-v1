import { supabase } from "../../../../../lib/supabase";
import { FormEntryComparisonResult } from "./types";

/**
 * Serviço responsável por analisar a compatibilidade entre registros CSV e EntriesEditModal
 */
export class EntryCompatibilityAnalyzer {
  /**
   * Analisa se um registro do CSV Import é compatível com o EntriesEditModal
   */
  static async analyzeEntry(
    entryId: string, 
    formId: string
  ): Promise<FormEntryComparisonResult> {
    try {
      console.log("🔍 [EntryCompatibilityAnalyzer] Analisando compatibilidade do entry:", entryId);

      // 1. Buscar dados do entry específico
      const { data: entryData, error: entryError } = await supabase
        .from("form_entries")
        .select(`
          id,
          form_id,
          status,
          created_by,
          created_at,
          form_entry_values!inner(
            field_id,
            value,
            value_json
          )
        `)
        .eq("id", entryId)
        .single();

      if (entryError || !entryData) {
        throw new Error(`Entry ${entryId} não encontrado`);
      }

      // 2. Buscar todos os campos do formulário
      const { data: formFields, error: fieldsError } = await supabase
        .from("form_fields")
        .select("*")
        .eq("form_id", formId)
        .order("position");

      if (fieldsError || !formFields) {
        throw new Error("Erro ao buscar campos do formulário");
      }

      // 3. Analisar diferenças (remover busca de registro padrão desnecessária)
      const entryValues = entryData.form_entry_values || [];
      const entryFieldIds = entryValues.map((v: any) => v.field_id);
      const allFieldIds = formFields.map(f => f.id);

      const missingFields = allFieldIds.filter(fieldId => 
        !entryFieldIds.includes(fieldId)
      );

      const incompatibleValues: string[] = [];
      const recommendations: string[] = [];

      // Verificar estrutura dos valores existentes
      entryValues.forEach((value: any) => {
        const field = formFields.find(f => f.id === value.field_id);
        if (!field) return;

        // Verificar campos obrigatórios vazios
        if (field.is_required && 
            (value.value === null || value.value === undefined || value.value === "") &&
            (value.value_json === null || value.value_json === undefined)) {
          incompatibleValues.push(`Campo obrigatório ${field.label} está vazio`);
          recommendations.push(`Preencher valor para o campo obrigatório ${field.label}`);
        }

        // Verificar se campo price tem estrutura JSON adequada
        if (field.field_type === 'product' && value.value_json) {
          const jsonValue = value.value_json;
          if (!jsonValue.price || !jsonValue.old_price) {
            incompatibleValues.push(`Campo ${field.label} tem estrutura JSON incompleta`);
            recommendations.push(`Completar estrutura JSON do campo ${field.label}`);
          }
        }

        // Verificar se URLs têm formato adequado
        if (field.field_type === 'url' && value.value) {
          if (!value.value.startsWith('http')) {
            incompatibleValues.push(`URL ${field.label} sem protocolo HTTP`);
            recommendations.push(`Adicionar https:// ao campo ${field.label}`);
          }
        }

        // Verificar emails
        if (field.field_type === 'email' && value.value && !value.value.includes('@')) {
          incompatibleValues.push(`Email ${field.label} tem formato inválido`);
          recommendations.push(`Corrigir formato do email ${field.label}`);
        }
      });

      // Verificar campos obrigatórios que estão completamente faltando
      const missingRequiredFields = missingFields.filter(fieldId => {
        const field = formFields.find(f => f.id === fieldId);
        return field && field.is_required;
      });

      if (missingRequiredFields.length > 0) {
        missingRequiredFields.forEach(fieldId => {
          const field = formFields.find(f => f.id === fieldId);
          if (field) {
            incompatibleValues.push(`Campo obrigatório ${field.label} está faltando`);
            recommendations.push(`Adicionar campo obrigatório ${field.label}`);
          }
        });
      }

      // Recomendações baseadas em campos faltantes
      if (missingFields.length > 0) {
        recommendations.push(`Adicionar ${missingFields.length} campos faltantes`);
      }

      const isComplete = missingFields.length === 0 && incompatibleValues.length === 0;

      console.log(`📊 [EntryCompatibilityAnalyzer] Entry ${entryId} - Compatível: ${isComplete}`);

      return {
        isComplete,
        missingFields: missingFields.map(fieldId => {
          const field = formFields.find(f => f.id === fieldId);
          return field?.label || fieldId;
        }),
        incompatibleValues,
        recommendations
      };

    } catch (error: any) {
      console.error("❌ [EntryCompatibilityAnalyzer] Erro na análise:", error);
      throw error;
    }
  }

  /**
   * Analisa compatibilidade de múltiplos registros de uma vez
   */
  static async analyzeBatch(
    entryIds: string[], 
    formId: string
  ): Promise<FormEntryComparisonResult[]> {
    const results: FormEntryComparisonResult[] = [];

    for (const entryId of entryIds) {
      try {
        const result = await this.analyzeEntry(entryId, formId);
        results.push(result);
      } catch (error) {
        console.error(`Erro ao analisar entry ${entryId}:`, error);
        // Adicionar resultado com erro
        results.push({
          isComplete: false,
          missingFields: [],
          incompatibleValues: [`Erro ao analisar entry ${entryId}`],
          recommendations: [`Verificar manualmente o entry ${entryId}`]
        });
      }
    }

    return results;
  }
}
