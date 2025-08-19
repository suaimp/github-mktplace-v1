import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

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

const buckets = ['logos', 'avatars', 'brand_logos', 'article_documents']

async function createBucketIfNotExists(client, bucketName, isPublic = false) {
  try {
    const { data: existingBuckets } = await client.storage.listBuckets()
    
    if (!existingBuckets.find(bucket => bucket.name === bucketName)) {
      console.log(`Criando bucket: ${bucketName}`)
      const { error } = await client.storage.createBucket(bucketName, { public: isPublic })
      if (error) {
        console.error(`Erro ao criar bucket ${bucketName}:`, error)
        return false
      }
    } else {
      console.log(`Bucket ${bucketName} já existe`)
    }
    return true
  } catch (error) {
    console.error(`Erro ao verificar/criar bucket ${bucketName}:`, error)
    return false
  }
}

async function syncBucket(bucketName, isPublic = false) {
  console.log(`\n=== Sincronizando bucket: ${bucketName} ===`)
  
  // Criar bucket local se não existir
  const bucketCreated = await createBucketIfNotExists(localClient, bucketName, isPublic)
  if (!bucketCreated) {
    console.error(`Falha ao criar bucket ${bucketName}`)
    return
  }

  try {
    // Listar arquivos do bucket de produção
    const { data: files, error: listError } = await prodClient.storage
      .from(bucketName)
      .list('', { limit: 1000 })

    if (listError) {
      console.error(`Erro ao listar arquivos do bucket ${bucketName}:`, listError)
      return
    }

    if (!files || files.length === 0) {
      console.log(`Bucket ${bucketName} está vazio`)
      return
    }

    console.log(`Encontrados ${files.length} arquivos no bucket ${bucketName}`)

    // Baixar e fazer upload de cada arquivo
    for (const file of files) {
      try {
        console.log(`Processando: ${file.name}`)
        
        // Baixar arquivo da produção
        const { data: fileData, error: downloadError } = await prodClient.storage
          .from(bucketName)
          .download(file.name)

        if (downloadError) {
          console.error(`Erro ao baixar ${file.name}:`, downloadError)
          continue
        }

        // Fazer upload para o ambiente local
        const { error: uploadError } = await localClient.storage
          .from(bucketName)
          .upload(file.name, fileData, {
            upsert: true,
            contentType: file.metadata?.mimetype || 'application/octet-stream'
          })

        if (uploadError) {
          console.error(`Erro ao fazer upload de ${file.name}:`, uploadError)
        } else {
          console.log(`✓ ${file.name} sincronizado`)
        }

      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error)
      }
    }

  } catch (error) {
    console.error(`Erro geral ao sincronizar bucket ${bucketName}:`, error)
  }
}

async function main() {
  console.log('Iniciando sincronização de buckets de Storage...\n')

  // Definir quais buckets são públicos
  const publicBuckets = ['logos', 'brand_logos']
  
  for (const bucketName of buckets) {
    const isPublic = publicBuckets.includes(bucketName)
    await syncBucket(bucketName, isPublic)
  }

  console.log('\n=== Sincronização concluída ===')
}

main().catch(console.error)
