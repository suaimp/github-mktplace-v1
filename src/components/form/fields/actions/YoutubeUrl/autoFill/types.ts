// Tipos para auto preenchimento de campos do formulário com dados do YouTube

export interface AutoFillContext {
  channelInfo: any;
  formFields: any[];
  formValues: Record<string, any>;
  updateFormValue: (fieldId: string, value: any) => void;
}

export interface AutoFillRule {
  fieldType: string;
  apply: (context: AutoFillContext) => void;
}
