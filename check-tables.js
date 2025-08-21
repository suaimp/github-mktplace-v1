import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Configurações da produção
const PROD_URL = process.env.PROD_SUPABASE_URL || 'https://uxbeaslwirkepnowydfu.supabase.co'
const PROD_SERVICE_KEY = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YmVhc2x3aXJrZXBub3d5ZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgxNDA1NSwiZXhwIjoyMDU3MzkwMDU1fQ.wTar7pt-A4wIZbiO2vfghTGUTKUK6hIKLonBybx4IVI'

const prodClient = createClient(PROD_URL, PROD_SERVICE_KEY)

async function checkProductionTables() {
  console.log('🔍 ===== VERIFICANDO TABELAS NA PRODUÇÃO =====')
  
  try {
    // Verificar quais tabelas existem no schema public
    const { data, error } = await prodClient.rpc('get_table_list', {})
    
    if (error) {
      // Método alternativo usando SQL direto
      console.log('📋 Listando tabelas via SQL...')
      
      const queries = [
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
        `SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
      ]
      
      for (const query of queries) {
        try {
          const result = await prodClient.rpc('execute_sql', { sql: query })
          if (result.data) {
            console.log('✅ Tabelas encontradas:', result.data)
            return
          }
        } catch (err) {
          console.log('⚠️ Query falhou:', query)
        }
      }
      
      // Método manual - testar tabelas conhecidas
      console.log('🧪 Testando tabelas conhecidas...')
      const knownTables = [
        'users', 'sites', 'orders', 'coupons', 'contracts', 
        'company_data', 'admins', 'form_entries', 'user_stats', 
        'order_notifications', 'order_chat', 'order_chat_participants',
        'user_presence', 'notification_types', 'best_selling_sites',
        'cart_checkout_resume', 'admin_notifications'
      ]
      
      const existingTables = []
      
      for (const table of knownTables) {
        try {
          const { data, error } = await prodClient
            .from(table)
            .select('*')
            .limit(1)
          
          if (!error) {
            existingTables.push(table)
            console.log(`✅ ${table} - existe`)
          } else {
            console.log(`❌ ${table} - ${error.message}`)
          }
        } catch (err) {
          console.log(`❌ ${table} - erro: ${err.message}`)
        }
      }
      
      console.log('')
      console.log('📊 RESUMO - TABELAS EXISTENTES:')
      existingTables.forEach(table => console.log(`  ✅ ${table}`))
      
      return existingTables
      
    } else {
      console.log('✅ Tabelas encontradas:', data)
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error.message)
  }
}

checkProductionTables()
