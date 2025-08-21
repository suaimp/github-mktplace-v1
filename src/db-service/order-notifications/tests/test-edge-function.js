/**
 * Teste direto da edge function para verificar se o email está sendo enviado
 */

console.log('🧪 === TESTE DIRETO DA EDGE FUNCTION ===');

// Simular uma chamada direta para a edge function
async function testEdgeFunction() {
  try {
    const payload = {
      to: ['contato@suaimprensa.com.br'],
      subject: 'Teste de Notificação de Mensagem',
      html: `
        <h2>🧪 Teste de Notificação</h2>
        <p>Esta é uma mensagem de teste para verificar se o sistema de email está funcionando.</p>
        <p><strong>Dados do teste:</strong></p>
        <ul>
          <li>Data: ${new Date().toLocaleString()}</li>
          <li>Tipo: Teste direto da edge function</li>
        </ul>
      `,
      from: {
        email: 'noreply@cp.suaimprensa.com.br',
        name: 'Marketplace Sua Imprensa - Teste'
      }
    };

    console.log('📧 Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('http://127.0.0.1:54321/functions/v1/send-order-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      },
      body: JSON.stringify(payload)
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const result = await response.text();
    console.log('📡 Resposta completa:', result);

    if (response.ok) {
      console.log('✅ Edge function executada com sucesso!');
      console.log('📧 Verifique o Inbucket em: http://localhost:54324');
    } else {
      console.log('❌ Erro na edge function');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testEdgeFunction();
