import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
const execAsync = promisify(exec);

async function applyProductionData() {
  try {
    console.log('🔄 Limpando dados existentes e aplicando dados de produção...');
    
    // Primeiro limpar dados existentes (exceto schema)
    const cleanCommand = `docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "
      DELETE FROM auth.users WHERE id != '00000000-0000-0000-0000-000000000000';
      TRUNCATE TABLE public.admin_users RESTART IDENTITY CASCADE;
      TRUNCATE TABLE public.products RESTART IDENTITY CASCADE;
      TRUNCATE TABLE public.categories RESTART IDENTITY CASCADE;
      TRUNCATE TABLE public.menu_items RESTART IDENTITY CASCADE;
      TRUNCATE TABLE public.site_config RESTART IDENTITY CASCADE;
      DELETE FROM storage.buckets WHERE id != 'logos' AND id != 'article_documents' AND id != 'avatars' AND id != 'brand_logos';
    "`;
    
    console.log('🧹 Limpando dados existentes...');
    await execAsync(cleanCommand);
    
    // Aplicar dados de produção
    const applyCommand = `docker exec -i supabase_db_github-mktplace-v1 psql -U postgres -d postgres < scripts/dados_producao_final.sql`;
    
    console.log('📥 Aplicando dados de produção...');
    const { stdout, stderr } = await execAsync(applyCommand);
    
    if (stderr && !stderr.includes('WARNING') && !stderr.includes('NOTICE') && !stderr.includes('already exists')) {
      console.error('❌ Erro ao aplicar dados:', stderr);
      return false;
    }
    
    console.log('✅ Dados de produção aplicados com sucesso!');
    if (stdout) console.log(stdout);
    
    return true;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

applyProductionData();
