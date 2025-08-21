/**
 * Guia para configurar URLs no Supabase Studio
 * Gera instruções detalhadas para configuração manual
 */

const STUDIO_URL = 'http://127.0.0.1:54323';
const AUTH_URLS_CONFIG = 'http://127.0.0.1:54323/project/default/auth/url-configuration';

const URLS_TO_CONFIGURE = [
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

function generateInstructions() {
    console.log('🎯 GUIA: Configurar URLs no Supabase Studio Local');
    console.log('================================================');
    
    console.log('\n📍 PASSO 1: Acesse a página de configuração');
    console.log(`🔗 URL: ${AUTH_URLS_CONFIG}`);
    
    console.log('\n📍 PASSO 2: Configure o Site URL');
    console.log('Site URL: http://localhost:3000');
    
    console.log('\n📍 PASSO 3: Configure Redirect URLs');
    console.log('Adicione as seguintes URLs (uma por linha):');
    console.log('');
    
    URLS_TO_CONFIGURE.forEach((url, index) => {
        console.log(`${index + 1}. ${url}`);
    });
    
    console.log('\n📍 PASSO 4: Clique em "Save"');
    
    console.log('\n🔧 URLs formatadas para copiar e colar:');
    console.log('=====================================');
    console.log(URLS_TO_CONFIGURE.join('\n'));
    
    console.log('\n📋 Verificação após configurar:');
    console.log('Teste reset de senha em: http://localhost:3000');
    console.log('Verifique se o email é enviado e o redirect funciona');
    
    console.log('\n🚀 Links úteis:');
    console.log(`Studio: ${STUDIO_URL}`);
    console.log(`Auth Config: ${AUTH_URLS_CONFIG}`);
    console.log('Verificação: node scripts/verifications/check-auth-simple.js');
}

function openBrowserInstructions() {
    console.log('\n💡 DICA: Para abrir automaticamente no navegador:');
    console.log('Windows: start "url"');
    console.log('Mac: open "url"');
    console.log('Linux: xdg-open "url"');
    
    console.log('\n🖥️ Comandos para abrir:');
    console.log(`start "${AUTH_URLS_CONFIG}"`);
}

function main() {
    generateInstructions();
    openBrowserInstructions();
    
    console.log('\n⚡ RESUMO RÁPIDO:');
    console.log('1. Acesse: http://127.0.0.1:54323/project/default/auth/url-configuration');
    console.log('2. Site URL: http://localhost:3000');
    console.log('3. Adicione as 9 URLs listadas acima');
    console.log('4. Clique Save');
    console.log('5. Teste reset de senha');
}

main();
