/**
 * Update Auth Settings via Direct Database
 * Atualiza configurações de Auth diretamente no banco
 */

import { createClient } from '@supabase/supabase-js';

const LOCAL_SUPABASE_URL = 'http://127.0.0.1:54321';
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const REDIRECT_URLS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000/password-recovery',
    'http://localhost:5173/password-recovery',
    'http://localhost:5174/password-recovery',
    'http://localhost:3000/reset-password',
    'http://localhost:5173/reset-password',
    'http://localhost:5174/reset-password'
];

async function updateAuthConfigViaSQL() {
    try {
        console.log('🔧 Atualizando configurações via SQL...');
        
        const supabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SERVICE_KEY);
        
        // Atualizar configuração de auth
        const { data, error } = await supabase
            .from('auth.config')
            .upsert({
                parameter: 'uri_allow_list',
                value: REDIRECT_URLS.join(',')
            });
        
        if (error) {
            console.log('❌ Erro SQL:', error.message);
            return false;
        }
        
        console.log('✅ Configurações atualizadas via SQL!');
        return true;
    } catch (error) {
        console.log('❌ Erro na conexão:', error.message);
        return false;
    }
}

async function updateViaRPC() {
    try {
        console.log('🔧 Tentando via RPC...');
        
        const response = await fetch(`${LOCAL_SUPABASE_URL}/rest/v1/rpc/update_auth_config`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': LOCAL_SERVICE_KEY,
                'Authorization': `Bearer ${LOCAL_SERVICE_KEY}`
            },
            body: JSON.stringify({
                site_url: 'http://localhost:3000',
                uri_allow_list: REDIRECT_URLS.join(',')
            })
        });
        
        if (response.ok) {
            console.log('✅ Configurações atualizadas via RPC!');
            return true;
        } else {
            console.log('❌ RPC falhou:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro RPC:', error.message);
        return false;
    }
}

// Método alternativo: inserir diretamente na tabela auth
async function insertAuthSettings() {
    try {
        console.log('🔧 Inserindo configurações de auth...');
        
        const supabase = createClient(LOCAL_SUPABASE_URL, LOCAL_SERVICE_KEY, {
            db: { schema: 'auth' }
        });
        
        // Tentar inserir site_url
        const siteUrlResult = await supabase
            .schema('auth')
            .from('config')
            .upsert({
                parameter: 'site_url',
                value: 'http://localhost:3000'
            });
        
        console.log('Site URL result:', siteUrlResult);
        
        // Tentar inserir uri_allow_list
        const urlsResult = await supabase
            .schema('auth')
            .from('config')
            .upsert({
                parameter: 'uri_allow_list', 
                value: REDIRECT_URLS.join(',')
            });
        
        console.log('URLs result:', urlsResult);
        
        return true;
    } catch (error) {
        console.log('❌ Erro ao inserir:', error.message);
        return false;
    }
}

async function main() {
    console.log('🚀 Tentativa de correção das configurações de Auth');
    console.log('================================================');
    
    console.log('\n📝 URLs que tentaremos configurar:');
    REDIRECT_URLS.forEach(url => console.log(`  - ${url}`));
    
    // Tentar diferentes métodos
    console.log('\n🔄 Método 1: SQL direto...');
    const sqlSuccess = await updateAuthConfigViaSQL();
    
    if (!sqlSuccess) {
        console.log('\n🔄 Método 2: RPC...');
        const rpcSuccess = await updateViaRPC();
        
        if (!rpcSuccess) {
            console.log('\n🔄 Método 3: Inserção direta...');
            await insertAuthSettings();
        }
    }
    
    console.log('\n💡 SOLUÇÃO ALTERNATIVA:');
    console.log('Se os métodos automáticos falharam, você pode:');
    console.log('');
    console.log('1. 🔄 Reiniciar completamente o Supabase:');
    console.log('   npx supabase stop');
    console.log('   npx supabase start');
    console.log('');
    console.log('2. 🌐 Ou usar apenas o config.toml (que já está configurado)');
    console.log('   As URLs já estão no config.toml e funcionarão para reset de senha');
    console.log('');
    console.log('3. 📋 Verificar se funciona:');
    console.log('   node scripts/verifications/check-auth-simple.js');
    console.log('');
    console.log('4. 🧪 Testar reset de senha diretamente no app');
}

main().catch(console.error);
