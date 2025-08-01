/**
 * Teste simples para verificar conexão com banco de dados
 * Execute este arquivo no console do browser para debug
 */

// Para executar no console do browser:
window.testContractsTable = async function() {
  console.log('🧪 [TEST] Iniciando teste da tabela contracts');
  
  try {
    // Importar supabase (assumindo que está disponível globalmente)
    if (typeof window.supabase === 'undefined') {
      console.error('❌ [TEST] Supabase não está disponível globalmente');
      return;
    }
    
    const supabase = window.supabase;
    
    // Teste 1: Verificar usuário atual
    console.log('\n1️⃣ [TEST] Verificando usuário atual');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('👤 [TEST] Usuário:', user);
    console.log('❌ [TEST] Erro usuário:', userError);
    
    if (!user) {
      console.error('❌ [TEST] Nenhum usuário logado');
      return;
    }
    
    // Teste 2: Verificar se a tabela contracts existe
    console.log('\n2️⃣ [TEST] Verificando tabela contracts');
    const { data: contractsTest, error: contractsError } = await supabase
      .from('contracts')
      .select('count(*)', { count: 'exact' })
      .limit(0);
    
    console.log('📊 [TEST] Resultado contracts:', contractsTest);
    console.log('❌ [TEST] Erro contracts:', contractsError);
    
    // Teste 3: Verificar tabela admins
    console.log('\n3️⃣ [TEST] Verificando tabela admins');
    const { data: adminsTest, error: adminsError } = await supabase
      .from('admins')
      .select('id, role')
      .eq('id', user.id);
    
    console.log('👥 [TEST] Admin data:', adminsTest);
    console.log('❌ [TEST] Erro admins:', adminsError);
    
    // Teste 4: Tentar inserir um contrato de teste
    console.log('\n4️⃣ [TEST] Testando inserção de contrato');
    const testContract = {
      admin_id: user.id,
      type_of_contract: 'termos_condicoes',
      contract_content: 'Conteúdo de teste - ' + Date.now()
    };
    
    console.log('📝 [TEST] Dados para inserir:', testContract);
    
    const { data: insertResult, error: insertError } = await supabase
      .from('contracts')
      .insert([testContract])
      .select()
      .single();
    
    console.log('✅ [TEST] Resultado inserção:', insertResult);
    console.log('❌ [TEST] Erro inserção:', insertError);
    
    // Teste 5: Tentar upsert
    console.log('\n5️⃣ [TEST] Testando upsert');
    const { data: upsertResult, error: upsertError } = await supabase
      .from('contracts')
      .upsert({
        admin_id: user.id,
        type_of_contract: 'termos_condicoes',
        contract_content: 'Conteúdo de upsert - ' + Date.now()
      }, {
        onConflict: 'admin_id,type_of_contract'
      })
      .select()
      .single();
    
    console.log('🔄 [TEST] Resultado upsert:', upsertResult);
    console.log('❌ [TEST] Erro upsert:', upsertError);
    
    console.log('\n🏁 [TEST] Teste concluído');
    
  } catch (error) {
    console.error('💥 [TEST] Erro inesperado:', error);
  }
};

console.log('🧪 Teste carregado! Execute: testContractsTable()');
