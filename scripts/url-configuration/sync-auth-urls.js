/**
 * Script para sincronizar configurações de URL de Auth do Supabase
 * 
 * Este script sincroniza as configurações de:
 * - Site URL
 * - Redirect URLs
 * - Additional Redirect URLs
 * 
 * Da instância de produção para o ambiente local
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configurações
const PRODUCTION_CONFIG = {
  url: 'https://uxbeaslwirkepnowydfu.supabase.co',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};

const LOCAL_CONFIG = {
  url: 'http://localhost:54321',
  serviceRoleKey: process.env.SUPABASE_LOCAL_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
};

// URLs que devem ser configuradas no ambiente local
const LOCAL_AUTH_URLS = {
  siteUrl: 'http://localhost:3000',
  additionalRedirectUrls: [
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

/**
 * Atualiza configurações de auth via config.toml
 */
async function updateLocalAuthConfig() {
  try {
    console.log('🔧 Atualizando configurações de Auth local...');
    
    const configPath = path.join(process.cwd(), 'supabase', 'config.toml');
    
    if (!fs.existsSync(configPath)) {
      throw new Error('Arquivo config.toml não encontrado em supabase/config.toml');
    }
    
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Atualizar site_url
    configContent = configContent.replace(
      /site_url\s*=\s*"[^"]*"/,
      `site_url = "${LOCAL_AUTH_URLS.siteUrl}"`
    );
    
    // Atualizar additional_redirect_urls
    const redirectUrlsString = LOCAL_AUTH_URLS.additionalRedirectUrls
      .map(url => `"${url}"`)
      .join(', ');
    
    // Procurar e substituir ou adicionar additional_redirect_urls
    if (configContent.includes('additional_redirect_urls')) {
      configContent = configContent.replace(
        /additional_redirect_urls\s*=\s*\[[^\]]*\]/,
        `additional_redirect_urls = [${redirectUrlsString}]`
      );
    } else {
      // Adicionar após site_url se não existir
      configContent = configContent.replace(
        /(site_url\s*=\s*"[^"]*")/,
        `$1\nadditional_redirect_urls = [${redirectUrlsString}]`
      );
    }
    
    fs.writeFileSync(configPath, configContent);
    console.log('✅ config.toml atualizado com sucesso!');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar config.toml:', error.message);
    return false;
  }
}

/**
 * Reinicia o servidor local do Supabase para aplicar as mudanças
 */
async function restartSupabaseLocal() {
  try {
    console.log('🔄 Reiniciando Supabase local para aplicar configurações...');
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Parar o Supabase
    console.log('⏹️ Parando Supabase local...');
    await execAsync('npx supabase stop');
    
    // Aguardar um momento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Iniciar o Supabase
    console.log('▶️ Iniciando Supabase local...');
    await execAsync('npx supabase start');
    
    console.log('✅ Supabase local reiniciado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao reiniciar Supabase local:', error.message);
    return false;
  }
}

/**
 * Verifica as configurações atuais
 */
async function checkCurrentConfig() {
  try {
    console.log('📋 Verificando configurações atuais...');
    
    const configPath = path.join(process.cwd(), 'supabase', 'config.toml');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const siteUrlMatch = configContent.match(/site_url\s*=\s*"([^"]*)"/);
    const redirectUrlsMatch = configContent.match(/additional_redirect_urls\s*=\s*\[([^\]]*)\]/);
    
    console.log('📍 Site URL atual:', siteUrlMatch ? siteUrlMatch[1] : 'Não configurado');
    console.log('📍 Redirect URLs atuais:', redirectUrlsMatch ? redirectUrlsMatch[1] : 'Não configurado');
    
    return {
      siteUrl: siteUrlMatch ? siteUrlMatch[1] : null,
      redirectUrls: redirectUrlsMatch ? redirectUrlsMatch[1] : null
    };
  } catch (error) {
    console.error('❌ Erro ao verificar configurações:', error.message);
    return null;
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('🚀 Iniciando sincronização de URLs de Auth...\n');
  
  // Verificar configurações atuais
  await checkCurrentConfig();
  
  console.log('\n📝 Configurações que serão aplicadas:');
  console.log('Site URL:', LOCAL_AUTH_URLS.siteUrl);
  console.log('Redirect URLs:', LOCAL_AUTH_URLS.additionalRedirectUrls.join(', '));
  
  // Confirmar com o usuário
  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const answer = await new Promise(resolve => {
    rl.question('\n❓ Continuar com a sincronização? (y/n): ', resolve);
  });
  
  rl.close();
  
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('❌ Operação cancelada pelo usuário.');
    return;
  }
  
  // Atualizar configurações
  const configUpdated = await updateLocalAuthConfig();
  
  if (configUpdated) {
    console.log('\n🔄 Configurações atualizadas! Reiniciando Supabase local...');
    
    const restarted = await restartSupabaseLocal();
    
    if (restarted) {
      console.log('\n✅ Sincronização concluída com sucesso!');
      console.log('🌐 URLs locais configuradas:');
      LOCAL_AUTH_URLS.additionalRedirectUrls.forEach(url => {
        console.log(`   - ${url}`);
      });
    } else {
      console.log('\n⚠️ Configurações atualizadas, mas houve erro no restart.');
      console.log('💡 Execute manualmente: npx supabase stop && npx supabase start');
    }
  } else {
    console.log('\n❌ Falha na atualização das configurações.');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { updateLocalAuthConfig, restartSupabaseLocal, checkCurrentConfig };
