import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Carrega variáveis de ambiente
dotenv.config()

// Configurações (usando service role key para ter acesso total)
const PROD_URL = process.env.PROD_SUPABASE_URL || 'https://uxbeaslwirkepnowydfu.supabase.co'
const PROD_SERVICE_KEY = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YmVhc2x3aXJrZXBub3d5ZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgxNDA1NSwiZXhwIjoyMDU3MzkwMDU1fQ.wTar7pt-A4wIZbiO2vfghTGUTKUK6hIKLonBybx4IVI'

const LOCAL_URL = process.env.LOCAL_SUPABASE_URL || 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = process.env.LOCAL_SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const prodSupabase = createClient(PROD_URL, PROD_SERVICE_KEY)
const localSupabase = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

// Tabelas para sincronizar (principais)
const TABLES_TO_SYNC = [
  'users',
  'sites', 
  'orders',
  'coupons',
  'admins',
  'contracts',
  'order_items',
  'user_stats',
  'best_selling_sites',
  'company_data',
  'user_favorites'
]

async function pullProductionData() {
  console.log('🚀 ===== PUXANDO DADOS DA PRODUÇÃO =====')
  console.log(`📅 Data: ${new Date().toLocaleString('pt-BR')}`)
  console.log('')

  let totalRecords = 0
  let successTables = 0
  let errorTables = 0

  for (const tableName of TABLES_TO_SYNC) {
    try {
      console.log(`📊 Processando tabela: ${tableName}`)
      
      // 1. Buscar dados da produção
      console.log(`  🔍 Buscando dados da produção...`)
      const { data: prodData, error: prodError } = await prodSupabase
        .from(tableName)
        .select('*')
        .limit(1000) // Limitar para não sobrecarregar
      
      if (prodError) {
        console.log(`  ❌ Erro ao buscar dados: ${prodError.message}`)
        errorTables++
        continue
      }

      if (!prodData || prodData.length === 0) {
        console.log(`  ⚠️  Tabela vazia ou não encontrada`)
        continue
      }

      console.log(`  📝 Encontrados ${prodData.length} registros`)

      // 2. Limpar tabela local
      console.log(`  🧹 Limpando tabela local...`)
      const { error: deleteError } = await localSupabase
        .from(tableName)
        .delete()
        .gte('id', 0) // Delete all records

      if (deleteError && !deleteError.message.includes('does not exist')) {
        console.log(`  ⚠️  Erro ao limpar: ${deleteError.message}`)
      }

      // 3. Inserir dados na tabela local
      console.log(`  📥 Inserindo dados no banco local...`)
      
      // Inserir em batches de 100 registros
      const batchSize = 100
      let insertedCount = 0
      
      for (let i = 0; i < prodData.length; i += batchSize) {
        const batch = prodData.slice(i, i + batchSize)
        
        const { error: insertError } = await localSupabase
          .from(tableName)
          .insert(batch)
        
        if (insertError) {
          console.log(`  ⚠️  Erro no batch ${Math.floor(i/batchSize) + 1}: ${insertError.message}`)
        } else {
          insertedCount += batch.length
        }
      }

      console.log(`  ✅ ${insertedCount}/${prodData.length} registros inseridos`)
      totalRecords += insertedCount
      successTables++

    } catch (error) {
      console.log(`  ❌ Erro geral na tabela ${tableName}:`, error.message)
      errorTables++
    }
    
    console.log('')
  }

  // 4. Verificar resultados
  console.log('🎉 ===== SINCRONIZAÇÃO CONCLUÍDA =====')
  console.log(`✅ Tabelas sincronizadas: ${successTables}`)
  console.log(`❌ Tabelas com erro: ${errorTables}`)
  console.log(`📊 Total de registros: ${totalRecords}`)
  console.log('')

  // 5. Verificar tabelas populadas
  console.log('📋 Verificando contagens finais:')
  for (const tableName of TABLES_TO_SYNC) {
    try {
      const { count, error } = await localSupabase
        .from(tableName)
        .select('*', { count: 'exact', head: true })
      
      if (!error) {
        console.log(`  📊 ${tableName}: ${count} registros`)
      }
    } catch (e) {
      console.log(`  ❌ ${tableName}: erro ao verificar`)
    }
  }

  console.log('')
  console.log('🎯 Próximos passos:')
  console.log('1. Verifique o Studio: http://127.0.0.1:54323')
  console.log('2. Teste seu frontend: http://localhost:5173')
  console.log('3. As tabelas agora têm dados da produção!')
}

// Executar
pullProductionData().catch(console.error)
