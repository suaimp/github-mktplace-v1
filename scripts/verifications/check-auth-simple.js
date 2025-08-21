/**
 * Verificação simples das configurações de Auth
 */

import fs from 'fs';
import path from 'path';

const CONFIG_PATH = 'supabase/config.toml';

// Verificar se Supabase está rodando
async function checkSupabase() {
    try {
        // Testar endpoint REST API que sabemos que funciona
        const response = await fetch('http://localhost:54321/rest/v1/', {
            signal: AbortSignal.timeout(5000)
        });
        if (response.ok) {
            return { running: true, port: 54321 };
        }
        return { running: false, port: null };
    } catch {
        return { running: false, port: null };
    }
}

// Ler configurações do arquivo
function readConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        return { error: 'config.toml não encontrado' };
    }
    
    try {
        const content = fs.readFileSync(CONFIG_PATH, 'utf8');
        
        // Extrair site_url
        const siteUrlMatch = content.match(/site_url\s*=\s*["']([^"']+)["']/);
        const siteUrl = siteUrlMatch ? siteUrlMatch[1] : 'Não configurado';
        
        // Extrair redirect URLs
        const redirectMatch = content.match(/additional_redirect_urls\s*=\s*\[([\s\S]*?)\]/);
        let redirectUrls = [];
        
        if (redirectMatch) {
            const urlsString = redirectMatch[1];
            redirectUrls = urlsString
                .split(',')
                .map(url => url.trim().replace(/['"]/g, ''))
                .filter(url => url.length > 0);
        }
        
        return {
            siteUrl,
            redirectUrls,
            count: redirectUrls.length
        };
    } catch (error) {
        return { error: error.message };
    }
}

// Função principal
async function main() {
    console.log('🔍 Verificação: Configurações de Auth');
    console.log('====================================');
    
    // Verificar Supabase
    const supabaseStatus = await checkSupabase();
    console.log(`Supabase Status: ${supabaseStatus.running ? '✅ Online' : '❌ Offline'}`);
    
    if (supabaseStatus.running) {
        console.log(`Dashboard: http://localhost:${supabaseStatus.port}`);
        console.log(`Auth Users: http://127.0.0.1:${supabaseStatus.port}/project/default/auth/users`);
    }
    
    console.log('');
    
    // Verificar configurações
    const config = readConfig();
    
    if (config.error) {
        console.log(`❌ Erro: ${config.error}`);
        return;
    }
    
    console.log(`📍 Site URL: ${config.siteUrl}`);
    console.log(`🔗 Redirect URLs (${config.count}):`);
    
    if (config.count === 0) {
        console.log('   ❌ Nenhuma URL configurada!');
        console.log('   💡 Execute: .\\scripts\\url-configuration\\sync-auth-urls.ps1');
    } else {
        config.redirectUrls.forEach(url => {
            const icon = url.includes('localhost') ? '🏠' : '🌐';
            console.log(`   ${icon} ${url}`);
        });
        
        // Análise
        const localhost = config.redirectUrls.filter(url => url.includes('localhost'));
        const authRoutes = config.redirectUrls.filter(url => 
            url.includes('password') || url.includes('reset')
        );
        
        console.log('');
        console.log('📊 Resumo:');
        console.log(`   🏠 URLs Localhost: ${localhost.length}`);
        console.log(`   🔐 Rotas Auth: ${authRoutes.length}`);
        
        // Verificar essenciais
        const hasRecovery = authRoutes.some(url => url.includes('password-recovery'));
        const hasReset = authRoutes.some(url => url.includes('reset-password'));
        
        console.log(`   ${hasRecovery ? '✅' : '⚠️'} /password-recovery`);
        console.log(`   ${hasReset ? '✅' : '⚠️'} /reset-password`);
    }
    
    console.log('');
    console.log('🔧 Comandos úteis:');
    console.log('   Sincronizar: .\\scripts\\url-configuration\\sync-auth-urls.ps1');
    
    if (config.error) {
        console.log('   Dashboard: http://localhost:54321 ou http://localhost:54323');
    } else {
        const status = await checkSupabase();
        if (status.running) {
            console.log(`   Dashboard: http://localhost:${status.port}`);
        } else {
            console.log('   Dashboard: http://localhost:54321 ou http://localhost:54323');
        }
    }
}

main().catch(console.error);
