/**
 * Verification: Supabase Auth Configuration
 * Script para verificar configurações de autenticação do Supabase
 * 
 * Funcionalidades:
 * - Verifica status do Supabase local
 * - Analisa configurações de auth no config.toml
 * - Testa URLs de redirect configuradas
 * - Fornece recomendações de segurança
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurações
const CONFIG_PATH = path.join(process.cwd(), 'supabase', 'config.toml');
const SUPABASE_LOCAL_URL = 'http://localhost:54321';

// URLs essenciais que devem estar configuradas
const ESSENTIAL_URLS = [
    'http://localhost:3000/password-recovery',
    'http://localhost:5173/password-recovery',
    'http://localhost:5174/password-recovery',
    'http://localhost:3000/reset-password',
    'http://localhost:5173/reset-password',
    'http://localhost:5174/reset-password'
];

/**
 * Verifica se o Supabase local está rodando
 */
async function checkSupabaseStatus() {
    try {
        const response = await fetch(`${SUPABASE_LOCAL_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        return {
            running: response.ok,
            status: response.status,
            url: SUPABASE_LOCAL_URL
        };
    } catch (error) {
        return {
            running: false,
            error: error.message,
            url: SUPABASE_LOCAL_URL
        };
    }
}

/**
 * Verifica endpoint de auth específico
 */
async function checkAuthEndpoint() {
    try {
        const response = await fetch(`${SUPABASE_LOCAL_URL}/auth/v1/settings`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000)
        });
        
        const data = await response.json();
        return {
            accessible: response.ok,
            settings: data
        };
    } catch (error) {
        return {
            accessible: false,
            error: error.message
        };
    }
}

/**
 * Extrai configurações de auth do config.toml
 */
function parseAuthConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        return {
            found: false,
            error: 'Arquivo config.toml não encontrado'
        };
    }
    
    try {
        const content = fs.readFileSync(CONFIG_PATH, 'utf8');
        
        // Regex patterns para extrair configurações
        const patterns = {
            enabled: /\[auth\][\s\S]*?enabled\s*=\s*(true|false)/,
            siteUrl: /site_url\s*=\s*["']([^"']+)["']/,
            redirectUrls: /additional_redirect_urls\s*=\s*\[([\s\S]*?)\]/,
            jwtExpiry: /jwt_expiry\s*=\s*(\d+)/,
            enableSignup: /enable_signup\s*=\s*(true|false)/,
            enableManualLinking: /enable_manual_linking\s*=\s*(true|false)/
        };
        
        const config = {
            found: true,
            enabled: true, // default
            siteUrl: null,
            redirectUrls: [],
            jwtExpiry: 3600,
            enableSignup: true,
            enableManualLinking: false
        };
        
        // Extrair cada configuração
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = content.match(pattern);
            if (match) {
                if (key === 'redirectUrls') {
                    // Processar array de URLs
                    const urlsString = match[1];
                    const urls = urlsString
                        .split(',')
                        .map(url => url.trim().replace(/['"]/g, ''))
                        .filter(url => url.length > 0);
                    config[key] = urls;
                } else if (key === 'enabled' || key === 'enableSignup' || key === 'enableManualLinking') {
                    config[key] = match[1] === 'true';
                } else if (key === 'jwtExpiry') {
                    config[key] = parseInt(match[1]);
                } else {
                    config[key] = match[1];
                }
            }
        }
        
        return config;
    } catch (error) {
        return {
            found: false,
            error: `Erro ao ler config.toml: ${error.message}`
        };
    }
}

/**
 * Testa acessibilidade das URLs configuradas
 */
async function testUrls(urls) {
    const results = [];
    
    for (const url of urls) {
        const result = {
            url,
            type: url.includes('localhost') ? 'local' : 'external',
            route: (url.includes('password') || url.includes('reset')) ? 'auth' : 'base',
            accessible: null,
            error: null
        };
        
        // Testar apenas URLs localhost
        if (result.type === 'local') {
            try {
                // Extrair base URL (sem path) para teste
                const baseUrl = url.replace(/(http:\/\/localhost:\d+).*/, '$1');
                const response = await fetch(baseUrl, {
                    method: 'GET',
                    signal: AbortSignal.timeout(3000)
                });
                result.accessible = response.ok;
                result.status = response.status;
            } catch (error) {
                result.accessible = false;
                result.error = error.message;
            }
        } else {
            result.accessible = 'N/A';
        }
        
        results.push(result);
    }
    
    return results;
}

/**
 * Analisa a configuração e fornece insights
 */
function analyzeConfig(config) {
    const analysis = {
        status: 'ok',
        warnings: [],
        errors: [],
        recommendations: [],
        coverage: {
            localhostUrls: 0,
            authRoutes: 0,
            externalUrls: 0,
            commonPorts: []
        }
    };
    
    if (!config.found) {
        analysis.status = 'error';
        analysis.errors.push(config.error);
        return analysis;
    }
    
    // Analisar URLs
    const { redirectUrls } = config;
    
    if (redirectUrls.length === 0) {
        analysis.status = 'warning';
        analysis.warnings.push('Nenhuma URL de redirect configurada');
        analysis.recommendations.push('Execute: ./scripts/url-configuration/sync-auth-urls.ps1');
    }
    
    // Categorizar URLs
    redirectUrls.forEach(url => {
        if (url.includes('localhost')) {
            analysis.coverage.localhostUrls++;
            
            // Extrair porta
            const portMatch = url.match(/:(\d+)/);
            if (portMatch) {
                const port = portMatch[1];
                if (!analysis.coverage.commonPorts.includes(port)) {
                    analysis.coverage.commonPorts.push(port);
                }
            }
        } else {
            analysis.coverage.externalUrls++;
        }
        
        if (url.includes('password') || url.includes('reset')) {
            analysis.coverage.authRoutes++;
        }
    });
    
    // Verificar portas comuns
    const expectedPorts = ['3000', '5173', '5174'];
    const missingPorts = expectedPorts.filter(port => 
        !analysis.coverage.commonPorts.includes(port)
    );
    
    if (missingPorts.length > 0) {
        analysis.warnings.push(`Portas não cobertas: ${missingPorts.join(', ')}`);
    }
    
    // Verificar URLs essenciais
    const missingEssential = ESSENTIAL_URLS.filter(essential => 
        !redirectUrls.includes(essential)
    );
    
    if (missingEssential.length > 0) {
        analysis.warnings.push(`URLs essenciais ausentes: ${missingEssential.length}`);
        analysis.recommendations.push('Adicione URLs de reset de senha para todas as portas');
    }
    
    // Verificar configurações de auth
    if (!config.enabled) {
        analysis.status = 'error';
        analysis.errors.push('Auth module está desabilitado');
    }
    
    if (!config.siteUrl) {
        analysis.warnings.push('Site URL não configurado');
    }
    
    return analysis;
}

/**
 * Gera relatório em formato texto
 */
function generateTextReport(supabaseStatus, authEndpoint, config, analysis, urlTests = null) {
    const lines = [];
    
    lines.push('🔍 Verificação: Configurações de Auth');
    lines.push('====================================');
    lines.push('');
    
    // Status do Supabase
    const statusIcon = supabaseStatus.running ? '✅' : '❌';
    const statusText = supabaseStatus.running ? 'Online' : 'Offline';
    lines.push(`Supabase Status: ${statusIcon} ${statusText}`);
    
    if (supabaseStatus.running) {
        const authIcon = authEndpoint.accessible ? '✅' : '⚠️';
        const authText = authEndpoint.accessible ? 'Acessível' : 'Problema';
        lines.push(`Auth Endpoint: ${authIcon} ${authText}`);
        lines.push(`Dashboard: ${SUPABASE_LOCAL_URL}`);
    }
    
    lines.push('');
    
    if (config.found) {
        // Configurações básicas
        const enabledIcon = config.enabled ? '✅' : '❌';
        lines.push(`Auth Module: ${enabledIcon} ${config.enabled ? 'Habilitado' : 'Desabilitado'}`);
        lines.push(`📍 Site URL: ${config.siteUrl || 'Não configurado'}`);
        lines.push(`⏱️ JWT Expiry: ${config.jwtExpiry} segundos`);
        
        const signupIcon = config.enableSignup ? '✅' : '⚠️';
        lines.push(`👤 Enable Signup: ${signupIcon} ${config.enableSignup ? 'Habilitado' : 'Desabilitado'}`);
        
        lines.push('');
        
        // URLs de redirect
        lines.push(`🔗 Redirect URLs Configuradas (${config.redirectUrls.length}):`);
        
        if (config.redirectUrls.length === 0) {
            lines.push('   ❌ Nenhuma URL configurada!');
            lines.push('   💡 Execute: ./scripts/url-configuration/sync-auth-urls.ps1');
        } else {
            config.redirectUrls.forEach(url => {
                let icon = '   -';
                if (url.includes('localhost')) {
                    icon = '   🏠';
                } else if (url.includes('password') || url.includes('reset')) {
                    icon = '   🔐';
                } else if (!url.includes('localhost')) {
                    icon = '   🌐';
                }
                
                let statusText = '';
                if (urlTests) {
                    const test = urlTests.find(t => t.url === url);
                    if (test && test.accessible === true) {
                        statusText = ' ✅';
                    } else if (test && test.accessible === false) {
                        statusText = ' ❌';
                    }
                }
                
                lines.push(`${icon} ${url}${statusText}`);
            });
        }
        
        // Análise resumida
        lines.push('');
        lines.push('📊 Análise Resumida:');
        lines.push(`   🏠 URLs Localhost: ${analysis.coverage.localhostUrls}`);
        lines.push(`   🔐 Rotas de Auth: ${analysis.coverage.authRoutes}`);
        lines.push(`   🌐 URLs Externas: ${analysis.coverage.externalUrls}`);
        lines.push(`   🔌 Portas cobertas: ${analysis.coverage.commonPorts.join(', ')}`);
        
        // Status geral
        lines.push('');
        lines.push('🎯 Status Geral:');
        const statusIcon = analysis.status === 'ok' ? '✅' : analysis.status === 'warning' ? '⚠️' : '❌';
        lines.push(`   ${statusIcon} ${analysis.status.toUpperCase()}`);
        
        if (analysis.errors.length > 0) {
            lines.push('   ❌ Erros:');
            analysis.errors.forEach(error => lines.push(`     - ${error}`));
        }
        
        if (analysis.warnings.length > 0) {
            lines.push('   ⚠️ Avisos:');
            analysis.warnings.forEach(warning => lines.push(`     - ${warning}`));
        }
        
        if (analysis.recommendations.length > 0) {
            lines.push('');
            lines.push('💡 Recomendações:');
            analysis.recommendations.forEach(rec => lines.push(`   - ${rec}`));
        }
    } else {
        lines.push(`❌ ${config.error}`);
    }
    
    lines.push('');
    lines.push('🔧 Comandos úteis:');
    lines.push('   Sincronizar: ./scripts/url-configuration/sync-auth-urls.ps1');
    lines.push('   Verificar: ./scripts/verifications/verify-auth-config.ps1');
    lines.push('   Dashboard: http://localhost:54321');
    
    return lines.join('\n');
}

/**
 * Função principal
 */
async function main() {
    const options = {
        json: process.argv.includes('--json'),
        testUrls: process.argv.includes('--test-urls'),
        detailed: process.argv.includes('--detailed')
    };
    
    try {
        // Executar verificações
        const [supabaseStatus, authEndpoint, config] = await Promise.all([
            checkSupabaseStatus(),
            checkAuthEndpoint(),
            Promise.resolve(parseAuthConfig())
        ]);
        
        const analysis = analyzeConfig(config);
        
        let urlTests = null;
        if (options.testUrls && config.found && config.redirectUrls.length > 0) {
            urlTests = await testUrls(config.redirectUrls);
        }
        
        if (options.json) {
            // Output JSON
            const result = {
                timestamp: new Date().toISOString(),
                supabaseStatus,
                authEndpoint,
                config,
                analysis,
                urlTests
            };
            console.log(JSON.stringify(result, null, 2));
        } else {
            // Output texto
            const report = generateTextReport(supabaseStatus, authEndpoint, config, analysis, urlTests);
            console.log(report);
        }
        
        // Exit code baseado no status
        const exitCode = analysis.status === 'error' ? 1 : 0;
        process.exit(exitCode);
        
    } catch (error) {
        console.error('❌ Erro durante verificação:', error.message);
        process.exit(1);
    }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { checkSupabaseStatus, checkAuthEndpoint, parseAuthConfig, analyzeConfig, testUrls };
