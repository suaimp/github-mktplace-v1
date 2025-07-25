import { supabase } from "../../../../../lib/supabase";
import { FormEntryValue } from "../types";

/**
 * Serviço responsável pela inserção de valores de entry
 */
export class FormEntryValueService {
  /**
   * Insere múltiplos valores seguindo a mesma estratégia do FormRenderer
   */
  static async insertEntryValues(values: FormEntryValue[]): Promise<void> {
    try {
      console.log("📦 [FormEntryValueService] Inserindo", values.length, "valores");
      console.log("🔍 [FormEntryValueService] Primeiros 3 valores:", values.slice(0, 3));

      const { error: valuesError } = await supabase
        .from("form_entry_values")
        .insert(values);

      if (valuesError) {
        console.error("❌ [FormEntryValueService] Erro ao inserir valores:", valuesError);
        throw new Error("Erro ao salvar dados do formulário. Tente novamente.");
      }

      console.log("✅ [FormEntryValueService] Valores inseridos com sucesso!");

    } catch (error: any) {
      console.error("❌ [FormEntryValueService] Erro no insertEntryValues:", error);
      throw error;
    }
  }
}
