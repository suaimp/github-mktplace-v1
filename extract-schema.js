import fs from 'fs'

console.log('🔧 Extraindo CREATE TABLE statements do backup...')

// Ler arquivo de backup completo
const backupContent = fs.readFileSync('backup_completo_full.sql', 'utf8')

// Extrair apenas statements CREATE TABLE
const createTableStatements = []
const lines = backupContent.split('\n')

let isInCreateTable = false
let currentCreateTable = ''

for (const line of lines) {
  if (line.startsWith('CREATE TABLE')) {
    isInCreateTable = true
    currentCreateTable = line
  } else if (isInCreateTable) {
    currentCreateTable += '\n' + line
    if (line.trim().endsWith(');') && !line.includes('CREATE')) {
      createTableStatements.push(currentCreateTable)
      isInCreateTable = false
      currentCreateTable = ''
    }
  }
}

console.log(`📊 Encontrados ${createTableStatements.length} CREATE TABLE statements`)

// Salvar em arquivo separado
const schemaOnly = createTableStatements.join('\n\n')
fs.writeFileSync('01_schema_types.sql', schemaOnly)

console.log('✅ Schema salvo em: 01_schema_types.sql')
console.log('\n📋 Para aplicar:')
console.log('1. Abra http://127.0.0.1:54323')
console.log('2. Vá em SQL Editor')
console.log('3. Cole o conteúdo do arquivo 01_schema_types.sql')
console.log('4. Execute o SQL')
