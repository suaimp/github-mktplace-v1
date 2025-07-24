/**
 * Serviço para PIX Payment
 * Seguindo o princípio de responsabilidade única
 */

import { supabase } from '../../../../lib/supabase';
import { PixPaymentRequest, PixPaymentResponse, PixOrderItem } from '../types';
import { validatePixDocument, generatePixDebugInfo } from '../utils/validation';

export class PixPaymentService {
  private static instance: PixPaymentService;

  public static getInstance(): PixPaymentService {
    if (!PixPaymentService.instance) {
      PixPaymentService.instance = new PixPaymentService();
    }
    return PixPaymentService.instance;
  }

  /**
   * Gera QR Code PIX
   */
  async generateQrCode(request: PixPaymentRequest): Promise<PixPaymentResponse> {
    try {
      // Validar documento antes de enviar
      const documentValidation = validatePixDocument(
        request.customer_document, 
        request.customer_legal_status
      );

      if (!documentValidation.isValid) {
        throw new Error(documentValidation.error || 'Documento inválido');
      }

      // Debug info
      const debugInfo = generatePixDebugInfo(
        request.customer_legal_status,
        request.customer_document
      );
      
      console.log("🐛 PIX SERVICE - Debug Info:", debugInfo);

      // Obter sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("No authenticated session found");
      }

      // Fazer requisição para edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-pix-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(request),
        }
      );

      let responseData: PixPaymentResponse;
      try {
        responseData = await response.json();
      } catch (jsonErr) {
        throw new Error('Resposta inválida do servidor PIX');
      }

      console.log("🐛 PIX SERVICE - Resposta:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Erro ao gerar PIX');
      }

      return responseData;
    } catch (error) {
      console.error("❌ PIX SERVICE ERROR:", error);
      throw error;
    }
  }

  /**
   * Prepara os itens do pedido para PIX
   */
  prepareOrderItems(
    items: any[], 
    totalOriginal: number, 
    totalWithDiscount: number
  ): PixOrderItem[] {
    const discountRatio = totalWithDiscount / totalOriginal;
    
    return items.map((item: any) => {
      const originalPrice = Number(item.price);
      const discountedPrice = originalPrice * discountRatio;
      
      return {
        amount: Math.round(discountedPrice * 100),
        description: item.product_url || "Produto Marketplace",
        quantity: item.quantity || 1,
        code: item.entry_id || `ITEM_${Date.now()}`
      };
    });
  }

  /**
   * Valida os dados necessários para PIX
   */
  validatePixData(formData: any, orderSummary: any): void {
    if (!formData.legal_status) {
      throw new Error("Status legal do cliente não definido");
    }

    if (!formData.name?.trim()) {
      throw new Error("Nome do cliente é obrigatório");
    }

    if (!formData.email?.trim()) {
      throw new Error("Email do cliente é obrigatório");
    }

    if (!formData.documentNumber?.trim()) {
      throw new Error("Documento do cliente é obrigatório");
    }

    if (!orderSummary.totalFinalPrice || orderSummary.totalFinalPrice <= 0) {
      throw new Error("Valor do pedido inválido");
    }
  }
}
