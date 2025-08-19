#!/usr/bin/env node

/**
 * Script que faz reset do banco E aplica dados de produção automaticamente
 * Substitui o npx supabase db reset para manter os dados de produção
 */

import { execSync } from 'child_process';

console.log('🔄 Fazendo reset do banco com preservação de dados de produção...');

try {
    // 1. Fazer reset do banco
    console.log('📊 Executando reset do banco...');
    execSync('npx supabase db reset', { stdio: 'inherit' });

    // 2. Aguardar um pouco para o banco estar pronto
    console.log('⏳ Aguardando banco estar pronto...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Aplicar dados de produção
    console.log('📈 Aplicando dados de produção...');
    execSync('node scripts/apply-production-data.js', { stdio: 'inherit' });

    console.log('✅ Reset completo com dados de produção aplicados!');
    console.log('🎯 Sistema pronto para testar o chat');

} catch (error) {
    console.error('❌ Erro durante o processo:', error.message);
    console.log('💡 Tente executar os comandos separadamente:');
    console.log('   1. npx supabase db reset');
    console.log('   2. node scripts/apply-production-data.js');
    process.exit(1);
}

// Função auxiliar para aguardar
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
