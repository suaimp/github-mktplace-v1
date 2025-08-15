/**
 * Tipos específicos para a funcionalidade de Header e Footer Scripts
 * Segue o princípio de responsabilidade única para tipagem
 */

/**
 * Props para o componente HeaderFooterSettings
 */
export interface HeaderFooterSettingsProps {
  onSave?: () => void;
  onError?: (error: string) => void;
}

/**
 * Estado do formulário de Header e Footer
 */
export interface HeaderFooterFormState {
  header_scripts: string;
  footer_scripts: string;
  loading: boolean;
  success: boolean;
  error: string | null;
}

/**
 * Erros de validação específicos para cada campo
 */
export interface HeaderFooterValidationErrors {
  header_scripts?: string;
  footer_scripts?: string;
}

/**
 * Dados para atualização de scripts
 */
export interface HeaderFooterUpdateData {
  header_scripts: string;
  footer_scripts: string;
}

/**
 * Configurações de injeção de scripts
 */
export interface ScriptInjectionConfig {
  enableHeaderScripts: boolean;
  enableFooterScripts: boolean;
  sanitizeScripts: boolean;
}

/**
 * Resultado da operação de salvamento
 */
export interface HeaderFooterSaveResult {
  success: boolean;
  message: string;
  data?: HeaderFooterUpdateData;
}
