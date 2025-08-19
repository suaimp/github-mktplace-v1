import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

console.log('🔄 Preparando restauração dos dados da produção...')

// Ler o arquivo de backup
const backupFile = 'backup_dados_producao.sql'
const backupContent = fs.readFileSync(backupFile, 'utf8')

console.log(`📊 Arquivo: ${backupFile}`)
console.log(`📝 Tamanho: ${(backupContent.length / 1024 / 1024).toFixed(2)} MB`)

// Dividir o arquivo em chunks menores para análise
const statements = backupContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`🔧 Total de statements: ${statements.length}`)

// Analisar tipos de statements
const createTables = statements.filter(s => s.toUpperCase().includes('CREATE TABLE')).length
const inserts = statements.filter(s => s.toUpperCase().includes('INSERT INTO')).length
const other = statements.length - createTables - inserts

console.log(`📋 Análise do backup:`)
console.log(`   - CREATE TABLE: ${createTables}`)
console.log(`   - INSERT INTO: ${inserts}`)
console.log(`   - Outros: ${other}`)

// Criar arquivo limpo para o Studio
console.log('📝 Criando arquivo otimizado para o Studio...')

const cleanContent = statements
  .filter(s => s.length > 10) // Filtrar statements muito pequenos
  .join(';\n') + ';'

fs.writeFileSync('restore_data_studio.sql', cleanContent)

console.log('✅ Arquivo criado: restore_data_studio.sql')
console.log('📋 Próximos passos:')
console.log('1. Abra o Studio: http://127.0.0.1:54323')
console.log('2. Vá para SQL Editor')
console.log('3. Abra o arquivo: restore_data_studio.sql')
console.log('4. Cole o conteúdo e execute')
console.log('')
console.log('💡 O arquivo foi otimizado para execução no Studio!')
