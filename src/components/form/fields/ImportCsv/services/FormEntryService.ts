import { supabase } from "../../../../../lib/supabase";
import { FormEntry } from "../types";

/**
 * Serviço responsável pela criação de entries de formulário
 */
export class FormEntryService {
  /**
   * Cria um novo form_entry seguindo a mesma estratégia do FormRenderer
   */
  static async createFormEntry(formId: string, userId?: string): Promise<FormEntry> {
    try {
      console.log("📝 [FormEntryService] Criando form_entry para formId:", formId);

      const { data: entry, error: entryError } = await supabase
        .from("form_entries")
        .insert([
          {
            form_id: formId,
            ip_address: null,
            user_agent: navigator.userAgent,
            created_by: userId || null,
            status: "em_analise",
          },
        ])
        .select()
        .single();

      if (entryError) {
        console.error("❌ [FormEntryService] Erro ao criar form_entry:", entryError);
        throw new Error("Erro ao criar entrada do formulário. Tente novamente.");
      }

      if (!entry) {
        throw new Error("Falha ao criar entrada. Tente novamente.");
      }

      console.log("✅ [FormEntryService] Form_entry criado com sucesso:", entry.id);
      return entry as FormEntry;

    } catch (error: any) {
      console.error("❌ [FormEntryService] Erro no createFormEntry:", error);
      throw error;
    }
  }
}
