/**
 * Teste dos templates de email para notificações de mensagem
 */

import { EmailTemplateService } from '../templates';
import { MessageEmailData } from '../types';

function testEmailTemplates() {
  console.log('🧪 === TESTE DOS TEMPLATES DE EMAIL ===');

  try {
    // Dados de teste
    const mockData: MessageEmailData = {
      orderId: 'test-order-123',
      shortOrderId: 'test-order',
      orderItemId: 'test-item-456',
      userName: 'João Silva',
      userEmail: 'joao@exemplo.com',
      productName: 'Artigo sobre Tecnologia',
      productUrl: 'https://exemplo.com/artigo-tecnologia',
      message: 'Olá, gostaria de saber quando o artigo ficará pronto. Obrigado!',
      senderName: 'João Silva',
      senderType: 'user'
    };

    const platformName = 'Marketplace Sua Imprensa - Teste';

    console.log('🧪 Dados de teste:', mockData);

    // Teste template para cliente (quando admin responde)
    console.log('\n📧 === TESTANDO TEMPLATE PARA CLIENTE ===');
    const clientTemplate = EmailTemplateService.generateMessageTemplate(mockData, false, platformName);
    console.log('📧 Assunto (Cliente):', clientTemplate.subject);
    console.log('📧 HTML Length (Cliente):', clientTemplate.html.length);
    console.log('📧 Preview HTML (Cliente):', clientTemplate.html.substring(0, 200) + '...');

    // Teste template para admin (quando cliente envia)
    console.log('\n🛡️ === TESTANDO TEMPLATE PARA ADMIN ===');
    const adminTemplate = EmailTemplateService.generateMessageTemplate(mockData, true, platformName);
    console.log('🛡️ Assunto (Admin):', adminTemplate.subject);
    console.log('🛡️ HTML Length (Admin):', adminTemplate.html.length);
    console.log('🛡️ Preview HTML (Admin):', adminTemplate.html.substring(0, 200) + '...');

    // Verificar se templates contêm dados importantes
    console.log('\n🔍 === VERIFICANDO CONTEÚDO DOS TEMPLATES ===');
    
    const clientHasOrderId = clientTemplate.html.includes(mockData.shortOrderId);
    const clientHasMessage = clientTemplate.html.includes(mockData.message);
    const adminHasOrderId = adminTemplate.html.includes(mockData.shortOrderId);
    const adminHasMessage = adminTemplate.html.includes(mockData.message);

    console.log('✅ Template Cliente contém Order ID:', clientHasOrderId);
    console.log('✅ Template Cliente contém Mensagem:', clientHasMessage);
    console.log('✅ Template Admin contém Order ID:', adminHasOrderId);
    console.log('✅ Template Admin contém Mensagem:', adminHasMessage);

    if (clientHasOrderId && clientHasMessage && adminHasOrderId && adminHasMessage) {
      console.log('\n🎉 TODOS OS TEMPLATES ESTÃO FUNCIONANDO CORRETAMENTE!');
    } else {
      console.log('\n❌ ALGUNS TEMPLATES TÊM PROBLEMAS!');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste de templates:', error);
  }
}

// Executar o teste
testEmailTemplates();

export { testEmailTemplates };
