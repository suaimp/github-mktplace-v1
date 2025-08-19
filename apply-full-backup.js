import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Configuração local
const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

async function applyFullBackup() {
  console.log('🔄 Aplicando backup completo da produção...')
  
  try {
    // Ler o arquivo de backup completo
    const backupContent = fs.readFileSync('backup_completo_full.sql', 'utf8')
    console.log(`📊 Backup tem ${backupContent.length} caracteres`)
    
    // Dividir em statements
    const statements = backupContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`🔧 Total de ${statements.length} statements para executar`)
    
    let successCount = 0
    let errorCount = 0
    
    // Executar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // Pular comentários e statements vazios
      if (statement.startsWith('--') || statement.length < 10) {
        continue
      }
      
      try {
        console.log(`📝 Executando statement ${i + 1}/${statements.length}`)
        
        // Usar RPC para executar SQL diretamente
        const { data, error } = await localClient.rpc('exec_sql', {
          sql: statement + ';'
        })
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} erro: ${error.message}`)
          errorCount++
        } else {
          successCount++
        }
        
      } catch (err) {
        console.log(`❌ Statement ${i + 1} falhou: ${err.message}`)
        errorCount++
      }
      
      // Pausa pequena para não sobrecarregar
      if (i % 50 === 0) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
    
    console.log('\n🎉 Aplicação do backup concluída!')
    console.log(`✅ Sucessos: ${successCount}`)
    console.log(`❌ Erros: ${errorCount}`)
    
    // Verificar tabelas criadas
    console.log('\n📋 Verificando tabelas criadas...')
    const { data: tables, error } = await localClient
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tables) {
      console.log(`📊 ${tables.length} tabelas encontradas:`)
      tables.forEach(table => console.log(`  - ${table.table_name}`))
    }
    
  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

applyFullBackup().catch(console.error)
