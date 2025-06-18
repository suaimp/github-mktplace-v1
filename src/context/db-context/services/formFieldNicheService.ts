import { supabase } from "../../../lib/supabase";

export interface NicheOption {
  text: string;
  icon?: string; // nome do ícone (ex: "BoltIcon", "UserIcon")
}

// Função utilitária para limpar dados JSON aninhados
export function parseNicheData(data: any): NicheOption[] {
  console.log("[parseNicheData] Input data:", data);
  console.log("[parseNicheData] Input data stringified:", JSON.stringify(data));

  if (!Array.isArray(data)) {
    console.log("[parseNicheData] Data is not array, returning empty");
    return [];
  }

  const result = data.map((item: any, index: number) => {
    console.log(`[parseNicheData] Processing item ${index}:`, item);
    console.log(`[parseNicheData] Item ${index} type:`, typeof item);
    console.log(
      `[parseNicheData] Item ${index} stringified:`,
      JSON.stringify(item)
    );

    // Se é string, tenta fazer parse
    if (typeof item === "string") {
      console.log(`[parseNicheData] Item ${index} is string, trying to parse`);
      try {
        const parsed = JSON.parse(item);
        console.log(`[parseNicheData] Item ${index} parsed:`, parsed);
        return parseNicheData([parsed])[0];
      } catch {
        console.log(
          `[parseNicheData] Item ${index} parse failed, treating as text`
        );
        return { text: item, icon: undefined };
      }
    }

    // Se é objeto
    if (item && typeof item === "object") {
      console.log(
        `[parseNicheData] Item ${index} is object, extracting text and icon`
      );
      console.log(`[parseNicheData] Item ${index} keys:`, Object.keys(item));
      console.log(`[parseNicheData] Item ${index} text:`, item.text);
      console.log(`[parseNicheData] Item ${index} icon:`, item.icon);
      console.log(`[parseNicheData] Item ${index} niche:`, item.niche);
      console.log(`[parseNicheData] Item ${index} price:`, item.price);

      // Caso especial: se tem propriedade 'niche' que é uma string JSON
      if (item.niche && typeof item.niche === "string") {
        console.log(
          `[parseNicheData] Item ${index} has niche property as string`
        );

        // Verifica se a string niche é JSON
        if (item.niche.startsWith("{") && item.niche.includes("text")) {
          try {
            const parsedNiche = JSON.parse(item.niche);
            console.log(
              `[parseNicheData] Item ${index} parsed niche:`,
              parsedNiche
            );

            const result = {
              text: parsedNiche.text || "",
              icon: parsedNiche.icon
            };
            console.log(
              `[parseNicheData] Item ${index} final result from parsed niche:`,
              result
            );
            return result;
          } catch (e) {
            console.log(
              `[parseNicheData] Item ${index} failed to parse niche JSON, treating as text`
            );
            // Se falhar o parse, usa o valor da string como texto
            const result = { text: item.niche, icon: undefined };
            console.log(
              `[parseNicheData] Item ${index} final result as text:`,
              result
            );
            return result;
          }
        } else {
          // String simples na propriedade niche
          const result = { text: item.niche, icon: undefined };
          console.log(
            `[parseNicheData] Item ${index} final result from simple niche:`,
            result
          );
          return result;
        }
      }

      // Se o text também é JSON string, faz parse recursivo
      if (typeof item.text === "string" && item.text.startsWith("{")) {
        console.log(
          `[parseNicheData] Item ${index} text looks like JSON, parsing recursively`
        );
        try {
          const parsedText = JSON.parse(item.text);
          console.log(
            `[parseNicheData] Item ${index} parsed text:`,
            parsedText
          );
          return parseNicheData([parsedText])[0];
        } catch {
          console.log(`[parseNicheData] Item ${index} recursive parse failed`);
          return { text: item.text || "", icon: item.icon };
        }
      }

      // Prioriza 'text', mas se não tiver, usa 'niche' (compatibilidade com dados antigos)
      const text = item.text || item.niche || "";
      const icon = item.icon;

      const result = { text, icon };
      console.log(`[parseNicheData] Item ${index} final result:`, result);
      return result;
    }

    console.log(
      `[parseNicheData] Item ${index} is not string or object, returning empty`
    );
    return { text: "", icon: undefined };
  });

  console.log("[parseNicheData] Final result:", result);
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
    console.error("Erro ao buscar form_field_niche:", error);
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
    console.error("Erro ao buscar form_field_niche por id:", error);
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
    console.error("Erro ao buscar form_field_niche por form_field_id:", error);
    return null;
  }
  return data as FormFieldNiche;
}

export async function createFormFieldNiche(
  input: FormFieldNicheInput
): Promise<FormFieldNiche | null> {
  console.log("[createFormFieldNiche] Creating with input:", input);
  console.log("[createFormFieldNiche] Options detail:", input.options);
  if (Array.isArray(input.options)) {
    input.options.forEach((opt, idx) => {
      console.log(`[createFormFieldNiche] Option ${idx}:`, opt);
      if (typeof opt === "object" && opt.icon) {
        console.log(
          `[createFormFieldNiche] Icon found in option ${idx}:`,
          opt.icon
        );
      }
    });
  }

  const { data, error } = await supabase
    .from("form_field_niche")
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar form_field_niche:", error);
    return null;
  }

  console.log("[createFormFieldNiche] Created successfully:", data);
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
