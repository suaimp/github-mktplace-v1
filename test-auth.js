// Teste de autenticação - Cole no console do navegador
async function testAuth() {
  try {
    // Obter a sessão atual
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    console.log('[TEST] Dados da sessão:', {
      hasSession: !!sessionData?.session,
      hasAccessToken: !!sessionData?.session?.access_token,
      tokenExpiry: sessionData?.session?.expires_at,
      sessionError: sessionError,
      userId: sessionData?.session?.user?.id
    });

    if (!sessionData?.session?.access_token) {
      console.error('[TEST] Não há token de acesso');
      return;
    }

    const access_token = sessionData.session.access_token;
    const url = 'https://uxbeaslwirkepnowydfu.supabase.co/functions/v1/pagarme-payment';
    
    console.log('[TEST] Fazendo requisição para:', url);
    console.log('[TEST] Token (primeiros 20 chars):', access_token.substring(0, 20) + '...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        test: true
      })
    });

    console.log('[TEST] Status da resposta:', response.status);
    console.log('[TEST] Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('[TEST] Resultado:', result);

  } catch (error) {
    console.error('[TEST] Erro:', error);
  }
}

// Execute: testAuth();
