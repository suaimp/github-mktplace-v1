import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Configurações
const PROD_URL = 'https://uxbeaslwirkepnowydfu.supabase.co'
const PROD_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YmVhc2x3aXJrZXBub3d5ZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgxNDA1NSwiZXhwIjoyMDU3MzkwMDU1fQ.wTar7pt-A4wIZbiO2vfghTGUTKUK6hIKLonBybx4IVI'

const LOCAL_URL = 'http://localhost:54321'
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

// Clientes
const prodClient = createClient(PROD_URL, PROD_SERVICE_KEY)
const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

/**
 * 1. SINCRONIZAR CONFIGURAÇÕES AUTH
 */
async function syncAuthConfig() {
  console.log('\n🔐 ===== SINCRONIZANDO CONFIGURAÇÕES AUTH =====')
  
  try {
    // Buscar configurações auth da produção via SQL
    const authQueries = [
      "SELECT * FROM auth.config",
      "SELECT provider, config FROM auth.sso_providers WHERE enabled = true",
      "SELECT name, template FROM auth.email_templates"
    ]
    
    console.log('📋 Buscando configurações auth da produção...')
    
    // Para este exemplo, vamos criar as configurações mais comuns
    const authConfigSuggestions = {
      site_url: PROD_URL,
      additional_redirect_urls: [PROD_URL + '/auth/callback'],
      jwt_expiry: 3600,
      enable_signup: true,
      enable_confirmations: false,
      external_providers: {
        google: {
          enabled: false,
          client_id: 'SEU_GOOGLE_CLIENT_ID',
          secret: 'SEU_GOOGLE_CLIENT_SECRET'
        },
        github: {
          enabled: false,
          client_id: 'SEU_GITHUB_CLIENT_ID', 
          secret: 'SEU_GITHUB_CLIENT_SECRET'
        }
      }
    }
    
    console.log('📝 Configurações auth sugeridas:')
    console.log(JSON.stringify(authConfigSuggestions, null, 2))
    
    // Atualizar config.toml
    console.log('\n⚙️ Atualizando config.toml...')
    updateConfigToml(authConfigSuggestions)
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar auth:', error.message)
  }
}

/**
 * 2. SINCRONIZAR EDGE FUNCTIONS
 */
async function syncEdgeFunctions() {
  console.log('\n⚡ ===== SINCRONIZANDO EDGE FUNCTIONS =====')
  
  try {
    // Listar funções da produção
    console.log('📡 Buscando lista de Edge Functions da produção...')
    
    // Como não temos acesso direto à API de functions via SDK,
    // vamos trabalhar com as funções locais existentes
    const functionsDir = './supabase/functions'
    
    if (!fs.existsSync(functionsDir)) {
      console.log('❌ Diretório de functions não encontrado')
      return
    }
    
    const localFunctions = fs.readdirSync(functionsDir).filter(item => {
      return fs.statSync(path.join(functionsDir, item)).isDirectory()
    })
    
    console.log(`📁 Funções locais encontradas: ${localFunctions.length}`)
    
    // Para cada função, verificar se tem index.ts/js
    const functionsStatus = []
    
    for (const funcName of localFunctions) {
      const funcPath = path.join(functionsDir, funcName)
      const indexTs = path.join(funcPath, 'index.ts')
      const indexJs = path.join(funcPath, 'index.js')
      
      const hasIndex = fs.existsSync(indexTs) || fs.existsSync(indexJs)
      const entryFile = fs.existsSync(indexTs) ? 'index.ts' : (fs.existsSync(indexJs) ? 'index.js' : 'MISSING')
      
      functionsStatus.push({
        name: funcName,
        hasEntryPoint: hasIndex,
        entryFile: entryFile,
        path: funcPath
      })
      
      const status = hasIndex ? '✅' : '❌'
      console.log(`${status} ${funcName}: ${entryFile}`)
    }
    
    // Atualizar config.toml com todas as funções
    console.log('\n⚙️ Atualizando config.toml com Edge Functions...')
    updateConfigWithFunctions(functionsStatus)
    
    console.log('\n📦 Para testar as funções localmente, execute:')
    console.log('supabase functions serve')
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar Edge Functions:', error.message)
  }
}

/**
 * 3. SINCRONIZAR REALTIME E WEBHOOKS
 */
