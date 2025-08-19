import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Carrega variáveis de ambiente
dotenv.config()

// Configurações da produção (do .env)
const PROD_URL = process.env.PROD_SUPABASE_URL || 'https://uxbeaslwirkepnowydfu.supabase.co'
const PROD_SERVICE_KEY = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YmVhc2x3aXJrZXBub3d5ZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgxNDA1NSwiZXhwIjoyMDU3MzkwMDU1fQ.wTar7pt-A4wIZbiO2vfghTGUTKUK6hIKLonBybx4IVI'

// Configurações do local (do .env)
const LOCAL_URL = process.env.LOCAL_SUPABASE_URL || 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = process.env.LOCAL_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const prodClient = createClient(PROD_URL, PROD_SERVICE_KEY)
const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

// Tabelas principais para sincronizar
const TABLES_TO_SYNC = [
  'users',
  'sites', 
  'orders',
  'coupons',
  'contracts',
  'company_data',
  'admins',
  'form_entries',
  'user_stats',
  'order_notifications'
]

async function pullProductionData() {
  console.log('🔄 ===== PUXANDO DADOS DA PRODUÇÃO =====')
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`)
  console.log(`🎯 Objetivo: Sincronizar dados essenciais da produção`)
  console.log('')

  const results = {
    success: [],
    failed: [],
    totalRecords: 0
  }

  for (const table of TABLES_TO_SYNC) {
    try {
      console.log(`📊 Sincronizando tabela: ${table}`)
      
      // 1. Buscar dados da produção
      const { data: prodData, error: prodError } = await prodClient
        .from(table)
        .select('*')
        .limit(1000) // Limite para não sobrecarregar
      
      if (prodError) {
        console.log(`❌ Erro ao buscar ${table}:`, prodError.message)
        results.failed.push({ table, error: prodError.message, step: 'fetch' })
        continue
      }

      if (!prodData || prodData.length === 0) {
        console.log(`⚠️  Tabela ${table} está vazia na produção`)
        results.success.push({ table, records: 0, action: 'empty' })
        continue
      }

      console.log(`📝 Encontrados ${prodData.length} registros em ${table}`)

      // 2. Limpar tabela local primeiro
      const { error: deleteError } = await localClient
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
      if (deleteError) {
        console.log(`⚠️  Aviso ao limpar ${table}:`, deleteError.message)
      }

      // 3. Inserir dados no local em chunks
      const chunkSize = 100
      let insertedCount = 0

      for (let i = 0; i < prodData.length; i += chunkSize) {
        const chunk = prodData.slice(i, i + chunkSize)
        
        const { error: insertError } = await localClient
          .from(table)
          .insert(chunk)
        
        if (insertError) {
          console.log(`⚠️  Erro ao inserir chunk ${Math.floor(i/chunkSize) + 1} em ${table}:`, insertError.message)
          // Continuar com próximo chunk
        } else {
          insertedCount += chunk.length
        }
      }

      console.log(`✅ ${table}: ${insertedCount}/${prodData.length} registros sincronizados`)
      results.success.push({ table, records: insertedCount, total: prodData.length })
      results.totalRecords += insertedCount

    } catch (error) {
      console.log(`❌ Erro geral em ${table}:`, error.message)
      results.failed.push({ table, error: error.message, step: 'general' })
    }

    // Pausa entre tabelas
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log('')
  console.log('🎉 ===== SINCRONIZAÇÃO CONCLUÍDA =====')
  console.log(`✅ Tabelas sincronizadas: ${results.success.length}`)
  console.log(`❌ Tabelas com erro: ${results.failed.length}`)
  console.log(`📊 Total de registros: ${results.totalRecords}`)

  if (results.success.length > 0) {
    console.log('')
    console.log('📋 Resumo de sucessos:')
    results.success.forEach(({ table, records }) => {
      console.log(`   ✅ ${table}: ${records} registros`)
    })
  }

  if (results.failed.length > 0) {
    console.log('')
    console.log('⚠️  Resumo de erros:')
    results.failed.forEach(({ table, error, step }) => {
      console.log(`   ❌ ${table} (${step}): ${error}`)
    })
  }

  // Salvar relatório
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      totalTables: TABLES_TO_SYNC.length,
      successfulTables: results.success.length,
      failedTables: results.failed.length,
      totalRecords: results.totalRecords
    }
  }

  fs.writeFileSync('sync_report.json', JSON.stringify(report, null, 2))
  console.log('')
  console.log('📄 Relatório salvo em: sync_report.json')
  console.log('')
  console.log('🌐 Verifique os dados no Studio: http://127.0.0.1:54323')
}

// Executar
pullProductionData().catch(console.error)
