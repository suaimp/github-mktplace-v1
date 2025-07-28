export interface FormEntry {
  id: string;
  created_at: string;
  updated_at?: string;
  status: 'verificado' | 'reprovado' | 'em_analise';
  values: Record<string, any>;
  publisher?: {
    email: string;
    first_name?: string;
    last_name?: string;
    name?: string;
  };
  form_id: string;
}

export interface FormField {
  id: string;
  label: string;
  field_type: string;
  required?: boolean;
}

export interface SearchableField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'status' | 'email' | 'dynamic' | 'price';
  accessor: (entry: FormEntry) => string | null;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  exactMatch?: boolean;
  searchInDates?: boolean;
  searchInStatus?: boolean;
}