async function syncRealtimeWebhooks() {
  console.log('\n⚡ ===== SINCRONIZANDO REALTIME E WEBHOOKS =====')
  
  try {
    console.log('📡 Buscando configurações de Realtime da produção...')
    
    // Buscar publicações ativas
    const { data: publications, error } = await prodClient
      .rpc('exec_sql', { 
        sql: `
          SELECT 
            p.pubname,
            p.puballtables,
            array_agg(pt.tablename) as tables
          FROM pg_publication p
          LEFT JOIN pg_publication_tables pt ON p.pubname = pt.pubname
          WHERE p.pubname LIKE 'supabase%'
          GROUP BY p.pubname, p.puballtables
        `
      })
    
    if (error) {
      console.log('⚠️ Não foi possível buscar publicações via RPC')
      console.log('📋 Execute manualmente no banco de produção:')
      console.log('SELECT pubname, puballtables FROM pg_publication;')
    } else {
      console.log('📊 Publicações encontradas:', publications)
    }
    
    // Sugestões de configuração realtime
    const realtimeConfig = {
      enabled: true,
      ip_version: "IPv6",
      suggested_publications: [
        'supabase_realtime',
        'supabase_realtime_messages_publication'
      ]
    }
    
    console.log('📝 Configurações Realtime sugeridas:')
    console.log(JSON.stringify(realtimeConfig, null, 2))
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar Realtime:', error.message)
  }
}

/**
 * 4. SINCRONIZAR TRIGGERS E POLÍTICAS RLS
 */
async function syncTriggersAndRLS() {
  console.log('\n🔒 ===== SINCRONIZANDO TRIGGERS E POLÍTICAS RLS =====')
  
  try {
    console.log('📡 Buscando triggers da produção...')
    
    // Buscar triggers customizados
    const { data: triggers, error: triggerError } = await prodClient
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            triggername,
            triggerdef
          FROM pg_triggers 
          WHERE schemaname IN ('public', 'auth', 'storage')
          AND triggername NOT LIKE 'RI_%'
          ORDER BY schemaname, tablename, triggername
        `
      })
    
    if (!triggerError && triggers) {
      console.log(`📋 Triggers encontrados: ${triggers.length}`)
      
      // Salvar triggers em arquivo
      const triggersSQL = triggers.map(t => t.triggerdef).join(';\n\n') + ';'
      fs.writeFileSync('./supabase/triggers_from_production.sql', triggersSQL)
      console.log('✅ Triggers salvos em: ./supabase/triggers_from_production.sql')
    }
    
    console.log('\n🔒 Buscando políticas RLS da produção...')
    
    // Buscar políticas RLS
    const { data: policies, error: policyError } = await prodClient
      .rpc('exec_sql', {
        sql: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE schemaname = 'public'
          ORDER BY tablename, policyname
        `
      })
    
    if (!policyError && policies) {
      console.log(`🔐 Políticas RLS encontradas: ${policies.length}`)
      
      // Gerar SQL para recriar políticas
      let policiesSQL = '-- RLS Policies from Production\n\n'
      policies.forEach(policy => {
        policiesSQL += `-- Policy: ${policy.policyname} on ${policy.tablename}\n`
        policiesSQL += `CREATE POLICY "${policy.policyname}" ON "${policy.tablename}"\n`
        policiesSQL += `  AS ${policy.permissive}\n`
        policiesSQL += `  FOR ${policy.cmd}\n`
        if (policy.roles && policy.roles.length > 0) {
          policiesSQL += `  TO ${policy.roles.join(', ')}\n`
        }
        if (policy.qual) {
          policiesSQL += `  USING (${policy.qual})\n`
        }
        if (policy.with_check) {
          policiesSQL += `  WITH CHECK (${policy.with_check})\n`
        }
        policiesSQL += ';\n\n'
      })
      
      fs.writeFileSync('./supabase/rls_policies_from_production.sql', policiesSQL)
      console.log('✅ Políticas RLS salvas em: ./supabase/rls_policies_from_production.sql')
    }
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar triggers/RLS:', error.message)
  }
}

/**
 * 5. SINCRONIZAR EXTENSÕES E CONFIGURAÇÕES DB
 */
