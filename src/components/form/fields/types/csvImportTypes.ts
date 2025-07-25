export interface FormField {
  id: string;
  key?: string;  // Propriedade key opcional para compatibilidade com CSV
  field_key?: string;  // Propriedade field_key do banco  
  type?: string;
  field_type?: string;  // Propriedade field_type do banco
  label?: string;
}

export interface CsvImportData {
  url: string[];
  da: string[];
  preco: string[];
}

export interface FormEntryValue {
  entry_id: string;
  field_id: string;
  value: string | null;
  value_json: any | null;
}

export interface CsvImportResult {
  success: boolean;
  error?: string;
  entries?: string[];
}
