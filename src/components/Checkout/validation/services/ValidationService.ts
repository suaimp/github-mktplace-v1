/**
 * Serviço de validação central
 * Responsabilidade única: Coordenar operações de validação usando extractors e validators
 */

import { ValidationResult, ValidationConfig, CartCheckoutItem } from "../types/ValidationTypes";
import { NicheValueExtractor } from "../extractors/NicheValueExtractor";
import { ServiceValueExtractor } from "../extractors/ServiceValueExtractor";
import { NicheValidator } from "../validators/NicheValidator";
import { ServiceValidator } from "../validators/ServiceValidator";

export class ValidationService {
  /**
   * Valida os dados de checkout completos
   * @param cartItems - Itens do carrinho para validação
   * @param config - Configuração de validação
   * @returns ValidationResult - Resultado da validação
   */
  static validateCheckout(
    cartItems: CartCheckoutItem[], 
    config: ValidationConfig = {}
  ): ValidationResult {
    const {
      requireNiche = true,
      requireService = true,
      logDetails = false
    } = config;

    let isValid = true;
    const errors: string[] = [];
    const details: any = {};

    if (logDetails) {
      console.log('🔍 ValidationService: Iniciando validação de checkout');
      console.log('📦 Itens para validação:', cartItems);
      console.log('⚙️ Configuração:', config);
    }

    // Validar cada item do carrinho
    for (let i = 0; i < cartItems.length; i++) {
      const item = cartItems[i];
      const itemResult = this.validateCartItem(item, { requireNiche, requireService, logDetails });
      
      if (!itemResult.isValid) {
        isValid = false;
        errors.push(`Item ${i + 1}: ${itemResult.errors.join(', ')}`);
      }

      details[`item_${i}`] = itemResult.details;
    }

    const result = {
      isValid,
      errors,
      details: {
        totalItems: cartItems.length,
        config,
        itemDetails: details
      }
    };

    if (logDetails) {
      console.log('✅ ValidationService: Resultado final da validação:', result);
    }

    return result;
  }

  /**
   * Valida um item individual do carrinho
   * @param item - Item a ser validado
   * @param config - Configuração de validação
   * @returns ValidationResult - Resultado da validação do item
   */
  static validateCartItem(
    item: CartCheckoutItem, 
    config: ValidationConfig = {}
  ): ValidationResult {
    const {
      requireNiche = true,
      requireService = true,
      logDetails = false
    } = config;

    let isValid = true;
    const errors: string[] = [];
    const details: any = {
      item,
      nicheValidation: null,
      serviceValidation: null
    };

    if (logDetails) {
      console.log('🔍 ValidationService: Validando item individual:', item);
    }

    // Validar nicho se requerido
    if (requireNiche) {
      const nicheResult = this.validateNiche(item, { logDetails });
      details.nicheValidation = nicheResult;
      
      if (!nicheResult.isValid) {
        isValid = false;
        errors.push(...nicheResult.errors);
      }
    }

    // Validar serviço se requerido
    if (requireService) {
      const serviceResult = this.validateService(item, { logDetails });
      details.serviceValidation = serviceResult;
      
      if (!serviceResult.isValid) {
        isValid = false;
        errors.push(...serviceResult.errors);
      }
    }

    const result = { isValid, errors, details };

    if (logDetails) {
      console.log('✅ ValidationService: Resultado da validação do item:', result);
    }

    return result;
  }

  /**
   * Valida especificamente o nicho de um item
   * @param item - Item a ser validado
   * @param config - Configuração de validação
   * @returns ValidationResult - Resultado da validação do nicho
   */
  static validateNiche(
    item: CartCheckoutItem, 
    config: ValidationConfig = {}
  ): ValidationResult {
    const { logDetails = false } = config;
    
    try {
      // Extrair valor do nicho
      const nicheValue = NicheValueExtractor.extract(item);
      
      // Validar o valor extraído
      const isValid = NicheValidator.isValid(nicheValue);
      
      const details = {
        originalItem: item,
        extractedValue: nicheValue,
        isPlaceholder: NicheValidator.isPlaceholder(nicheValue),
        isNoSelection: NicheValidator.isNoSelection(nicheValue)
      };

      if (logDetails) {
        console.log('🎯 ValidationService: Validação de nicho:', details);
      }

      return {
        isValid,
        errors: isValid ? [] : ['Nicho não selecionado ou inválido'],
        details
      };
    } catch (error) {
      const errorMessage = `Erro na validação de nicho: ${error}`;
      
      if (logDetails) {
        console.error('❌ ValidationService:', errorMessage);
      }

      return {
        isValid: false,
        errors: [errorMessage],
        details: { error: error }
      };
    }
  }

  /**
   * Valida especificamente o serviço de um item
   * @param item - Item a ser validado
   * @param config - Configuração de validação
   * @returns ValidationResult - Resultado da validação do serviço
   */
  static validateService(
    item: CartCheckoutItem, 
    config: ValidationConfig = {}
  ): ValidationResult {
    const { logDetails = false } = config;
    
    try {
      // Extrair valor do serviço
      const serviceValue = ServiceValueExtractor.extract(item);
      
      // Validar o valor extraído
      const isValid = ServiceValidator.isValid(serviceValue);
      
      const details = {
        originalItem: item,
        extractedValue: serviceValue,
        isPlaceholder: ServiceValidator.isPlaceholder(serviceValue),
        isNoSelection: ServiceValidator.isNoSelection(serviceValue),
        isValidNoneOption: ServiceValidator.isValidNoneOption(serviceValue)
      };

      if (logDetails) {
        console.log('🛡️ ValidationService: Validação de serviço:', details);
      }

      return {
        isValid,
        errors: isValid ? [] : ['Serviço não selecionado ou inválido'],
        details
      };
    } catch (error) {
      const errorMessage = `Erro na validação de serviço: ${error}`;
      
      if (logDetails) {
        console.error('❌ ValidationService:', errorMessage);
      }

      return {
        isValid: false,
        errors: [errorMessage],
        details: { error: error }
      };
    }
  }

  /**
   * Validação rápida apenas verificando se há seleções válidas
   * @param cartItems - Itens do carrinho
   * @returns boolean - true se todos os itens têm seleções válidas
   */
  static areAllFieldsSelected(cartItems: CartCheckoutItem[]): boolean {
    if (!cartItems || cartItems.length === 0) {
      return false;
    }

    return cartItems.every(item => {
      const nicheValue = NicheValueExtractor.extract(item);
      const serviceValue = ServiceValueExtractor.extract(item);
      
      const nicheValid = NicheValidator.isValid(nicheValue);
      const serviceValid = ServiceValidator.isValid(serviceValue);
      
      return nicheValid && serviceValid;
    });
  }
}
