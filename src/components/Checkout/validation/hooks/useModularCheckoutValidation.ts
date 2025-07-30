/**
 * Hook de validação modular para checkout
 * Responsabilidade única: Coordenar validação usando a arquitetura modular
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../../lib/supabase";
import { ValidationService } from "../services/ValidationService";
import { ValidationConfig, CartCheckoutItem, ValidationHookResult, ValidationResult } from "../types/ValidationTypes";

export function useModularCheckoutValidation(config: ValidationConfig = {}): ValidationHookResult {
  const [areAllFieldsSelected, setAreAllFieldsSelected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [validationDetails, setValidationDetails] = useState<ValidationResult | null>(null);

  const {
    enableLogging = false,
    refreshOnEvents = ['resume-table-reload', 'niche-selection-changed', 'service-selection-changed'],
    requireNiche = true,
    requireService = true,
    logDetails = false
  } = config;

  /**
   * Executa a validação dos itens do carrinho
   */
  const performValidation = useCallback(async () => {
    if (enableLogging) {
      console.log('🔍 useModularCheckoutValidation: Iniciando validação');
    }

    try {
      setLoading(true);

      // Buscar dados atuais do carrinho
      const { data: cartItems, error } = await supabase
        .from('cart_checkout_resume')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar itens do carrinho:', error);
        setAreAllFieldsSelected(false);
        setValidationDetails({ 
          isValid: false, 
          errors: [error.message],
          details: { error: error.message }
        });
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        if (enableLogging) {
          console.log('📭 useModularCheckoutValidation: Nenhum item no carrinho');
        }
        setAreAllFieldsSelected(false);
        setValidationDetails({ 
          isValid: false, 
          errors: ['Carrinho vazio'],
          details: { totalItems: 0, message: 'Carrinho vazio' }
        });
        return;
      }

      // Usar ValidationService para validar
      const validationResult = ValidationService.validateCheckout(
        cartItems as CartCheckoutItem[],
        {
          requireNiche,
          requireService,
          logDetails: logDetails || enableLogging
        }
      );

      // Atualizar estados
      setAreAllFieldsSelected(validationResult.isValid);
      setValidationDetails(validationResult);

      if (enableLogging) {
        console.log('✅ useModularCheckoutValidation: Validação concluída', {
          isValid: validationResult.isValid,
          totalItems: cartItems.length,
          errors: validationResult.errors
        });
      }

    } catch (error) {
      console.error('❌ useModularCheckoutValidation: Erro na validação:', error);
      setAreAllFieldsSelected(false);
      setValidationDetails({ 
        isValid: false, 
        errors: [String(error)],
        details: { error: String(error) }
      });
    } finally {
      setLoading(false);
    }
  }, [requireNiche, requireService, logDetails, enableLogging]);

  /**
   * Função de revalidação manual
   */
  const revalidate = useCallback(async () => {
    if (enableLogging) {
      console.log('🔄 useModularCheckoutValidation: Revalidação manual solicitada');
    }
    await performValidation();
  }, [performValidation, enableLogging]);

  /**
   * Configurar listeners de eventos
   */
  useEffect(() => {
    if (enableLogging) {
      console.log('🎧 useModularCheckoutValidation: Configurando listeners', refreshOnEvents);
    }

    // Executar validação inicial
    performValidation();

    // Configurar listeners para os eventos especificados
    const handleValidationEvent = (event: Event) => {
      if (enableLogging) {
        console.log(`📡 useModularCheckoutValidation: Evento recebido - ${event.type}`);
      }
      performValidation();
    };

    // Adicionar listeners
    refreshOnEvents.forEach(eventName => {
      window.addEventListener(eventName, handleValidationEvent);
    });

    // Cleanup
    return () => {
      if (enableLogging) {
        console.log('🧹 useModularCheckoutValidation: Removendo listeners');
      }
      refreshOnEvents.forEach(eventName => {
        window.removeEventListener(eventName, handleValidationEvent);
      });
    };
  }, [performValidation, refreshOnEvents, enableLogging]);

  return {
    areAllFieldsSelected,
    loading,
    revalidate,
    validationDetails: validationDetails || undefined
  };
}

/**
 * Hook simplificado para validação rápida (apenas resultado boolean)
 */
export function useQuickCheckoutValidation(): boolean {
  const { areAllFieldsSelected } = useModularCheckoutValidation({
    enableLogging: false,
    logDetails: false
  });

  return areAllFieldsSelected;
}

/**
 * Hook com logging detalhado para debug
 */
export function useDebugCheckoutValidation() {
  return useModularCheckoutValidation({
    enableLogging: true,
    logDetails: true,
    strictMode: true
  });
}
