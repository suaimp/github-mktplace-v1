export interface Option {
  value: string;
  label: string;
}

export interface FormField {
  id: string;
  field_type: string;
  label: string;
  description?: string;
  placeholder?: string;
  default_value?: string;
  options?: Option[];
  validation_rules?: Record<string, any>;
  is_required: boolean;
  position: number;
  width: "full" | "half" | "third" | "quarter";
  css_class?: string;
}

export interface FormFieldSettings {
  id?: string;
  field_id: string;
  label_text: string;
  label_visibility: "visible" | "hidden";
  placeholder_text?: string;
  help_text?: string;
  is_required: boolean;
  no_duplicates: boolean;
  visibility: "visible" | "hidden" | "admin" | "marketplace";
  validation_type?: string;
  validation_regex?: string;
  field_identifier?: string;
  input_mask_enabled?: boolean;
  input_mask_pattern?: string;
  columns?: 1 | 2 | 3;
  max_selections?: number;
  inline_layout?: boolean;
  allowed_extensions?: string;
  multiple_files?: boolean;
  max_files?: number;
  max_file_size?: number;
  commission_rate?: number;
  product_currency?: string;
  product_description?: string;
  disable_quantity?: boolean;
  date_format?: string;
  time_format?: string;
  countries?: string[];
  show_percentage?: boolean;
  marketplace_label?: string;
  custom_button_text?: boolean;
  button_text?: string;
  position_last_column?: boolean;
  button_style?: string;
}

export interface BaseFieldProps {
  field: FormField;
  settings?: FormFieldSettings;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  onErrorClear?: () => void;
}