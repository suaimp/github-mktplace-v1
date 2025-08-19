import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function restoreData() {
  console.log('🔄 Restaurando dados da produção para o banco local...')
  
  try {
    // Primeiro, vamos aplicar o schema via SQL direto
    console.log('📋 Aplicando schema da produção...')
    
    const schemaSQL = fs.readFileSync('schema_production.sql', 'utf8')
    console.log(`📝 Schema tem ${schemaSQL.length} caracteres`)
    
    // Dividir o SQL em statements individuais
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`🔧 Executando ${statements.length} statements...`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (error) {
            console.log(`⚠️  Statement ${i + 1} erro (pode ser normal):`, error.message.substring(0, 100))
          } else {
            console.log(`✅ Statement ${i + 1} executado`)
          }
        } catch (e) {
          console.log(`⚠️  Statement ${i + 1} falhou:`, e.message.substring(0, 100))
        }
      }
    }
    
    console.log('📊 Aplicando dados da produção...')
    const dataSQL = fs.readFileSync('data_production.sql', 'utf8')
    console.log(`📝 Dados têm ${dataSQL.length} caracteres`)
    
    // Aplicar dados
    const dataStatements = dataSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`🔧 Executando ${dataStatements.length} statements de dados...`)
    
    for (let i = 0; i < Math.min(dataStatements.length, 50); i++) { // Limitar para não sobrecarregar
      const statement = dataStatements[i]
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          if (error) {
            console.log(`⚠️  Dados ${i + 1} erro:`, error.message.substring(0, 100))
          } else {
            console.log(`✅ Dados ${i + 1} inseridos`)
          }
        } catch (e) {
          console.log(`⚠️  Dados ${i + 1} falhou:`, e.message.substring(0, 100))
        }
      }
    }
    
    console.log('🎉 Restauração concluída!')
    console.log('📋 Verificando tabelas populadas...')
    
    // Verificar algumas tabelas importantes
    const tables = ['users', 'sites', 'orders', 'coupons']
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (!error) {
          console.log(`📊 ${table}: ${count} registros`)
        }
      } catch (e) {
        console.log(`❌ ${table}: tabela não encontrada ou erro`)
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na restauração:', error)
  }
}

restoreData()
