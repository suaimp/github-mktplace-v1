/**
 * Serviço para pagamentos PIX
 */

import { supabase } from '../../../../../lib/supabase';
import { PixPaymentRequest, PixPaymentResponse, PixCustomerData, PixOrderItem } from '../types/PixTypes';
import { validateDocument, createDocumentValidationError, logDocumentValidation } from '../utils/documentValidation';

export class PixPaymentService {
  /**
   * Gera o QR Code PIX
   */
  static async generateQrCode(
    customerData: PixCustomerData,
    totalAmount: number,
    orderId: string,
    orderItems: PixOrderItem[]
  ): Promise<PixPaymentResponse> {
    try {
      // Validar documento antes de enviar
      const validation = validateDocument(
        customerData.document,
        customerData.legal_status,
        customerData.company_name,
        customerData.name
      );

      logDocumentValidation(customerData.document, customerData.legal_status, validation);

      if (!validation.isValid) {
        const errorMessage = createDocumentValidationError(
          customerData.document,
          validation,
          customerData.legal_status
        );
        
        return {
          success: false,
          error: errorMessage,
          legal_status: customerData.legal_status,
          expected_document_type: validation.documentType
        };
      }

      // Obter sessão
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão não encontrada');
      }

      // Preparar payload
      const payload: PixPaymentRequest = {
        amount: Math.round(totalAmount * 100),
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_document: customerData.document.replace(/\D/g, ''),
        customer_phone: customerData.phone.replace(/\D/g, ''),
        customer_legal_status: customerData.legal_status,
        customer_company_name: customerData.company_name,
        order_id: orderId,
        order_items: orderItems
      };

      console.log('🐛 PIX DEBUG - Payload sendo enviado:', {
        ...payload,
        customer_document: payload.customer_document,
        expected_document_type: validation.documentType,
        expected_customer_type: validation.customerType,
        validation_passed: true
      });

      // Fazer requisição
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-pix-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const responseData = await response.json();

      if (responseData.success && responseData.qr_code_url && responseData.qr_code) {
        return {
          success: true,
          qr_code: responseData.qr_code,
          qr_code_url: responseData.qr_code_url,
          expires_at: responseData.expires_at,
          order_id: responseData.order_id
        };
      } else {
        return {
          success: false,
          error: responseData.error || responseData.message || 'Falha ao gerar QR Code PIX',
          debug: responseData.debug,
          legal_status: customerData.legal_status,
          expected_document_type: validation.documentType
        };
      }
    } catch (error: any) {
      console.error('Erro no serviço PIX:', error);
      return {
        success: false,
        error: error.message || 'Erro interno no serviço PIX'
      };
    }
  }

  /**
   * Calcula os items com desconto proporcional
   */
  static calculateDiscountedItems(
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
        description: item.product_url || 'Produto Marketplace',
        quantity: item.quantity || 1,
        code: item.entry_id || `ITEM_${Date.now()}`
      };
    });
  }
}
