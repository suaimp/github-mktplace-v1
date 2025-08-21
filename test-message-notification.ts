/**
 * Teste para verificar se o sistema de notificação de mensagem por email está funcionando
 * Execute este arquivo para testar o envio de email
 */

import { OrderNotificationService } from './src/db-service/order-notifications/OrderNotificationService';

async function testMessageNotification() {
  console.log('🧪 === TESTE DE NOTIFICAÇÃO DE MENSAGEM ===');
  
  try {
    // Dados de teste - substitua por dados reais do seu sistema
    const testOrderId = 'test-order-123';
    const testOrderItemId = 'test-item-456';
    const testMessageData = {
      message: 'Esta é uma mensagem de teste para verificar o sistema de notificação por email.',
      senderName: 'João Silva',
      senderType: 'user' as const // Cliente enviando mensagem
    };

    console.log('🧪 Dados de teste:', {
      orderId: testOrderId,
      orderItemId: testOrderItemId,
      messageData: testMessageData
    });

    console.log('🧪 Iniciando teste...');
    
    const result = await OrderNotificationService.sendMessageNotification(
      testOrderId,
      testOrderItemId,
      testMessageData
    );

    console.log('🧪 === RESULTADO DO TESTE ===');
    console.log('✅ Sucesso:', result);
    
    if (result) {
      console.log('🎉 Email de notificação enviado com sucesso!');
      console.log('📧 Verifique o Inbucket em: http://localhost:54324');
    } else {
      console.log('❌ Falha ao enviar email de notificação');
      console.log('🔍 Verifique os logs acima para identificar o problema');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar o teste se este arquivo for executado diretamente
if (require.main === module) {
  testMessageNotification();
}

export { testMessageNotification };
