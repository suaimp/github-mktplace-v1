export interface FormField {
  id: string;
  key?: string;
  field_key?: string;
  type?: string;
  field_type?: string;
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

export interface FormEntry {
  id: string;
  form_id: string;
  created_by?: string;
  status: string;
  ip_address?: string;
  user_agent?: string;
}

export interface CsvImportResult {
  success: boolean;
  error?: string;
  entries?: string[];
}

export interface CsvImportRequest {
  csvData: CsvImportData;
  formFields: FormField[];
  formId: string;
  userId?: string;
}
