/**
 * Debug script to check contracts table structure
 * Use this to verify if the table exists and has the correct columns
 */

import { supabase } from '../lib/supabase';

async function debugContractsTable() {
  console.log('🔍 [Debug] Verificando estrutura da tabela contracts...');

  try {
    // Test 1: Check if table exists by trying to select from it
    console.log('\n📊 [Debug] Teste 1: Verificando se a tabela existe');
    const { data: testQuery, error: testError } = await supabase
      .from('contracts')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ [Debug] Erro ao acessar tabela contracts:', testError);
      return;
    }

    console.log('✅ [Debug] Tabela contracts existe e é acessível');
    console.log('📄 [Debug] Dados de teste:', testQuery);

    // Test 2: Check table structure with a dummy insert (will fail due to constraints, but shows column structure)
    console.log('\n📊 [Debug] Teste 2: Verificando estrutura das colunas');
    const { error: structureError } = await supabase
      .from('contracts')
      .insert([{
        admin_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        type_of_contract: 'termos_condicoes',
        contract_content: 'Test content'
      }]);

    if (structureError) {
      console.log('🔍 [Debug] Erro esperado (estrutura):', structureError.message);
      
      // Check if error is about foreign key (admin_id not found) - this is expected
      if (structureError.message.includes('foreign key') || structureError.message.includes('violates')) {
        console.log('✅ [Debug] Estrutura da tabela está correta (foreign key constraint ativo)');
      }
    }

    // Test 3: Check RLS policies
    console.log('\n📊 [Debug] Teste 3: Verificando políticas RLS');
    const { data: currentUser } = await supabase.auth.getUser();
    console.log('👤 [Debug] Usuário atual:', currentUser.user?.id || 'Não logado');

    // Test 4: List all contracts (will be empty or filtered by RLS)
    console.log('\n📊 [Debug] Teste 4: Listando contratos existentes');
    const { data: allContracts, error: listError, count } = await supabase
      .from('contracts')
      .select('*', { count: 'exact' });

    if (listError) {
      console.error('❌ [Debug] Erro ao listar contratos:', listError);
    } else {
      console.log('📋 [Debug] Contratos encontrados:', count);
      console.log('📄 [Debug] Dados:', allContracts);
    }

    // Test 5: Check admin existence
    console.log('\n📊 [Debug] Teste 5: Verificando existência de admins');
    const { data: admins, error: adminError } = await supabase
      .from('admins')
      .select('id, role')
      .limit(5);

    if (adminError) {
      console.error('❌ [Debug] Erro ao buscar admins:', adminError);
    } else {
      console.log('👥 [Debug] Admins encontrados:', admins?.length || 0);
      console.log('📄 [Debug] Sample admins:', admins);
    }

  } catch (error) {
    console.error('💥 [Debug] Erro inesperado:', error);
  }
}

// Execute the debug function
debugContractsTable();
