export interface EntryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  onSave: () => void;
  isAdmin: boolean;
}

export interface FormEntryValue {
  entry_id: string;
  field_id: string;
  value: string | null;
  value_json: any;
}

export interface UpsertFormEntryValue extends FormEntryValue {
  id?: string; // Optional for upsert operations
}

export interface FormField {
  id: string;
  form_id: string;
  field_type: string;
  label: string;
  is_required: boolean;
  position: number;
  form_field_settings?: any;
}

export interface ValidationError {
  [fieldId: string]: string;
}

export interface FormFieldSettings {
  [fieldId: string]: any;
}
