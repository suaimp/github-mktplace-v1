#!/usr/bin/env node
import fs from 'fs'

console.log('🔄 Dividindo arquivo SQL em partes menores...')

const sqlContent = fs.readFileSync('./supabase/data_complete.sql', 'utf8')

// Extrair apenas dados de auth.users
const userDataMatch = sqlContent.match(/--.*auth\.users.*\n(.*?)(?=--|\nSET)/gs)
if (userDataMatch) {
  const userData = `SET session_replication_role = replica;\n\n${userDataMatch[0]}\n\nSET session_replication_role = DEFAULT;`
  fs.writeFileSync('./supabase/users_only.sql', userData)
  console.log('✅ Arquivo users_only.sql criado')
}

// Extrair dados das tabelas principais (public schema)
const publicDataMatch = sqlContent.match(/--.*public\..*\n.*?INSERT INTO "public"\.".*?;/gs)
if (publicDataMatch) {
  const publicData = `SET session_replication_role = replica;\n\n${publicDataMatch.join('\n\n')}\n\nSET session_replication_role = DEFAULT;`
  fs.writeFileSync('./supabase/public_data.sql', publicData)
  console.log('✅ Arquivo public_data.sql criado')
}

console.log('📊 Arquivos divididos. Você pode executar cada um separadamente no Studio:')
console.log('1. Execute users_only.sql primeiro')
console.log('2. Execute public_data.sql depois')
console.log('🌐 Studio: http://127.0.0.1:54323')
