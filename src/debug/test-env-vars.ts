console.log('🔍 Testando variáveis de ambiente do Vite:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing');
console.log('VITE_SUPABASE_FUNCTIONS_URL:', import.meta.env.VITE_SUPABASE_FUNCTIONS_URL);
console.log('NODE_ENV:', import.meta.env.NODE_ENV);
console.log('MODE:', import.meta.env.MODE);
console.log('Todas as variáveis:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

// Teste de conexão básica com o Supabase
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (url && key) {
  console.log('✅ Tentando criar cliente Supabase...');
  try {
    const supabase = createClient(url, key);
    console.log('✅ Cliente Supabase criado com sucesso!');
    
    // Teste básico de conexão
    supabase.from('users').select('count', { count: 'exact', head: true })
      .then(({   error, count }) => {
        if (error) {
          console.error('❌ Erro ao testar conexão:', error.message);
        } else {
          console.log('✅ Conexão com Supabase funcionando! Total de usuários:', count);
        }
      });
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error);
  }
} else {
  console.error('❌ Variáveis de ambiente não carregadas corretamente');
}
