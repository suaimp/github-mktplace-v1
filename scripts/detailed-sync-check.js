import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Cliente para produção
const prodClient = createClient(
  'https://uxbeaslwirkepnowydfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YmVhc2x3aXJrZXBub3d5ZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgxNDA1NSwiZXhwIjoyMDU3MzkwMDU1fQ.wTar7pt-A4wIZbiO2vfghTGUTKUK6hIKLonBybx4IVI'
)

// Cliente para local
const localClient = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function check1_StorageBucketsAndFiles() {
  console.log('\n🗄️ ===== 1. STORAGE (BUCKETS E ARQUIVOS) =====')
  
  try {
    // Verificar buckets
    const { data: prodBuckets } = await prodClient.storage.listBuckets()
    const { data: localBuckets } = await localClient.storage.listBuckets()
    
    console.log('\n📂 BUCKETS:')
    console.log(`Produção: ${prodBuckets?.length || 0} buckets`)
    console.log(`Local: ${localBuckets?.length || 0} buckets`)
    
    for (const bucket of prodBuckets || []) {
      const localBucket = localBuckets?.find(b => b.name === bucket.name)
      
      if (localBucket) {
        console.log(`✅ Bucket '${bucket.name}': existe em ambos`)
        console.log(`   📊 Prod: public=${bucket.public} | Local: public=${localBucket.public}`)
        
        // Verificar arquivos dentro do bucket
        const { data: prodFiles } = await prodClient.storage.from(bucket.name).list('', { limit: 1000 })
        const { data: localFiles } = await localClient.storage.from(bucket.name).list('', { limit: 1000 })
        
        console.log(`   📁 Arquivos: Prod=${prodFiles?.length || 0} | Local=${localFiles?.length || 0}`)
        
        // Verificar se cada arquivo existe e tem o mesmo tamanho
        for (const file of prodFiles || []) {
          const localFile = localFiles?.find(f => f.name === file.name)
          if (localFile) {
            const sizeMatch = file.metadata?.size === localFile.metadata?.size ? '✅' : '❌'
            console.log(`   ${sizeMatch} ${file.name}: ${file.metadata?.size || 0} bytes`)
          } else {
            console.log(`   ❌ ${file.name}: NÃO existe no local`)
          }
        }
      } else {
        console.log(`❌ Bucket '${bucket.name}': NÃO existe no local`)
      }
    }
    
    // Testar acesso real aos arquivos
    console.log('\n🔍 TESTE DE ACESSO A ARQUIVOS:')
    try {
      const { data: prodFile } = await prodClient.storage.from('logos').download('dark-logo-1741836573545.svg')
      const { data: localFile } = await localClient.storage.from('logos').download('dark-logo-1741836573545.svg')
      
      console.log(`✅ Acesso arquivo produção: ${prodFile ? 'OK' : 'FALHOU'}`)
      console.log(`✅ Acesso arquivo local: ${localFile ? 'OK' : 'FALHOU'}`)
    } catch (error) {
      console.log(`❌ Erro ao testar acesso: ${error.message}`)
    }
    
  } catch (error) {
    console.log(`❌ Erro na verificação de storage: ${error.message}`)
  }
}

async function check2_EdgeFunctions() {
  console.log('\n⚡ ===== 2. EDGE FUNCTIONS =====')
  
  // Listar funções locais (via arquivo)
  try {
    const functionsDir = './supabase/functions'
    const localFunctions = fs.readdirSync(functionsDir).filter(item => {
      return fs.statSync(path.join(functionsDir, item)).isDirectory()
    })
    
    console.log(`📁 Funções locais encontradas: ${localFunctions.length}`)
    localFunctions.forEach(func => {
      console.log(`   📄 ${func}`)
    })
    
    // Verificar se as funções estão no config.toml
    const configContent = fs.readFileSync('./supabase/config.toml', 'utf8')
    console.log('\n⚙️ Funções no config.toml:')
    const functionMatches = configContent.match(/\[functions\.([^\]]+)\]/g)
    if (functionMatches) {
      functionMatches.forEach(match => {
        const funcName = match.match(/\[functions\.([^\]]+)\]/)[1]
        console.log(`   ⚙️ ${funcName}`)
      })
    }
    
  } catch (error) {
    console.log(`❌ Erro ao verificar functions: ${error.message}`)
  }
}

