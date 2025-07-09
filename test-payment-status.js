// Teste para verificar o status exato retornado pela Pagar.me
import fetch from 'node-fetch';



// Mock auth para simular usuário logado
const mockJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnZmJncWhnZWZ2Z2p3Z3B1YWhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MDIwMzEsImV4cCI6MjA1MjI3ODAzMX0.LqyI6zFKS8MZBx4jfkYvS9Q2c2iUPX2jWMVPR4CIqKE';

async function testPaymentStatus() {
  try {
    console.log('🧪 TESTANDO STATUS DE PAGAMENTO...\n');

    const response = await fetch('https://kgfbgqhgefvgjwgpuahb.supabase.co/functions/v1/pagarme-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockJWT}`,
      },
      body: JSON.stringify({
        action: 'direct_payment',
        amount: 1000, // R$ 10,00
        card_number: '4000000000000010',
        card_exp_month: '12',
        card_exp_year: '2030',
        card_cvv: '123',
        card_holder_name: 'JOAO DA SILVA',
        customer_name: 'João da Silva',
        customer_email: 'joao@teste.com',
        customer_document: '12345678901',
        billing_address: {
          line_1: 'Rua Teste, 123',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01310-100',
          country: 'BR'
        }
      })
    });

    const result = await response.json();
    
    console.log('📊 RESULTADO COMPLETO DO PAGAMENTO:');
    console.log('Status HTTP:', response.status);
    console.log('Response OK:', response.ok);
    console.log('\n📋 DADOS DA RESPOSTA:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🔍 ANÁLISE DO STATUS:');
    console.log('Status do pagamento:', result.status);
    console.log('ID do pedido:', result.id);
    
    if (result.charges && result.charges.length > 0) {
      const charge = result.charges[0];
      console.log('\n💳 INFORMAÇÕES DO CHARGE:');
      console.log('Status do charge:', charge.status);
      console.log('ID do charge:', charge.id);
      
      if (charge.last_transaction) {
        console.log('\n🔄 ÚLTIMA TRANSAÇÃO:');
        console.log('Status da transação:', charge.last_transaction.status);
        console.log('Código de resposta:', charge.last_transaction.acquirer_return_code);
        console.log('Mensagem:', charge.last_transaction.acquirer_message);
        
        if (charge.last_transaction.gateway_response) {
          console.log('\n🚪 RESPOSTA DO GATEWAY:');
          console.log('Código:', charge.last_transaction.gateway_response.code);
          console.log('Erros:', charge.last_transaction.gateway_response.errors);
        }
      }
    }
    
    console.log('\n✅ VERIFICAÇÕES:');
    console.log('É sucesso (paid/approved)?', result.status === 'paid' || result.status === 'approved');
    console.log('É falha (failed)?', result.status === 'failed');
    console.log('Status atual no frontend seria:', 
      result.status === 'paid' || result.status === 'approved' ? 'SUCESSO' : 
      result.status === 'failed' ? 'ERRO' : 'REJEITADO (status não reconhecido)'
    );

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  }
}

testPaymentStatus();
