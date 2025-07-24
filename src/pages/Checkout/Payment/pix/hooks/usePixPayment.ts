/**
 * Hook personalizado para gerenciar o estado do PIX
 */

import { useState, useCallback } from 'react';
import { PixQrCodeState, PixCustomerData } from '../types/PixTypes';
import { PixPaymentService } from '../services/PixPaymentService';

export function usePixPayment() {
  const [pixState, setPixState] = useState<PixQrCodeState>({
    qrCodeUrl: null,
    copiaECola: null,
    isGenerating: false,
    timer: 0
  });

  const [error, setError] = useState<string | null>(null);

  /**
   * Gera o QR Code PIX
   */
  const generatePixQrCode = useCallback(async (
    customerData: PixCustomerData,
    totalAmount: number,
    orderId: string,
    orderItems: any[],
    orderSummary: any
  ) => {
    try {
      setPixState(prev => ({ ...prev, isGenerating: true }));
      setError(null);

      console.log('🔄 Iniciando geração do QR Code PIX...');

      // Calcular items com desconto
      const totalOriginal = orderSummary.totalProductPrice + orderSummary.totalContentPrice;
      const discountedItems = PixPaymentService.calculateDiscountedItems(
        orderItems,
        totalOriginal,
        totalAmount
      );

      // Gerar QR Code
      const result = await PixPaymentService.generateQrCode(
        customerData,
        totalAmount,
        orderId,
        discountedItems
      );

      if (result.success && result.qr_code && result.qr_code_url) {
        setPixState(prev => ({
          ...prev,
          qrCodeUrl: result.qr_code_url!,
          copiaECola: result.qr_code!,
          isGenerating: false
        }));

        console.log('✅ QR Code PIX gerado com sucesso');
        return result;
      } else {
        throw new Error(result.error || 'Falha ao gerar QR Code PIX');
      }
    } catch (error: any) {
      console.error('❌ Erro na geração do QR Code PIX:', error);
      setError(error.message);
      setPixState(prev => ({ ...prev, isGenerating: false }));
      throw error;
    }
  }, []);

  /**
   * Copia o código PIX para a área de transferência
   */
  const copyPixCode = useCallback(async (): Promise<boolean> => {
    if (!pixState.copiaECola) return false;

    try {
      await navigator.clipboard.writeText(pixState.copiaECola);
      console.log('📋 Código PIX copiado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao copiar código PIX:', error);
      return false;
    }
  }, [pixState.copiaECola]);

  /**
   * Limpa o estado do PIX
   */
  const clearPixState = useCallback(() => {
    setPixState({
      qrCodeUrl: null,
      copiaECola: null,
      isGenerating: false,
      timer: 0
    });
    setError(null);
  }, []);

  /**
   * Inicia o timer de geração do QR Code
   */
  const startTimer = useCallback((seconds: number = 45) => {
    setPixState(prev => ({ ...prev, timer: seconds }));
    
    const interval = setInterval(() => {
      setPixState(prev => {
        if (prev.timer <= 1) {
          clearInterval(interval);
          return { ...prev, timer: 0 };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    pixState,
    error,
    generatePixQrCode,
    copyPixCode,
    clearPixState,
    startTimer
  };
}
