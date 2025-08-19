import { createClient } from '@supabase/supabase-js'

const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

async function testMainPixFunction() {
  console.log('🧪 Testando function pagarme-pix-payment principal...')
  
  try {
    const testPayload = {
      amount: 1000, // R$ 10,00
      customer_name: 'João Teste',
      customer_email: 'joao@teste.com',
      customer_document: '11144477735', // CPF válido
      customer_phone: '11999999999',
      customer_legal_status: 'pf',
      order_id: 'test_order_' + Date.now(),
      order_items: [{
        amount: 1000,
        description: 'Produto Teste',
        quantity: 1,
        code: 'PROD_001'
      }]
    }

    console.log('📤 Enviando payload:', testPayload)

    const { data, error } = await localClient.functions.invoke('pagarme-pix-payment', {
      body: testPayload
    })
    
    if (error) {
      console.error('❌ Erro na function:', error)
    } else {
      console.log('✅ Resposta da function:', data)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testMainPixFunction()