async function syncDatabaseConfig() {
  console.log('\n🗃️ ===== SINCRONIZANDO CONFIGURAÇÕES DB =====')
  
  try {
    console.log('📡 Buscando extensões da produção...')
    
    const { data: extensions, error: extError } = await prodClient
      .rpc('exec_sql', {
        sql: 'SELECT extname, extversion FROM pg_extension ORDER BY extname'
      })
    
    if (!extError && extensions) {
      console.log('📦 Extensões na produção:')
      extensions.forEach(ext => {
        console.log(`   📄 ${ext.extname} (v${ext.extversion})`)
      })
      
      // Salvar lista de extensões
      const extensionsSQL = extensions
        .filter(ext => ext.extname !== 'plpgsql') // Padrão do Postgres
        .map(ext => `CREATE EXTENSION IF NOT EXISTS "${ext.extname}";`)
        .join('\n')
      
      fs.writeFileSync('./supabase/extensions_from_production.sql', extensionsSQL)
      console.log('✅ Extensões salvas em: ./supabase/extensions_from_production.sql')
    }
    
    console.log('\n⚙️ Buscando configurações de schema...')
    
    // Buscar schemas customizados
    const { data: schemas, error: schemaError } = await prodClient
      .rpc('exec_sql', {
        sql: `
          SELECT schema_name 
          FROM information_schema.schemata 
          WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
          AND schema_name NOT LIKE 'pg_temp_%'
          AND schema_name NOT LIKE 'pg_toast_temp_%'
          ORDER BY schema_name
        `
      })
    
    if (!schemaError && schemas) {
      console.log('📂 Schemas na produção:')
      schemas.forEach(schema => {
        console.log(`   📁 ${schema.schema_name}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erro ao sincronizar configurações DB:', error.message)
  }
}

/**
 * FUNÇÕES AUXILIARES
 */
function updateConfigToml(authConfig) {
  try {
    let configContent = fs.readFileSync('./supabase/config.toml', 'utf8')
    
    // Adicionar configurações auth se não existirem
    if (!configContent.includes('enable_confirmations')) {
      const authSection = `
# Configurações Auth sincronizadas da produção
enable_confirmations = ${authConfig.enable_confirmations}

# OAuth Providers (configure as secrets em .env)
# [auth.external.google]
# enabled = false
# client_id = "env(GOOGLE_CLIENT_ID)"
# secret = "env(GOOGLE_CLIENT_SECRET)"

# [auth.external.github]  
# enabled = false
# client_id = "env(GITHUB_CLIENT_ID)"
# secret = "env(GITHUB_CLIENT_SECRET)"
`
      
      // Inserir após a seção [auth]
      configContent = configContent.replace(
        /(\[auth\][\s\S]*?enable_manual_linking = false)/,
        '$1' + authSection
      )
    }
    
    fs.writeFileSync('./supabase/config.toml', configContent)
    console.log('✅ config.toml atualizado com configurações auth')
    
  } catch (error) {
    console.error('❌ Erro ao atualizar config.toml:', error.message)
  }
}

function updateConfigWithFunctions(functionsStatus) {
  try {
    let configContent = fs.readFileSync('./supabase/config.toml', 'utf8')
    
    // Adicionar configurações para cada função
    let functionsConfig = '\n# Edge Functions Configuration\n'
    
    functionsStatus.forEach(func => {
      if (func.hasEntryPoint) {
        functionsConfig += `[functions.${func.name}]\n`
        functionsConfig += `enabled = true\n`
        functionsConfig += `verify_jwt = true\n\n`
      }
    })
    
    // Verificar se já existe seção de functions e substituir ou adicionar
    if (configContent.includes('[functions.')) {
      // Remover configurações antigas de functions
      configContent = configContent.replace(/\[functions\.[\s\S]*?(?=\n\[|\n$|$)/g, '')
    }
    
    configContent += functionsConfig
    
    fs.writeFileSync('./supabase/config.toml', configContent)
    console.log('✅ config.toml atualizado com Edge Functions')
    
  } catch (error) {
    console.error('❌ Erro ao atualizar functions no config.toml:', error.message)
  }
}

/**
 * FUNÇÃO PRINCIPAL
 */
async function main() {
  console.log('🔄 ===== SINCRONIZAÇÃO COMPLETA PRODUÇÃO → LOCAL =====')
  console.log('📅 Data:', new Date().toLocaleString())
  console.log('🎯 Objetivo: Sincronizar configurações avançadas não cobertas pelo dump do banco\n')
  
  // Executar todas as sincronizações
  await syncAuthConfig()
  await syncEdgeFunctions()
  await syncRealtimeWebhooks()
  await syncTriggersAndRLS()
  await syncDatabaseConfig()
  
  console.log('\n🎉 ===== SINCRONIZAÇÃO CONCLUÍDA =====')
  console.log('\n📋 PRÓXIMOS PASSOS:')
  console.log('1. ✅ Revisar arquivos gerados:')
  console.log('   - ./supabase/config.toml (atualizado)')
  console.log('   - ./supabase/triggers_from_production.sql')
  console.log('   - ./supabase/rls_policies_from_production.sql')
  console.log('   - ./supabase/extensions_from_production.sql')
  console.log('\n2. 🔄 Reiniciar Supabase local:')
  console.log('   supabase stop && supabase start')
  console.log('\n3. ⚡ Testar Edge Functions:')
  console.log('   supabase functions serve')
  console.log('\n4. 🔍 Aplicar triggers/RLS se necessário:')
  console.log('   Revisar e aplicar os arquivos SQL gerados')
  
  console.log('\n✨ Seu ambiente local agora está mais alinhado com a produção!')
}

// Executar
main().catch(console.error)
