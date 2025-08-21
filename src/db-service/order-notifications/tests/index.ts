/**
 * Índice dos testes para o sistema de notificações por email
 * 
 * Este arquivo centraliza todos os testes disponíveis para o sistema de notificações.
 * Execute os testes individualmente ou em conjunto para verificar o funcionamento.
 */

import { testMessageNotification } from './test-message-notification';
import { testEmailTemplates } from './test-templates';

// Exportar todos os testes
export {
  testMessageNotification,
  testEmailTemplates
};

/**
 * Executa todos os testes em sequência
 */
export async function runAllTests() {
  console.log('🧪 === EXECUTANDO TODOS OS TESTES ===\n');

  try {
    // Teste 1: Templates
    console.log('1️⃣ Testando templates de email...');
    testEmailTemplates();
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Teste 2: Notificação de mensagem (requer dados reais)
    console.log('2️⃣ Testando notificação de mensagem...');
    console.log('⚠️ Este teste requer dados reais do banco de dados');
    console.log('💡 Execute manualmente: testMessageNotification()');
    
    console.log('\n🎉 TESTES CONCLUÍDOS!');
    console.log('📧 Para testar email real, execute: testMessageNotification()');
    console.log('🌐 Para testar edge function direta, execute: node test-edge-function.js');
    
  } catch (error) {
    console.error('❌ Erro durante a execução dos testes:', error);
  }
}

// Executar todos os testes se este arquivo for executado diretamente
if (require.main === module) {
  runAllTests();
}
