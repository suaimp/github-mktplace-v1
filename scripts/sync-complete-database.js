import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// Configurações
const PROD_URL = process.env.VITE_SUPABASE_URL_PROD || 'https://uxbeaslwirkepnowydfu.supabase.co'
const PROD_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY_PROD || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YmVhc2x3aXJrZXBub3d5ZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgxNDA1NSwiZXhwIjoyMDU3MzkwMDU1fQ.wTar7pt-A4wIZbiO2vfghTGUTKUK6hIKLonBybx4IVI'

const LOCAL_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const prodClient = createClient(PROD_URL, PROD_SERVICE_KEY)
const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

async function syncCompleteDatabase() {
  console.log('🔄 ===== SINCRONIZAÇÃO COMPLETA DO BANCO =====')
  console.log('📋 Etapas:')
  console.log('   1. 🗃️  Buscar schema da produção')
  console.log('   2. 🔨 Criar tabelas no local')
  console.log('   3. 📊 Sincronizar dados')
  console.log('')

  try {
    // 1. Buscar informações do schema da produção
    console.log('🗃️  Buscando informações das tabelas da produção...')
    
    const { data: tables, error: tablesError } = await prodClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .not('table_name', 'in', '(auth.users,storage.buckets,storage.objects)')

    if (tablesError) {
      // Fallback: usar lista conhecida de tabelas
      console.log('⚠️  Usando lista conhecida de tabelas...')
      await syncKnownTables()
      return
    }

    const tableNames = tables?.map(t => t.table_name).filter(name => 
      !name.startsWith('auth_') && 
      !name.startsWith('storage_') &&
      !name.startsWith('realtime_') &&
      !name.startsWith('_')
    ) || []

    console.log(`📊 Encontradas ${tableNames.length} tabelas:`)
    tableNames.slice(0, 10).forEach(name => console.log(`   - ${name}`))
    if (tableNames.length > 10) {
      console.log(`   ... e mais ${tableNames.length - 10}`)
    }

    // 2. Sincronizar cada tabela
    const results = { success: 0, failed: 0, totalRecords: 0 }

    for (const tableName of tableNames.slice(0, 20)) { // Limitar a 20 tabelas principais
      try {
        console.log(`\n📋 Processando: ${tableName}`)
        
        // Buscar dados da produção
        const { data: prodData, error: prodError } = await prodClient
          .from(tableName)
          .select('*')
          .limit(500) // Limite por tabela

        if (prodError) {
          console.log(`   ❌ Erro ao buscar: ${prodError.message}`)
          results.failed++
          continue
        }

        if (!prodData || prodData.length === 0) {
          console.log(`   📝 Tabela vazia`)
          results.success++
          continue
        }

        console.log(`   📊 ${prodData.length} registros encontrados`)

        // Tentar limpar e inserir dados
        await localClient.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000')

        // Inserir em chunks menores
        const chunkSize = 50
        let inserted = 0

        for (let i = 0; i < prodData.length; i += chunkSize) {
          const chunk = prodData.slice(i, i + chunkSize)
          
          const { error: insertError } = await localClient
            .from(tableName)
            .insert(chunk)

          if (!insertError) {
            inserted += chunk.length
          }
        }

        console.log(`   ✅ ${inserted}/${prodData.length} registros sincronizados`)
        results.success++
        results.totalRecords += inserted

      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`)
        results.failed++
      }

      // Pausa entre tabelas
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    console.log('')
    console.log('🎉 ===== SINCRONIZAÇÃO CONCLUÍDA =====')
    console.log(`✅ Tabelas processadas: ${results.success}`)
    console.log(`❌ Tabelas com erro: ${results.failed}`)
    console.log(`📊 Total de registros: ${results.totalRecords}`)

  } catch (error) {
    console.error('❌ Erro geral na sincronização:', error.message)
    console.log('🔄 Tentando sincronização com tabelas conhecidas...')
    await syncKnownTables()
  }
}

async function syncKnownTables() {
  const knownTables = [
    'users', 'sites', 'orders', 'coupons', 'contracts', 'company_data',
    'admins', 'form_entries', 'user_stats', 'order_notifications',
    'best_selling_sites', 'cart_checkout_resume', 'admin_notifications'
  ]

  console.log(`🔄 Sincronizando ${knownTables.length} tabelas conhecidas...`)
  
  let successCount = 0
  let totalRecords = 0

  for (const table of knownTables) {
    try {
      console.log(`📋 ${table}...`)
      
      const { data, error } = await prodClient
        .from(table)
        .select('*')
        .limit(300)

      if (error) {
        console.log(`   ❌ ${error.message}`)
        continue
      }

      if (data && data.length > 0) {
        await localClient.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
        
        const { error: insertError } = await localClient
          .from(table)
          .insert(data)

        if (!insertError) {
          console.log(`   ✅ ${data.length} registros`)
          successCount++
          totalRecords += data.length
        } else {
          console.log(`   ⚠️  ${insertError.message}`)
        }
      } else {
        console.log(`   📝 Vazia`)
        successCount++
      }

    } catch (error) {
      console.log(`   ❌ ${error.message}`)
    }
  }

  console.log('')
  console.log(`✅ ${successCount}/${knownTables.length} tabelas sincronizadas`)
  console.log(`📊 ${totalRecords} registros totais`)
}

// Executar
syncCompleteDatabase().catch(error => {
  console.error('❌ Erro fatal:', error.message)
  process.exit(1)
})
