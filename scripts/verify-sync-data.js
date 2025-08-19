import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);

async function verifyData() {
  try {
    console.log('🔍 Verificando dados sincronizados...\n');
    
    const queries = [
      { name: 'Produtos', query: 'SELECT COUNT(*) as total FROM public.products' },
      { name: 'Categorias', query: 'SELECT COUNT(*) as total FROM public.categories' },
      { name: 'Usuários Admin', query: 'SELECT COUNT(*) as total FROM public.admin_users' },
      { name: 'Usuários Auth', query: 'SELECT COUNT(*) as total FROM auth.users' },
      { name: 'Itens Menu', query: 'SELECT COUNT(*) as total FROM public.menu_items' },
      { name: 'Configurações Site', query: 'SELECT COUNT(*) as total FROM public.site_config' },
      { name: 'Storage Buckets', query: 'SELECT id, created_at FROM storage.buckets ORDER BY created_at' }
    ];
    
    for (const { name, query } of queries) {
      try {
        const command = `docker exec supabase_db_github-mktplace-v1 psql -U postgres -d postgres -c "${query}"`;
        const { stdout } = await execAsync(command);
        console.log(`📊 ${name}:`);
        console.log(stdout);
        console.log('---');
      } catch (error) {
        console.log(`❌ Erro ao verificar ${name}: ${error.message}`);
      }
    }
    
    console.log('✅ Verificação completa!');
    console.log('\n🌐 Acesse o Supabase Studio em: http://127.0.0.1:54323');
    
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

verifyData();
