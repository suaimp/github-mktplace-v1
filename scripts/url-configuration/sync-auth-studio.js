/**
 * Sync URLs via Supabase Auth API
 * Sincroniza URLs diretamente no Auth do Supabase local
 */

const SUPABASE_LOCAL_URL = 'http://127.0.0.1:54321';
const SUPABASE_LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// URLs para configurar
const AUTH_CONFIG = {
    SITE_URL: 'http://localhost:3000',
    ADDITIONAL_REDIRECT_URLS: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000/password-recovery',
        'http://localhost:5173/password-recovery',
        'http://localhost:5174/password-recovery',
        'http://localhost:3000/reset-password',
        'http://localhost:5173/reset-password',
        'http://localhost:5174/reset-password'
    ]
};

async function updateAuthSettings() {
    try {
        console.log('🔧 Atualizando configurações de Auth via API...');
        
        // Endpoint para atualizar configurações de auth
        const response = await fetch(`${SUPABASE_LOCAL_URL}/auth/v1/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_LOCAL_SERVICE_KEY}`,
                'apikey': SUPABASE_LOCAL_SERVICE_KEY
            },
            body: JSON.stringify({
                site_url: AUTH_CONFIG.SITE_URL,
                uri_allow_list: AUTH_CONFIG.ADDITIONAL_REDIRECT_URLS.join(',')
            })
        });
        
        if (response.ok) {
            console.log('✅ Configurações de Auth atualizadas via API!');
            return true;
        } else {
            const error = await response.text();
            console.log('❌ Erro ao atualizar via API:', error);
            return false;
        }
    } catch (error) {
        console.log('❌ Erro na requisição:', error.message);
        return false;
    }
}

async function checkCurrentSettings() {
    try {
        console.log('📋 Verificando configurações atuais...');
        
        const response = await fetch(`${SUPABASE_LOCAL_URL}/auth/v1/settings`, {
            headers: {
                'Authorization': `Bearer ${SUPABASE_LOCAL_SERVICE_KEY}`,
                'apikey': SUPABASE_LOCAL_SERVICE_KEY
            }
        });
        
        if (response.ok) {
            const settings = await response.json();
            console.log('Current settings:', JSON.stringify(settings, null, 2));
            return settings;
        } else {
            console.log('❌ Erro ao buscar configurações:', response.status);
            return null;
        }
    } catch (error) {
        console.log('❌ Erro ao verificar configurações:', error.message);
        return null;
    }
}

async function main() {
    console.log('🚀 Sincronização de URLs via Supabase Auth API');
    console.log('===============================================');
    
    // Verificar configurações atuais
    await checkCurrentSettings();
    
    console.log('\n📝 URLs que serão configuradas:');
    console.log('Site URL:', AUTH_CONFIG.SITE_URL);
    console.log('Redirect URLs:');
    AUTH_CONFIG.ADDITIONAL_REDIRECT_URLS.forEach(url => {
        console.log(`  - ${url}`);
    });
    
    // Atualizar configurações
    const success = await updateAuthSettings();
    
    if (success) {
        console.log('\n✅ Sincronização concluída!');
        console.log('🌐 Acesse o Studio para verificar:');
        console.log('   http://127.0.0.1:54323/project/default/auth/url-configuration');
        
        // Verificar novamente
        console.log('\n📋 Configurações após atualização:');
        await checkCurrentSettings();
    } else {
        console.log('\n❌ Falha na sincronização.');
        console.log('💡 Tente configurar manualmente no Studio:');
        console.log('   http://127.0.0.1:54323/project/default/auth/url-configuration');
    }
}

main().catch(console.error);
