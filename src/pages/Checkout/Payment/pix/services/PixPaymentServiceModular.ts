/**
 * Serviço principal para pagamentos PIX (versão modular corrigida)
 * Responsabilidade: Gerenciar comunicação com PagarMe e lógica de negócio PIX
 */

import { supabase } from '../../../../../lib/supabase';
import { 
  PixPaymentRequest, 
  PixPaymentResponse, 
  PixCustomerData, 
  PixOrderItem,
  PixOrderSummary 
} from '../interfaces/PixTypes';
import { 
  validatePixCustomerData, 
  convertToCents, 
  generatePixDebugInfo,
  cleanDocument,
  cleanPhone
} from '../utils/PixValidation';
import { createPixPayment } from '../../../../../services/db-services/marketplace-services/payment/PaymentService';

export class PixPaymentServiceModular {
  private static instance: PixPaymentServiceModular;

  public static getInstance(): PixPaymentServiceModular {
    if (!PixPaymentServiceModular.instance) {
      PixPaymentServiceModular.instance = new PixPaymentServiceModular();
    }
    return PixPaymentServiceModular.instance;
  }

  /**
   * Gera QR Code PIX integrando validação e comunicação com PagarMe
   */
  async generateQrCode(
    customerData: PixCustomerData,
    orderSummary: PixOrderSummary,
    orderId: string
  ): Promise<PixPaymentResponse> {
    try {
      console.log("🚀 [PIX MODULAR] Iniciando geração do QR Code:", {
        orderId,
        totalFinalPrice: orderSummary.totalFinalPrice,
        itemsCount: orderSummary.items.length
      });

      // LOG DETALHADO: Dados de entrada completos
      console.log("📊 [PIX PAYLOAD] === DADOS DE ENTRADA ===", {
        timestamp: new Date().toISOString(),
        customerData: {
          name: customerData.name,
          email: customerData.email,
          document: customerData.document,
          legal_status: customerData.legal_status,
          phone: customerData.phone,
          company_name: customerData.company_name
        },
        orderSummary: {
          totalProductPrice: orderSummary.totalProductPrice,
          totalContentPrice: orderSummary.totalContentPrice,
          totalFinalPrice: orderSummary.totalFinalPrice,
          appliedCouponId: orderSummary.appliedCouponId,
          discountValue: orderSummary.discountValue,
          itemsCount: orderSummary.items?.length || 0,
          items_preview: orderSummary.items?.map((item: any) => ({
            entry_id: item.entry_id,
            product_url: item.product_url,
            price: item.price,
            quantity: item.quantity || 1
          }))
        },
        orderId
      });

      // 1. Validar dados do cliente
      const validation = validatePixCustomerData(customerData);
      if (!validation.isValid) {
        throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
      }

      // 2. Calcular valores corretos
      const totalAmount = orderSummary.totalFinalPrice; // já em reais
      
      // LOG DETALHADO: Cálculo do valor total
      console.log("💰 [PIX PAYLOAD] === CÁLCULO DO VALOR TOTAL ===", {
        timestamp: new Date().toISOString(),
        valores_originais: {
          totalProductPrice_reais: orderSummary.totalProductPrice,
          totalContentPrice_reais: orderSummary.totalContentPrice,
          totalFinalPrice_reais: orderSummary.totalFinalPrice,
          discountValue_reais: orderSummary.discountValue || 0
        },
        verificacao_calculo: {
          produto_mais_conteudo: orderSummary.totalProductPrice + orderSummary.totalContentPrice,
          total_final_usado: totalAmount,
          diferenca: (orderSummary.totalProductPrice + orderSummary.totalContentPrice) - totalAmount,
          possui_desconto: (orderSummary.totalProductPrice + orderSummary.totalContentPrice) !== totalAmount,
          desconto_aplicado: orderSummary.appliedCouponId ? 'SIM' : 'NÃO'
        },
        conversao_centavos: {
          total_amount_reais: totalAmount,
          total_amount_cents: convertToCents(totalAmount),
          metodo_conversao: "convertToCents(totalAmount) = Math.round(totalAmount * 100)"
        }
      });
      
      const orderItems = this.prepareOrderItems(orderSummary);

      // 3. Gerar debug info
      const debugInfo = generatePixDebugInfo(customerData.legal_status, customerData.document);
      console.log("🐛 [PIX MODULAR] Debug Info:", debugInfo);

      // LOG DETALHADO: Items processados
      console.log("📦 [PIX PAYLOAD] === ITEMS DO PEDIDO ===", {
        timestamp: new Date().toISOString(),
        items_originais: orderSummary.items.map((item: any, index: number) => ({
          index,
          entry_id: item.entry_id,
          product_url: item.product_url,
          price_original_reais: item.price,
          quantity: item.quantity || 1
        })),
        items_processados: orderItems.map((item, index) => ({
          index,
          description: item.description,
          amount_cents: item.amount,
          amount_reais: item.amount / 100,
          quantity: item.quantity,
          code: item.code
        })),
        totalizacao: {
          soma_items_cents: orderItems.reduce((sum, item) => sum + item.amount, 0),
          soma_items_reais: orderItems.reduce((sum, item) => sum + item.amount, 0) / 100,
          total_final_esperado_cents: convertToCents(totalAmount),
          total_final_esperado_reais: totalAmount,
          valores_conferem: orderItems.reduce((sum, item) => sum + item.amount, 0) === convertToCents(totalAmount)
        }
      });

      // 4. Preparar request para PagarMe
      const pixRequest: PixPaymentRequest = {
        amount: convertToCents(totalAmount), // converter para centavos
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_document: cleanDocument(customerData.document),
        customer_phone: cleanPhone(customerData.phone),
        customer_legal_status: customerData.legal_status,
        customer_company_name: customerData.company_name,
        order_id: orderId,
        order_items: orderItems
      };

      // LOG DETALHADO: Payload final para PagarMe
      console.log("🚀 [PIX PAYLOAD] === PAYLOAD FINAL PAGARME ===", {
        timestamp: new Date().toISOString(),
        url_destino: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-pix-payment`,
        payload_estrutura: {
          amount_cents: pixRequest.amount,
          amount_reais: pixRequest.amount / 100,
          customer_data: {
            name: pixRequest.customer_name,
            email: pixRequest.customer_email,
            document: pixRequest.customer_document,
            phone: pixRequest.customer_phone,
            legal_status: pixRequest.customer_legal_status,
            company_name: pixRequest.customer_company_name
          },
          order_info: {
            order_id: pixRequest.order_id,
            items_count: pixRequest.order_items.length,
            items_total_cents: pixRequest.order_items.reduce((sum, item) => sum + item.amount, 0),
            items_total_reais: pixRequest.order_items.reduce((sum, item) => sum + item.amount, 0) / 100
          }
        },
        verificacao_integridade: {
          amount_igual_items: pixRequest.amount === pixRequest.order_items.reduce((sum, item) => sum + item.amount, 0),
          todos_campos_preenchidos: {
            amount: !!pixRequest.amount,
            customer_name: !!pixRequest.customer_name,
            customer_email: !!pixRequest.customer_email,
            customer_document: !!pixRequest.customer_document,
            order_id: !!pixRequest.order_id,
            order_items_length: pixRequest.order_items.length > 0
          }
        },
        comparacao_com_problema_original: {
          campo_valor_incluido: !!pixRequest.amount,
          campo_conteudo_via_items: pixRequest.order_items.some(item => 
            item.code === 'CONTENT_TOTAL' || 
            item.description.toLowerCase().includes('conteudo') ||
            item.description.toLowerCase().includes('content') ||
            item.description.toLowerCase().includes('extra')
          ),
          items_sinteticos_corretos: pixRequest.order_items.every(item => 
            item.code === 'PRODUCT_TOTAL' || item.code === 'CONTENT_TOTAL'
          ),
          problema_resolvido: !!pixRequest.amount && 
                             pixRequest.order_items.some(item => item.code === 'CONTENT_TOTAL') &&
                             pixRequest.amount === pixRequest.order_items.reduce((sum, item) => sum + item.amount, 0)
        }
      });

      console.log("📤 [PIX PAYLOAD] Payload completo que será enviado:", JSON.stringify(pixRequest, null, 2));

      console.log("💰 [PIX MODULAR] Valores calculados:", {
        totalAmount_reais: totalAmount,
        totalAmount_cents: convertToCents(totalAmount),
        orderItemsTotal_cents: orderItems.reduce((sum, item) => sum + item.amount, 0),
        itemsCount: orderItems.length,
        totalProductPrice: orderSummary.totalProductPrice,
        totalContentPrice: orderSummary.totalContentPrice
      });

      // 5. Salvar no banco antes de enviar para PagarMe
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await createPixPayment({
          user_id: user.id,
          order_id: orderId,
          amount: convertToCents(totalAmount),
          status: 'pending'
        });
      }

      // 6. Enviar para PagarMe
      const response = await this.sendToPagarMe(pixRequest);

      console.log("📡 [PIX MODULAR] Resposta do PagarMe:", {
        success: response.success,
        hasQrCode: !!response.qr_code,
        hasQrCodeUrl: !!response.qr_code_url,
        error: response.error
      });

      return response;

    } catch (error: any) {
      console.error("❌ [PIX MODULAR] Erro:", error);
      return {
        success: false,
        error: error.message || "Erro ao gerar QR Code PIX"
      };
    }
  }

  /**
   * Prepara itens do pedido com desconto proporcional
   * CORREÇÃO: Gera items baseados nos totais corretos, não no carrinho
   */
  private prepareOrderItems(orderSummary: PixOrderSummary): PixOrderItem[] {
    const totalOriginal = orderSummary.totalProductPrice + orderSummary.totalContentPrice;
    const totalWithDiscount = orderSummary.totalFinalPrice;
    const discountRatio = totalOriginal > 0 ? totalWithDiscount / totalOriginal : 1;

    console.log("🧮 [PIX ITEMS] === CÁLCULO DE DESCONTO ===", {
      timestamp: new Date().toISOString(),
      valores_base: {
        totalProductPrice: orderSummary.totalProductPrice,
        totalContentPrice: orderSummary.totalContentPrice,
        totalOriginal: totalOriginal,
        totalWithDiscount: totalWithDiscount,
        discountValue: orderSummary.discountValue || 0
      },
      calculo_desconto: {
        discountRatio: discountRatio,
        percentual_desconto: (1 - discountRatio) * 100,
        valor_desconto_calculado: totalOriginal - totalWithDiscount,
        valor_desconto_informado: orderSummary.discountValue || 0,
        desconto_aplicado: discountRatio < 1
      },
      coupon_info: {
        appliedCouponId: orderSummary.appliedCouponId,
        hasCoupon: !!orderSummary.appliedCouponId
      },
      problema_identificado: {
        items_carrinho_count: orderSummary.items?.length || 0,
        soma_items_carrinho: orderSummary.items?.reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0) || 0,
        total_product_price: orderSummary.totalProductPrice,
        total_content_price: orderSummary.totalContentPrice,
        items_nao_representam_totais: true
      }
    });

    // SOLUÇÃO: Gerar items sintéticos baseados nos totais corretos
    const syntheticItems: PixOrderItem[] = [];

    // 1. Item para produto (se houver valor)
    if (orderSummary.totalProductPrice > 0) {
      const productPriceWithDiscount = orderSummary.totalProductPrice * discountRatio;
      const productItem = {
        amount: convertToCents(productPriceWithDiscount),
        description: "Produtos do Marketplace",
        quantity: 1,
        code: "PRODUCT_TOTAL"
      };
      
      syntheticItems.push(productItem);
      
      console.log("📦 [PIX ITEMS] Item PRODUTO sintético criado:", {
        valor_original_reais: orderSummary.totalProductPrice,
        valor_com_desconto_reais: productPriceWithDiscount,
        valor_final_cents: productItem.amount,
        tipo: "PRODUTO"
      });
    }

    // 2. Item para conteúdo (se houver valor) - AQUI ESTÁ O FIX!
    if (orderSummary.totalContentPrice > 0) {
      const contentPriceWithDiscount = orderSummary.totalContentPrice * discountRatio;
      const contentItem = {
        amount: convertToCents(contentPriceWithDiscount),
        description: "Conteúdo Extra do Marketplace",
        quantity: 1,
        code: "CONTENT_TOTAL"
      };
      
      syntheticItems.push(contentItem);
      
      console.log("📦 [PIX ITEMS] Item CONTEÚDO sintético criado:", {
        valor_original_reais: orderSummary.totalContentPrice,
        valor_com_desconto_reais: contentPriceWithDiscount,
        valor_final_cents: contentItem.amount,
        tipo: "CONTEUDO",
        problema_resolvido: true
      });
    }

    // Verificação final
    const totalItemsCents = syntheticItems.reduce((sum, item) => sum + item.amount, 0);
    const expectedTotalCents = convertToCents(totalWithDiscount);
    
    console.log("✅ [PIX ITEMS] === VERIFICAÇÃO FINAL ===", {
      timestamp: new Date().toISOString(),
      items_gerados: syntheticItems.length,
      items_detalhados: syntheticItems.map((item, index) => ({
        index: index + 1,
        description: item.description,
        amount_cents: item.amount,
        amount_reais: item.amount / 100,
        code: item.code
      })),
      totalizacao: {
        soma_items_cents: totalItemsCents,
        soma_items_reais: totalItemsCents / 100,
        total_esperado_cents: expectedTotalCents,
        total_esperado_reais: totalWithDiscount,
        valores_conferem: totalItemsCents === expectedTotalCents,
        diferenca_cents: Math.abs(totalItemsCents - expectedTotalCents)
      },
      solucao_aplicada: {
        problema_original: "Items do carrinho não incluíam valor do conteúdo",
        solucao: "Items sintéticos baseados em total_product_price + total_content_price",
        conteudo_incluido: orderSummary.totalContentPrice > 0,
        problema_resolvido: totalItemsCents === expectedTotalCents
      }
    });

    return syntheticItems;
  }

  /**
   * Envia requisição para PagarMe
   */
  private async sendToPagarMe(request: PixPaymentRequest): Promise<PixPaymentResponse> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Sessão não encontrada");
    }

    console.log("🚀 [PIX PAGARME] === ENVIANDO PARA PAGARME ===", {
      timestamp: new Date().toISOString(),
      url: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pagarme-pix-payment`,
      request_overview: {
        amount_cents: request.amount,
        amount_reais: request.amount / 100,
        order_id: request.order_id,
        customer_legal_status: request.customer_legal_status,
        customer_name: request.customer_name,
        customer_email: request.customer_email,
        items_count: request.order_items.length,
        items_total_cents: request.order_items.reduce((sum, item) => sum + item.amount, 0)
      },
      request_payload_detalhado: request
    });

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

    console.log("📡 [PIX PAGARME] === RESPOSTA HTTP RECEBIDA ===", {
      timestamp: new Date().toISOString(),
      http_status: response.status,
      http_statusText: response.statusText,
      response_ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    let responseData: PixPaymentResponse;
    try {
      responseData = await response.json();
      
      console.log("📋 [PIX PAGARME] === RESPOSTA JSON PARSEADA ===", {
        timestamp: new Date().toISOString(),
        response_structure: {
          success: responseData.success,
          has_qr_code: !!responseData.qr_code,
          has_qr_code_url: !!responseData.qr_code_url,
          has_error: !!responseData.error,
          has_raw_response: !!responseData.raw_response
        },
        response_content: responseData
      });

      // Log específico para analisar valores na resposta
      if (responseData.raw_response?.charges?.[0]) {
        const charge = responseData.raw_response.charges[0];
        console.log("💰 [PIX PAGARME] === ANÁLISE DE VALORES NA RESPOSTA ===", {
          timestamp: new Date().toISOString(),
          valores_enviados: {
            amount_cents: request.amount,
            amount_reais: request.amount / 100,
            items_total_cents: request.order_items.reduce((sum, item) => sum + item.amount, 0)
          },
          valores_recebidos: {
            charge_amount_cents: charge.amount,
            charge_amount_reais: charge.amount / 100,
            charge_id: charge.id,
            charge_status: charge.status,
            payment_method: charge.payment_method
          },
          conferencia: {
            valores_coincidem: request.amount === charge.amount,
            diferenca_cents: Math.abs(request.amount - charge.amount),
            problema_valor_resolvido: request.amount === charge.amount && request.amount > 0
          }
        });
      }

    } catch (jsonErr) {
      console.error("❌ [PIX PAGARME] Erro ao parsear JSON da resposta:", jsonErr);
      throw new Error('Resposta inválida do servidor PIX');
    }

    console.log("📋 [PIX MODULAR] Resposta detalhada:", {
      status: response.status,
      statusText: response.statusText,
      success: responseData.success,
      timestamp: new Date().toISOString()
    });

    if (!response.ok) {
      throw new Error(responseData.error || responseData.message || 'Erro ao gerar PIX');
    }

    return responseData;
  }
}
