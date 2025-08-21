/**
 * Sync Auth URLs - Simples e Funcional
 * Sincroniza configurações de Auth do Supabase remoto para local
 */

import fs from 'fs';
import readline from 'readline';

const CONFIG_PATH = 'supabase/config.toml';
const BACKUP_PATH = 'supabase/config.toml.backup';

// URLs que devem estar no ambiente local
const LOCAL_AUTH_URLS = [
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

// Função para fazer backup
function createBackup() {
    if (fs.existsSync(CONFIG_PATH)) {
        fs.copyFileSync(CONFIG_PATH, BACKUP_PATH);
        console.log('📋 Backup criado:', BACKUP_PATH);
        return true;
    }
    return false;
}

// Função para atualizar config.toml
function updateConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.log('❌ Arquivo config.toml não encontrado!');
        return false;
    }
    
    try {
        let content = fs.readFileSync(CONFIG_PATH, 'utf8');
        
        // Atualizar site_url
        const siteUrl = 'http://localhost:3000';
        content = content.replace(
            /site_url\s*=\s*["'][^"']*["']/,
            `site_url = "${siteUrl}"`
        );
        
        // Preparar array de URLs
        const urlsArray = LOCAL_AUTH_URLS.map(url => `"${url}"`).join(', ');
        
        // Atualizar additional_redirect_urls
        if (content.includes('additional_redirect_urls')) {
            content = content.replace(
                /additional_redirect_urls\s*=\s*\[[^\]]*\]/,
                `additional_redirect_urls = [${urlsArray}]`
            );
        } else {
            // Adicionar após site_url se não existir
            content = content.replace(
                /(site_url\s*=\s*["'][^"']*["'])/,
                `$1\nadditional_redirect_urls = [${urlsArray}]`
            );
        }
        
        // Salvar arquivo
        fs.writeFileSync(CONFIG_PATH, content, 'utf8');
        console.log('✅ Configurações atualizadas no config.toml!');
        return true;
    } catch (error) {
        console.log('❌ Erro ao atualizar config.toml:', error.message);
        return false;
    }
}

// Função para reiniciar Supabase
async function restartSupabase() {
    console.log('🔄 Reiniciando Supabase local...');
    
    try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        console.log('⏹️ Parando Supabase...');
        await execAsync('npx supabase stop');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('▶️ Iniciando Supabase...');
        await execAsync('npx supabase start');
        
        console.log('✅ Supabase reiniciado com sucesso!');
        return true;
    } catch (error) {
        console.log('❌ Erro ao reiniciar Supabase:', error.message);
        console.log('💡 Execute manualmente: npx supabase stop && npx supabase start');
        return false;
    }
}

// Função para confirmar com usuário
function askConfirmation(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        });
    });
}

// Função principal
async function main() {
    console.log('🚀 Sincronização de URLs de Auth - Supabase Local');
    console.log('=================================================');
    
    // Mostrar configurações que serão aplicadas
    console.log('\n📝 Configurações que serão aplicadas:');
    console.log('Site URL: http://localhost:3000');
    console.log('Redirect URLs:');
    LOCAL_AUTH_URLS.forEach(url => {
        console.log(`  - ${url}`);
    });
    
    // Confirmar com usuário
    const confirmed = await askConfirmation('\n❓ Continuar com a sincronização? (y/n): ');
    
    if (!confirmed) {
        console.log('❌ Operação cancelada pelo usuário.');
        return;
    }
    
    // Criar backup
    console.log('\n📋 Criando backup...');
    createBackup();
    
    // Atualizar configurações
    console.log('🔧 Atualizando configurações...');
    const configUpdated = updateConfig();
    
    if (configUpdated) {
        // Reiniciar Supabase
        const restarted = await restartSupabase();
        
        if (restarted) {
            console.log('\n✅ Sincronização concluída com sucesso!');
            console.log('🌐 URLs locais configuradas:');
            LOCAL_AUTH_URLS.forEach(url => {
                console.log(`   - ${url}`);
            });
            console.log('\n🔗 Acesse: http://localhost:54321');
            console.log('📋 Verificar: node scripts/verifications/check-auth-simple.js');
        } else {
            console.log('\n⚠️ Configurações atualizadas, mas houve problema no restart.');
        }
    } else {
        console.log('\n❌ Falha na atualização das configurações.');
        
        // Restaurar backup se disponível
        if (fs.existsSync(BACKUP_PATH)) {
            fs.copyFileSync(BACKUP_PATH, CONFIG_PATH);
            console.log('🔄 Backup restaurado.');
        }
    }
}

main().catch(console.error);
