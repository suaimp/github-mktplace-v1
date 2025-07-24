/**
 * Hook para gerenciar estado PIX
 * Seguindo o princípio de responsabilidade única
 */

import { useState } from 'react';
import { PixPaymentService } from '../services/PixPaymentService';
import { PixPaymentRequest } from '../types';

export function usePixPayment() {
  const [pixQrCodeUrl, setPixQrCodeUrl] = useState<string | null>(null);
  const [pixCopiaECola, setPixCopiaECola] = useState<string | null>(null);
  const [pixProcessing, setPixProcessing] = useState(false);
  const [pixError, setPixError] = useState<string | null>(null);

  const pixService = PixPaymentService.getInstance();

  const generatePixQrCode = async (
    request: PixPaymentRequest,
    onSuccess?: (qrCodeUrl: string, copiaECola: string) => void,
    onError?: (error: string) => void
  ) => {
    try {
      setPixProcessing(true);
      setPixError(null);

      console.log("🚨 HOOK PIX - Iniciando geração QR Code:", request);

      const response = await pixService.generateQrCode(request);

      if (response.success && response.qr_code_url && response.qr_code) {
        setPixQrCodeUrl(response.qr_code_url);
        setPixCopiaECola(response.qr_code);
        
        if (onSuccess) {
          onSuccess(response.qr_code_url, response.qr_code);
        }

        console.log("✅ HOOK PIX - QR Code gerado com sucesso");
      } else {
        // Mesmo em erro, tente exibir o QR Code se vier na resposta
        if (response.qr_code_url && response.qr_code) {
          setPixQrCodeUrl(response.qr_code_url);
          setPixCopiaECola(response.qr_code);
        }
        
        const errorMsg = response.error || response.message || "Failed to generate PIX QR code";
        setPixError(errorMsg);
        
        if (onError) {
          onError(errorMsg);
        }
      }
    } catch (error: any) {
      console.error("❌ HOOK PIX ERROR:", error);
      const errorMsg = error.message || "Erro ao gerar QR code PIX";
      setPixError(errorMsg);
      
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setPixProcessing(false);
    }
  };

  const clearPixData = () => {
    setPixQrCodeUrl(null);
    setPixCopiaECola(null);
    setPixError(null);
  };

  const resetPixState = () => {
    setPixProcessing(false);
    clearPixData();
  };

  return {
    // Estado
    pixQrCodeUrl,
    pixCopiaECola,
    pixProcessing,
    pixError,
    
    // Ações
    generatePixQrCode,
    clearPixData,
    resetPixState,
    
    // Service instance (para casos específicos)
    pixService
  };
}
