import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'

const execAsync = promisify(exec)

// Configurações da produção
const PROD_HOST = 'db.uxbeaslwirkepnowydfu.supabase.co'
const PROD_DB = 'postgres'
const PROD_USER = 'postgres'
const PROD_PASSWORD = 'YourPasswordHere' // Você precisa adicionar a senha da produção

async function dumpProductionData() {
  console.log('🔄 ===== FAZENDO DUMP DOS DADOS DE PRODUÇÃO =====')
  console.log('📅 Data:', new Date().toLocaleString('pt-BR'))
  console.log('')

  try {
    // 1. Dump apenas dos dados das tabelas public e auth.users
    console.log('📊 Fazendo dump dos dados das tabelas principais...')
    
    const dumpCommand = `pg_dump -h ${PROD_HOST} -U ${PROD_USER} -d ${PROD_DB} ` +
      `--data-only ` +
      `--schema=public ` +
      `--exclude-table=storage.* ` +
      `--exclude-table=realtime.* ` +
      `--exclude-table=supabase_functions.* ` +
      `--no-owner --no-privileges`

    console.log('🔧 Executando pg_dump...')
    console.log(`Command: ${dumpCommand.replace(PROD_PASSWORD, '***')}`)

    // Definir senha como variável de ambiente
    const env = { ...process.env, PGPASSWORD: PROD_PASSWORD }
    
    const { stdout, stderr } = await execAsync(dumpCommand, { env, maxBuffer: 1024 * 1024 * 100 }) // 100MB buffer
    
    if (stderr && !stderr.includes('WARNING') && !stderr.includes('NOTICE')) {
      console.error('❌ Erro no pg_dump:', stderr)
      return false
    }

    // Salvar o resultado em arquivo
    const filename = `production_data_dump_${new Date().toISOString().slice(0, 10)}.sql`
    fs.writeFileSync(filename, stdout)
    
    console.log(`✅ Dump salvo em: ${filename}`)
    console.log(`📊 Tamanho: ${(stdout.length / 1024 / 1024).toFixed(2)} MB`)

    // 2. Dump separado para auth.users
    console.log('👥 Fazendo dump dos usuários (auth.users)...')
    
    const authDumpCommand = `pg_dump -h ${PROD_HOST} -U ${PROD_USER} -d ${PROD_DB} ` +
      `--data-only ` +
      `--schema=auth ` +
      `--table=auth.users ` +
      `--no-owner --no-privileges`

    const { stdout: authStdout, stderr: authStderr } = await execAsync(authDumpCommand, { env })
    
    if (authStderr && !authStderr.includes('WARNING') && !authStderr.includes('NOTICE')) {
      console.error('❌ Erro no dump de auth:', authStderr)
    } else {
      const authFilename = `production_auth_users_${new Date().toISOString().slice(0, 10)}.sql`
      fs.writeFileSync(authFilename, authStdout)
      console.log(`✅ Dump de usuários salvo em: ${authFilename}`)
    }

    console.log('')
    console.log('🎉 ===== DUMP CONCLUÍDO =====')
    console.log('📋 PRÓXIMOS PASSOS:')
    console.log('1. Aplique os dados no banco local:')
    console.log(`   docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres < ${filename}`)
    console.log(`   docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres < ${authFilename}`)
    console.log('2. Reinicie o Supabase local: supabase stop && supabase start')

    return true

  } catch (error) {
    console.error('❌ Erro durante o dump:', error.message)
    console.log('')
    console.log('💡 DICAS:')
    console.log('• Verifique se pg_dump está instalado')
    console.log('• Confirme as credenciais de conexão')
    console.log('• Verifique a conectividade com o banco de produção')
    return false
  }
}

// Executar
dumpProductionData()
