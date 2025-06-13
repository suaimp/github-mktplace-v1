import { supabase } from "../../../lib/supabase";

export interface FormField {
  id: string;
  form_id: string;
  field_type: string;
  label: string;
  description?: string;
  placeholder?: string;
  default_value?: string;
  options?: any;
  validation_rules?: any;
  is_required?: boolean;
  position?: number;
  width?: string;
  css_class?: string;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at?: string;
  modal_content?: string;
}

/**
 * Busca todos os campos de formulário
 */
export async function getFormFields() {
  const { data, error } = await supabase
    .from("form_fields")
    .select("*")
    .order("position");

  if (error) {
    return [];
  }
  return data as FormField[];
}

/**
 * Busca campos de formulário por form_id
 */
export async function getFormFieldsByFormId(formId: string) {
  const { data, error } = await supabase
    .from("form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("position");

  if (error) {
    return [];
  }
  return data as FormField[];
}

/**
 * Cria um mapeamento de field_type para id
 * Retorna um array no formato { field_type: id }
 */
export async function getFormFieldsMapping() {
  const fields = await getFormFields();

  const mapping = fields.map((field) => ({
    field_type: field.field_type,
    id: field.id,
    label: field.label
  }));

  return mapping;
}

/**
 * Busca especificamente o campo de comissão
 */
export async function getCommissionField() {
  const { data, error } = await supabase
    .from("form_fields")
    .select("*")
    .or(
      "field_type.eq.commission,label.ilike.%comissão%,label.ilike.%commission%"
    )
    .limit(1);

  if (error) {
    return null;
  }

  return data?.[0] as FormField | null;
}
