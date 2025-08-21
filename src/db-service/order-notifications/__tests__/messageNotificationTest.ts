/**
 * Teste manual para validar notificações de mensagem de chat
 * Execute este arquivo para testar o sistema de notificações por email
 */

import { OrderNotificationService } from '../OrderNotificationService';

async function testMessageNotification() {
  console.log('🧪 Iniciando teste de notificação de mensagem...');

  try {
    // Teste 1: Notificação quando cliente envia mensagem
    console.log('\n📤 Teste 1: Cliente enviando mensagem');
    const clientResult = await OrderNotificationService.sendMessageNotification(
      'test-order-id',
      'test-order-item-id',
      {
        message: 'Olá, preciso de ajuda com meu pedido. Quando será entregue?',
        senderName: 'João Silva',
        senderType: 'user'
      }
    );
    console.log('Resultado cliente → admin:', clientResult ? '✅ SUCESSO' : '❌ FALHA');

    // Teste 2: Notificação quando admin envia mensagem
    console.log('\n📥 Teste 2: Admin enviando mensagem');
    const adminResult = await OrderNotificationService.sendMessageNotification(
      'test-order-id',
      'test-order-item-id',
      {
        message: 'Olá João! Seu pedido está sendo processado e deve ficar pronto em 2-3 dias úteis. Qualquer dúvida, estarei aqui!',
        senderName: 'Maria (Suporte)',
        senderType: 'admin'
      }
    );
    console.log('Resultado admin → cliente:', adminResult ? '✅ SUCESSO' : '❌ FALHA');

    console.log('\n🎉 Teste concluído!');
    console.log('Verifique:');
    console.log('1. Logs no console para debug');
    console.log('2. Dashboard do Supabase > Functions');
    console.log('3. Dashboard do Resend para delivery');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testMessageNotification();
}

export { testMessageNotification };
