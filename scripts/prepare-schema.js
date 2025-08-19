import fs from 'fs'

console.log('🔄 Preparando schema da produção...')

const schemaContent = fs.readFileSync('schema_production.sql', 'utf8')
console.log(`📊 Schema: ${(schemaContent.length / 1024).toFixed(2)} KB`)

// Dividir em statements
const statements = schemaContent
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 10 && !s.startsWith('--'))

console.log(`🔧 Total de statements: ${statements.length}`)

// Analisar tipos
const createTypes = statements.filter(s => s.toUpperCase().includes('CREATE TYPE')).length
const createTables = statements.filter(s => s.toUpperCase().includes('CREATE TABLE')).length
const createIndexes = statements.filter(s => s.toUpperCase().includes('CREATE INDEX')).length
const alters = statements.filter(s => s.toUpperCase().includes('ALTER TABLE')).length

console.log(`📋 Análise do schema:`)
console.log(`   - CREATE TYPE: ${createTypes}`)
console.log(`   - CREATE TABLE: ${createTables}`)
console.log(`   - CREATE INDEX: ${createIndexes}`)
console.log(`   - ALTER TABLE: ${alters}`)

// Ordenar statements por prioridade
const orderedStatements = []

// 1. Tipos primeiro
statements.filter(s => s.toUpperCase().includes('CREATE TYPE')).forEach(s => orderedStatements.push(s))

// 2. Tabelas
statements.filter(s => s.toUpperCase().includes('CREATE TABLE')).forEach(s => orderedStatements.push(s))

// 3. Índices
statements.filter(s => s.toUpperCase().includes('CREATE INDEX')).forEach(s => orderedStatements.push(s))

// 4. Alterações
statements.filter(s => s.toUpperCase().includes('ALTER TABLE')).forEach(s => orderedStatements.push(s))

// 5. Outros
statements.filter(s => 
  !s.toUpperCase().includes('CREATE TYPE') && 
  !s.toUpperCase().includes('CREATE TABLE') && 
  !s.toUpperCase().includes('CREATE INDEX') && 
  !s.toUpperCase().includes('ALTER TABLE')
).forEach(s => orderedStatements.push(s))

const cleanSchema = orderedStatements.join(';\n\n') + ';'

fs.writeFileSync('restore_schema_studio.sql', cleanSchema)

console.log('✅ Arquivo criado: restore_schema_studio.sql')
console.log('')
console.log('📋 ORDEM DE EXECUÇÃO NO STUDIO:')
console.log('1. 🗃️  Primeiro: restore_schema_studio.sql (cria tabelas)')
console.log('2. 📊 Depois: restore_data_studio.sql (insere dados)')
console.log('')
console.log('🌐 Abra o Studio: http://127.0.0.1:54323')
