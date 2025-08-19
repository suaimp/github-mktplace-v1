import { createClient } from '@supabase/supabase-js'

// Configurações locais
const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

async function testPagarmeConnection() {
  console.log('🧪 Testando conexão com Pagar.me...')
  
  try {
    // Testar a função debug-secrets primeiro
    console.log('1. Testando function debug-secrets...')
    const { data: secretsData, error: secretsError } = await localClient.functions.invoke('debug-secrets')
    
    if (secretsError) {
      console.error('❌ Erro ao testar debug-secrets:', secretsError)
    } else {
      console.log('✅ debug-secrets funcionou:', secretsData)
    }

    // Testar a função test-pix-simple
    console.log('\n2. Testando function test-pix-simple...')
    const { data: pixData, error: pixError } = await localClient.functions.invoke('test-pix-simple', {
      body: {
        amount: 100, // R$ 1,00
        description: 'Teste PIX Local'
      }
    })
    
    if (pixError) {
      console.error('❌ Erro ao testar PIX:', pixError)
    } else {
      console.log('✅ test-pix-simple funcionou:', pixData)
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testPagarmeConnection()
