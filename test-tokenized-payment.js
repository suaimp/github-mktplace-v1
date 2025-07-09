// Teste do novo fluxo: tokenização + pagamento
import fetch from 'node-fetch';

const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZmJncWhnZWZ2Z2p3Z3B1YWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MDIwMzEsImV4cCI6MjA1MjI3ODAzMX0.LqyI6zFKS8MZBx4jfkYvS9Q2c2iUPX2jWMVPR4CIqKE';
const url = 'https://uxbeaslwirkepnowydfu.supabase.co/functions/v1/pagarme-payment';

async function testTokenizedPayment() {
  try {
    console.log('🧪 TESTANDO FLUXO COMPLETO: TOKENIZAÇÃO + PAGAMENTO...\n');

    // Testar fluxo completo em uma única chamada
    console.log('📋 Executando teste completo...');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockJWT}`,
      },
      body: JSON.stringify({
        action: 'test_payment_flow'
      })
    });

    const result = await response.json();
    
    console.log('Status da resposta:', response.status);
    console.log('Resultado completo:', JSON.stringify(result, null, 2));

    if (result.tokenization) {
      console.log('\n📋 TOKENIZAÇÃO:');
      console.log('Status:', result.tokenization.status);
      console.log('Token gerado:', result.tokenization.data.id || 'NÃO GERADO');
    }

    if (result.payment) {
      console.log('\n💳 PAGAMENTO:');
      console.log('Status HTTP:', result.payment.status);
      console.log('Status do pedido:', result.payment.data.status);
      console.log('ID do pedido:', result.payment.data.id);
      
      if (result.payment.data.charges && result.payment.data.charges.length > 0) {
        const charge = result.payment.data.charges[0];
        console.log('Status do charge:', charge.status);
        
        if (charge.last_transaction) {
          console.log('Status da transação:', charge.last_transaction.status);
          console.log('Código de resposta:', charge.last_transaction.acquirer_return_code);
          console.log('Mensagem:', charge.last_transaction.acquirer_message);
        }
      }
    }

    // Análise final
    const statusesAceitos = ['paid', 'approved', 'processing', 'pending_payment', 'authorized'];
    const paymentStatus = result.payment?.data?.status;
    const seriaAceito = statusesAceitos.includes(paymentStatus);
    
    console.log('\n✅ RESULTADO FINAL:');
    console.log('Seria aceito pelo frontend?', seriaAceito ? 'SIM' : 'NÃO');
    console.log('Status atual:', paymentStatus);
    console.log('Problema de segurança resolvido?', paymentStatus !== 'failed' ? 'SIM' : 'NÃO');

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  }
}

testTokenizedPayment();
