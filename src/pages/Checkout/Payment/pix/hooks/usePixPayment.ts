/**
 * Hook personalizado para gerenciar estado PIX (versão modular)
 * Responsabilidade: Gerenciar estado e ações do PIX
 */

import { useState, useCallback } from 'react';
import { PixQrCodeState, PixCustomerData, PixOrderSummary } from '../interfaces/PixTypes';
import { PixPaymentServiceModular } from '../services/PixPaymentServiceModular';

export function usePixPaymentModular() {
  const [pixState, setPixState] = useState<PixQrCodeState>({
    qrCodeUrl: null,
    copiaECola: null,
    isGenerating: false,
    error: null
  });

  const pixService = PixPaymentServiceModular.getInstance();

  /**
   * Gera o QR Code PIX usando dados atualizados
   */
  const generatePixQrCode = useCallback(async (
    customerData: PixCustomerData,
    orderSummary: PixOrderSummary,
    orderId: string
  ) => {
    try {
      setPixState(prev => ({ 
        ...prev, 
        isGenerating: true, 
        error: null 
      }));

      console.log('🔄 [PIX HOOK] Iniciando geração do QR Code...');

      // Usar o serviço modular com dados corretos
      const result = await pixService.generateQrCode(
        customerData,
        orderSummary, // dados atualizados do order_totals
        orderId
      );

      if (result.success && result.qr_code && result.qr_code_url) {
        setPixState({
          qrCodeUrl: result.qr_code_url,
          copiaECola: result.qr_code,
          isGenerating: false,
          error: null
        });

        console.log('✅ [PIX HOOK] QR Code gerado com sucesso');
        return result;
      } else {
        throw new Error(result.error || 'Falha ao gerar QR Code PIX');
      }

    } catch (error: any) {
      console.error('❌ [PIX HOOK] Erro:', error);
      const errorMessage = error.message || 'Erro ao gerar QR code PIX';
      
      setPixState(prev => ({
        ...prev,
        isGenerating: false,
        error: errorMessage
      }));

      throw error;
    }
  }, [pixService]);

  /**
   * Copia o código PIX para a área de transferência
   */
  const copyPixCode = useCallback(async (): Promise<boolean> => {
    if (!pixState.copiaECola) return false;

    try {
      await navigator.clipboard.writeText(pixState.copiaECola);
      console.log('📋 [PIX HOOK] Código PIX copiado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [PIX HOOK] Erro ao copiar código PIX:', error);
      return false;
    }
  }, [pixState.copiaECola]);

  /**
   * Limpa os dados do PIX
   */
  const clearPixData = useCallback(() => {
    setPixState({
      qrCodeUrl: null,
      copiaECola: null,
      isGenerating: false,
      error: null
    });
  }, []);

  /**
   * Reset completo do estado PIX
   */
  const resetPixState = useCallback(() => {
    clearPixData();
  }, [clearPixData]);

  return {
    // Estado
    pixQrCodeUrl: pixState.qrCodeUrl,
    pixCopiaECola: pixState.copiaECola,
    pixProcessing: pixState.isGenerating,
    pixError: pixState.error,
    
    // Ações
    generatePixQrCode,
    copyPixCode,
    clearPixData,
    resetPixState,
    
    // Service instance (para casos específicos)
    pixService
  };
}
