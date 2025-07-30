/**
 * Tipos e interfaces para o sistema de validação do checkout
 * Responsabilidade única: Definições de tipos centralizadas
 */

export interface CartCheckoutItem {
  id: string;
  user_id: string;
  niche_selected?: any;
  service_selected?: any;
  product_url?: string;
  quantity?: number;
  created_at?: string;
}

export interface NicheValidationResult {
  isValid: boolean;
  extractedValue: string | null;
  rawValue: any;
  itemId: string;
}

export interface ServiceValidationResult {
  isValid: boolean;
  extractedValue: string | null;
  rawValue: any;
  itemId: string;
}

export interface ItemValidationResult {
  itemId: string;
  niche: NicheValidationResult;
  service: ServiceValidationResult;
  isValid: boolean;
}

export interface CheckoutValidationResult {
  areAllFieldsSelected: boolean;
  items: ItemValidationResult[];
  summary: {
    totalItems: number;
    validItems: number;
    invalidItems: number;
  };
}

export interface ValidationHookResult {
  areAllFieldsSelected: boolean;
  loading: boolean;
  revalidate: () => Promise<void>;
  validationDetails?: ValidationResult;
}

export interface ValidationConfig {
  enableLogging?: boolean;
  refreshOnEvents?: string[];
  strictMode?: boolean;
  requireNiche?: boolean;
  requireService?: boolean;
  logDetails?: boolean;
}

// Interface genérica para resultados de validação
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  details?: any;
}
