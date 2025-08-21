import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Configuração local
const LOCAL_URL = 'http://127.0.0.1:54321'
const LOCAL_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const localClient = createClient(LOCAL_URL, LOCAL_SERVICE_KEY)

async function applyData() {
  console.log('🔄 Aplicando dados da produção...')
  
  try {
    // Ler arquivo SQL
    const sqlContent = fs.readFileSync('./supabase/data_complete.sql', 'utf8')
    
    // Dividir em comandos separados (por linha que termina com ;)
    const commands = sqlContent
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('--') && !line.startsWith('SET ') && !line.startsWith('SELECT '))
      .join('\n')
      .split(';')
      .filter(cmd => cmd.trim())
    
    console.log(`📊 Encontrados ${commands.length} comandos SQL`)
    
    // Aplicar comandos
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim()
      if (command) {
        try {
          const { error } = await localClient.rpc('exec_sql', { sql: command })
          if (error) {
            console.log(`⚠️  Comando ${i+1}: ${error.message}`)
          } else {
            if (i % 50 === 0) console.log(`✅ Processados ${i+1}/${commands.length} comandos`)
          }
        } catch (err) {
          console.log(`⚠️  Erro no comando ${i+1}: ${err.message}`)
        }
      }
    }
    
    console.log('✅ Aplicação concluída!')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

applyData()
