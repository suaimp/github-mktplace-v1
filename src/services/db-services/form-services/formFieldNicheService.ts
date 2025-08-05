import { supabase } from "../../../lib/supabase";

export interface NicheOption {
  text: string;
  icon?: string; // nome do ícone (ex: "BoltIcon", "UserIcon")
}

// Função utilitária para limpar dados JSON aninhados
export function parseNicheData(data: any): NicheOption[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const result = data.map((item: any) => {
    // Se é string, tenta fazer parse
    if (typeof item === "string") {
      try {
        const parsed = JSON.parse(item);
        return parseNicheData([parsed])[0];
      } catch {
        return { text: item, icon: undefined };
      }
    }

    // Se é objeto
    if (item && typeof item === "object") {
      // Caso especial: se tem propriedade 'niche' que é uma string JSON
      if (item.niche && typeof item.niche === "string") {
        // Verifica se a string niche é JSON
        if (item.niche.startsWith("{") && item.niche.includes("text")) {
          try {
            const parsedNiche = JSON.parse(item.niche);

            const result = {
              text: parsedNiche.text || "",
              icon: parsedNiche.icon
            };
            return result;
          } catch (e) {
            // Se falhar o parse, usa o valor da string como texto
            const result = { text: item.niche, icon: undefined };
            return result;
          }
        } else {
          // String simples na propriedade niche
          const result = { text: item.niche, icon: undefined };
          return result;
        }
      }

      // Se o text também é JSON string, faz parse recursivo
      if (typeof item.text === "string" && item.text.startsWith("{")) {
        try {
          const parsedText = JSON.parse(item.text);
          return parseNicheData([parsedText])[0];
        } catch {
          return { text: item.text || "", icon: item.icon };
        }
      }

      // Prioriza 'text', mas se não tiver, usa 'niche' (compatibilidade com dados antigos)
      const text = item.text || item.niche || "";
      const icon = item.icon;

      const result = { text, icon };
      return result;
    }

    return { text: "", icon: undefined };
  });

  return result;
}

// Função para garantir que os dados estão no formato correto antes de salvar
export function sanitizeNicheOptions(options: any[]): NicheOption[] {
  const parsed = parseNicheData(options);
  return parsed.filter((opt) => opt.text && opt.text.trim() !== "");
}

export interface FormFieldNiche {
  id: string;
  form_field_id: string;
  niche: string;
  price: number | null;
  options: string[] | NicheOption[] | null;
  created_at: string;
  updated_at: string;
}

export type FormFieldNicheInput = {
  form_field_id: string;
  options: string[] | NicheOption[];
};

export async function getFormFieldNiches(): Promise<FormFieldNiche[] | null> {
  const { data, error } = await supabase.from("form_field_niche").select("*");
  if (error) {
    return null;
  }
  return data as FormFieldNiche[];
}

export async function getFormFieldNicheById(
  id: string
): Promise<FormFieldNiche | null> {
  const { data, error } = await supabase
    .from("form_field_niche")
    .select("*")
    .eq("id", id)
    .single();
  if (error) {
    return null;
  }
  return data as FormFieldNiche;
}

export async function getFormFieldNicheByFormFieldId(
  form_field_id: string
): Promise<FormFieldNiche | null> {
  const { data, error } = await supabase
    .from("form_field_niche")
    .select("*")
    .eq("form_field_id", form_field_id)
    .maybeSingle();
  if (error) {
    return null;
  }
  return data as FormFieldNiche;
}

export async function createFormFieldNiche(
  input: FormFieldNicheInput
): Promise<FormFieldNiche | null> {
  const { data, error } = await supabase
    .from("form_field_niche")
    .insert([input])
    .select()
    .single();

  if (error) {
    return null;
  }

  return data as FormFieldNiche;
}

export async function updateFormFieldNiche(
  form_field_id: string,
  updates: Partial<FormFieldNicheInput>
): Promise<FormFieldNiche | null> {
  try {
    // Busca o primeiro registro com o form_field_id
    const { data: rows, error: fetchError } = await supabase
      .from("form_field_niche")
      .select("id, options")
      .eq("form_field_id", form_field_id)
      .limit(1);

    console.log("[updateFormFieldNiche] Encontrado:", rows);
    if (fetchError) {
      console.error("Erro ao buscar form_field_niche:", fetchError);
      throw fetchError;
    }

    if (rows && rows.length > 0) {
      console.log(
        "[updateFormFieldNiche] Fazendo update para id:",
        rows[0].id,
        "com",
        updates
      );
      console.log(
        "[updateFormFieldNiche] Updates options detail:",
        updates.options
      );
      if (Array.isArray(updates.options)) {
        updates.options.forEach((opt, idx) => {
          console.log(`[updateFormFieldNiche] Update option ${idx}:`, opt);
          if (typeof opt === "object" && opt.icon) {
            console.log(
              `[updateFormFieldNiche] Icon found in update option ${idx}:`,
              opt.icon
            );
          }
        });
      }
      try {
        const { data, error } = await supabase
          .from("form_field_niche")
          .update(updates)
          .eq("id", rows[0].id)
          .select()
          .single();
        if (error) {
          console.error("Erro ao atualizar form_field_niche:", error);
          throw error;
        }
        console.log("[updateFormFieldNiche] Update result:", data);
        return data as FormFieldNiche;
      } catch (err) {
        console.error("[updateFormFieldNiche] CATCH update:", err);
        throw err;
      }
    }

    // Se não encontrou, retorna null para fazer o insert depois
    console.log(
      "[updateFormFieldNiche] Nenhum registro encontrado para update, retornando null"
    );
    return null;
  } catch (err) {
    console.error("Erro inesperado no updateFormFieldNiche:", err);
    throw err;
  }
}

export async function deleteFormFieldNiche(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("form_field_niche")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("Erro ao deletar form_field_niche:", error);
    return false;
  }
  return true;
}
