// Teste para verificar qual configuração está sendo usada
console.log('🔍 CONFIGURAÇÃO ATUAL DO SUPABASE:');
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Verificar se está apontando para local ou produção
if (import.meta.env.VITE_SUPABASE_URL?.includes('localhost')) {
  console.log('✅ Usando BANCO LOCAL (desenvolvimento)');
} else if (import.meta.env.VITE_SUPABASE_URL?.includes('supabase.co')) {
  console.log('⚠️ Usando BANCO PRODUÇÃO (atenção!)');
} else {
  console.log('❌ Configuração não identificada');
}

export {};
