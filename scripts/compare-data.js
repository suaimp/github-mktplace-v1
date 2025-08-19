import { createClient } from '@supabase/supabase-js'

// Cliente para produção
const prodClient = createClient(
  'https://uxbeaslwirkepnowydfu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4YmVhc2x3aXJrZXBub3d5ZGZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTgxNDA1NSwiZXhwIjoyMDU3MzkwMDU1fQ.wTar7pt-A4wIZbiO2vfghTGUTKUK6hIKLonBybx4IVI'
)

// Cliente para local
const localClient = createClient(
  'http://localhost:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function compareTableCounts(tableName, schema = 'public') {
  try {
    // Contagem produção
    const { count: prodCount, error: prodError } = await prodClient
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (prodError) {
      console.error(`Erro ao contar ${tableName} na produção:`, prodError)
      return
    }

    // Contagem local
    const { count: localCount, error: localError } = await localClient
      .from(tableName)
      .select('*', { count: 'exact', head: true })

    if (localError) {
      console.error(`Erro ao contar ${tableName} no local:`, localError)
      return
    }

    const status = prodCount === localCount ? '✅' : '❌'
    console.log(`${status} ${tableName}: Produção=${prodCount} | Local=${localCount}`)
    
    if (prodCount !== localCount) {
      console.log(`   ⚠️  Diferença de ${Math.abs(prodCount - localCount)} registros`)
    }

  } catch (error) {
    console.error(`Erro ao comparar ${tableName}:`, error)
  }
}

async function compareAuthUsers() {
  try {
    // Para auth.users, precisamos usar query SQL direta
    const { data: prodData, error: prodError } = await prodClient.rpc('exec_sql', {
      sql: 'SELECT COUNT(*) as count FROM auth.users'
    })

    const { data: localData, error: localError } = await localClient.rpc('exec_sql', {
      sql: 'SELECT COUNT(*) as count FROM auth.users'
    })

    if (prodError || localError) {
      console.log('⚠️  auth.users: Não foi possível comparar (necessário acesso direto ao banco)')
      return
    }

    const prodCount = prodData?.[0]?.count || 0
    const localCount = localData?.[0]?.count || 0
    const status = prodCount === localCount ? '✅' : '❌'
    
    console.log(`${status} auth.users: Produção=${prodCount} | Local=${localCount}`)
    
  } catch (error) {
    console.log('⚠️  auth.users: Não foi possível comparar (necessário acesso direto ao banco)')
  }
}

async function compareStorageBuckets() {
  try {
    // Listar buckets produção
    const { data: prodBuckets, error: prodError } = await prodClient.storage.listBuckets()
    
    // Listar buckets local
    const { data: localBuckets, error: localError } = await localClient.storage.listBuckets()

    if (prodError || localError) {
      console.error('Erro ao listar buckets:', { prodError, localError })
      return
    }

    console.log('\n=== STORAGE BUCKETS ===')
    
    const prodBucketNames = new Set(prodBuckets.map(b => b.name))
    const localBucketNames = new Set(localBuckets.map(b => b.name))
    
    // Verificar buckets que existem em ambos
    for (const bucketName of prodBucketNames) {
      if (localBucketNames.has(bucketName)) {
        // Contar arquivos em cada bucket
        const { data: prodFiles } = await prodClient.storage.from(bucketName).list('', { limit: 1000 })
        const { data: localFiles } = await localClient.storage.from(bucketName).list('', { limit: 1000 })
        
        const prodCount = prodFiles?.length || 0
        const localCount = localFiles?.length || 0
        const status = prodCount === localCount ? '✅' : '❌'
        
        console.log(`${status} bucket ${bucketName}: Produção=${prodCount} | Local=${localCount} arquivos`)
      } else {
        console.log(`❌ bucket ${bucketName}: Existe na produção mas não no local`)
      }
    }
    
    // Verificar buckets que só existem no local
    for (const bucketName of localBucketNames) {
      if (!prodBucketNames.has(bucketName)) {
        console.log(`⚠️  bucket ${bucketName}: Existe no local mas não na produção`)
      }
    }
    
  } catch (error) {
    console.error('Erro ao comparar storage:', error)
  }
}

async function main() {
  console.log('=== COMPARAÇÃO PRODUÇÃO vs LOCAL ===\n')

  console.log('=== TABELAS PÚBLICAS ===')
  
  // Lista de tabelas principais para verificar
  const publicTables = [
    'admins',
    'orders',
    'order_items',
    'sites',
    'categories',
    'coupons',
    'payments',
    'user_profiles',
    'subscriptions',
    'notifications',
    'site_reviews',
    'contact_form',
    'user_favorites',
    'order_chat_messages',
    'cart_items'
  ]

  for (const table of publicTables) {
    await compareTableCounts(table)
  }

  console.log('\n=== AUTH SCHEMA ===')
  await compareAuthUsers()

  console.log('\n=== STORAGE ===')
  await compareStorageBuckets()

  console.log('\n=== RESUMO ===')
  console.log('✅ = Dados sincronizados')
  console.log('❌ = Diferenças encontradas')
  console.log('⚠️  = Não foi possível verificar')
}

main().catch(console.error)