async function check3_AuthConfigurations() {
  console.log('\n🔐 ===== 3. CONFIGURAÇÕES DO AUTH =====')
  
  try {
    // Verificar config.toml para configurações de auth
    const configContent = fs.readFileSync('./supabase/config.toml', 'utf8')
    
    console.log('\n📋 Configurações Auth no config.toml:')
    
    // Verificar configurações básicas
    const authEnabled = configContent.includes('[auth]') ? '✅' : '❌'
    console.log(`${authEnabled} Auth habilitado`)
    
    const siteUrl = configContent.match(/site_url\s*=\s*"([^"]+)"/)?.[1]
    console.log(`📍 Site URL: ${siteUrl || 'NÃO DEFINIDO'}`)
    
    const jwtExpiry = configContent.match(/jwt_expiry\s*=\s*(\d+)/)?.[1]
    console.log(`⏰ JWT Expiry: ${jwtExpiry || 'NÃO DEFINIDO'} seconds`)
    
    const enableSignup = configContent.includes('enable_signup = true') ? '✅' : '❌'
    console.log(`${enableSignup} Signup habilitado`)
    
    // Verificar provedores externos
    console.log('\n🔗 Provedores OAuth:')
    const oauthProviders = ['google', 'github', 'facebook', 'twitter', 'discord']
    oauthProviders.forEach(provider => {
      const hasProvider = configContent.includes(`[auth.external.${provider}]`) ? '✅' : '❌'
      console.log(`${hasProvider} ${provider}`)
    })
    
    // Verificar .env para secrets
    try {
      const envContent = fs.readFileSync('./.env.local', 'utf8')
      console.log('\n🔑 Variáveis de ambiente:')
      const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL') ? '✅' : '❌'
      console.log(`${hasSupabaseUrl} SUPABASE_URL`)
      const hasAnonKey = envContent.includes('VITE_SUPABASE_ANON_KEY') ? '✅' : '❌'
      console.log(`${hasAnonKey} SUPABASE_ANON_KEY`)
    } catch (error) {
      console.log('❌ Arquivo .env.local não encontrado')
    }
    
  } catch (error) {
    console.log(`❌ Erro ao verificar configurações auth: ${error.message}`)
  }
}

async function check4_RealtimeWebhooksExtensions() {
  console.log('\n⚡ ===== 4. REALTIME, WEBHOOKS, EXTENSÕES =====')
  
  // Esta verificação precisa ser feita via SQL direto no banco
  console.log('\n🔍 Verificação necessária via SQL direto no banco:')
  console.log('Execute manualmente:')
  console.log('docker exec supabase_db_github-mktplace-v1 psql -U postgres -c "SELECT extname FROM pg_extension;"')
  console.log('docker exec supabase_db_github-mktplace-v1 psql -U postgres -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname = \'realtime\';"')
  console.log('docker exec supabase_db_github-mktplace-v1 psql -U postgres -c "SELECT * FROM pg_publication;"')
}

async function check5_MigrationHistory() {
  console.log('\n📋 ===== 5. HISTÓRICO DE MIGRAÇÕES =====')
  
  try {
    // Verificar arquivos de migração locais
    const migrationsDir = './supabase/migrations'
    const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.sql'))
    
    console.log(`📁 Arquivos de migração locais: ${migrationFiles.length}`)
    migrationFiles.forEach(file => {
      console.log(`   📄 ${file}`)
    })
    
    console.log('\n🔍 Verificação da tabela supabase_migrations necessária via SQL:')
    console.log('Execute manualmente:')
    console.log('docker exec supabase_db_github-mktplace-v1 psql -U postgres -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;"')
    
  } catch (error) {
    console.log(`❌ Erro ao verificar migrações: ${error.message}`)
  }
}

async function check6_AdditionalSchemas() {
  console.log('\n🗃️ ===== 6. SCHEMAS ADICIONAIS =====')
  
  console.log('\n🔍 Verificação necessária via SQL direto:')
  console.log('Execute manualmente:')
  console.log('docker exec supabase_db_github-mktplace-v1 psql -U postgres -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN (\'information_schema\', \'pg_catalog\', \'pg_toast\') ORDER BY schema_name;"')
  
  // Verificar se temos dados nas tabelas principais de cada schema
  console.log('\n📊 Contagem rápida por schema:')
  try {
    // Storage
    const { data: buckets } = await localClient.storage.listBuckets()
    console.log(`✅ storage: ${buckets?.length || 0} buckets`)
    
    // Public (já verificado anteriormente, mas resumo)
    const { count: ordersCount } = await localClient.from('orders').select('*', { count: 'exact', head: true })
    console.log(`✅ public: ${ordersCount || 0} orders (exemplo)`)
    
  } catch (error) {
    console.log(`❌ Erro ao verificar schemas: ${error.message}`)
  }
}

async function main() {
  console.log('🔍 ===== VERIFICAÇÃO DETALHADA DE SINCRONIZAÇÃO =====')
  console.log('Baseado na lista de 6 itens críticos do Supabase\n')
  
  await check1_StorageBucketsAndFiles()
  await check2_EdgeFunctions()
  await check3_AuthConfigurations()
  await check4_RealtimeWebhooksExtensions()
  await check5_MigrationHistory()
  await check6_AdditionalSchemas()
  
  console.log('\n🎯 ===== RESUMO FINAL =====')
  console.log('✅ = Sincronizado corretamente')
  console.log('❌ = Problema encontrado')
  console.log('🔍 = Verificação manual necessária')
}

main().catch(console.error)
