/**
 * Índice da arquitetura de validação modular
 * Responsabilidade única: Exportações centralizadas para facilitar importações
 */

// Types
export type {
  CartCheckoutItem,
  ValidationConfig,
  ValidationResult,
  ValidationHookResult,
  CheckoutValidationResult,
  ItemValidationResult,
  NicheValidationResult,
  ServiceValidationResult
} from "./types/ValidationTypes";

// Extractors
export { NicheValueExtractor } from "./extractors/NicheValueExtractor";
export { ServiceValueExtractor } from "./extractors/ServiceValueExtractor";

// Validators  
export { NicheValidator } from "./validators/NicheValidator";
export { ServiceValidator } from "./validators/ServiceValidator";

// Services
export { ValidationService } from "./services/ValidationService";

// Hooks
export { 
  useModularCheckoutValidation,
  useQuickCheckoutValidation,
  useDebugCheckoutValidation
} from "./hooks/useModularCheckoutValidation";

// Utilitários para migração
export class ValidationMigrationUtils {
  /**
   * Migra do hook antigo para o novo sistema modular
   * Facilita a transição gradual
   */
  static migrateFromLegacyValidation(legacyResult: any) {
    return {
      areAllFieldsSelected: legacyResult?.areAllFieldsSelected || false,
      loading: legacyResult?.loading || false,
      revalidate: async () => {
        console.log('🔄 Migration: Usando ValidationService para revalidação');
        // Implementar lógica de migração se necessário
      }
    };
  }

  /**
   * Compara resultados do sistema antigo vs novo para garantir consistência
   */
  static compareValidationResults(legacy: any, modular: any) {
    const comparison = {
      areAllFieldsSelected: {
        legacy: legacy?.areAllFieldsSelected,
        modular: modular?.areAllFieldsSelected,
        match: legacy?.areAllFieldsSelected === modular?.areAllFieldsSelected
      },
      loading: {
        legacy: legacy?.loading,
        modular: modular?.loading,
        match: legacy?.loading === modular?.loading
      }
    };

    console.log('🔍 Comparação de validação (Legacy vs Modular):', comparison);
    return comparison;
  }
}
