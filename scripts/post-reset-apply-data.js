#!/usr/bin/env node

/**
 * Script para aplicar dados de produção automaticamente após reset do banco
 * Este script deve ser executado após npx supabase db reset
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 Aplicando dados de produção após reset...');

try {
    // Verificar se o Supabase está rodando
    console.log('📡 Verificando se Supabase está ativo...');
    const statusResult = execSync('npx supabase status', { encoding: 'utf8' });
    
    if (!statusResult.includes('API URL') || !statusResult.includes('54321')) {
        console.log('❌ Supabase não está rodando. Iniciando...');
        execSync('npx supabase start', { stdio: 'inherit' });
    }

    // Aguardar um pouco para o banco estar pronto
    console.log('⏳ Aguardando banco estar pronto...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Aplicar dados de produção
    console.log('📊 Aplicando dados de produção...');
    execSync('node scripts/apply-production-data.js', { stdio: 'inherit' });

    console.log('✅ Dados de produção aplicados com sucesso!');
    console.log('🚀 Sistema pronto para uso com dados reais');

} catch (error) {
    console.error('❌ Erro ao aplicar dados de produção:', error.message);
    console.log('💡 Tente executar manualmente: node scripts/apply-production-data.js');
    process.exit(1);
}

// Função auxiliar para aguardar
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
