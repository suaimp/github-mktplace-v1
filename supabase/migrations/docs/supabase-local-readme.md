# Configuração Supabase Local

Este guia mostra como configurar e usar o Supabase apenas localmente para desenvolvimento.

## Pré-requisitos

1. **Docker Desktop**: Instale o Docker Desktop no Windows
   - Download: https://www.docker.com/products/docker-desktop/
   - Execute o instalador e reinicie o computador se necessário
   - Certifique-se de que o Docker Desktop está rodando

2. **Supabase CLI**: Já instalado via npm

## Configuração

### 1. Arquivos de Configuração

- `supabase/config.toml`: Configurações do Supabase local
- `.env.local`: Variáveis de ambiente para desenvolvimento local
- `.env`: Mantém as configurações de produção

### 2. Portas Locais

- API: `http://localhost:54321`
- Auth: `http://localhost:54322` 
- Storage: `http://localhost:54323`
- Edge Functions: `http://localhost:54324`
- Database: `postgresql://postgres:postgres@localhost:54322/postgres`

## Como usar

### Iniciar o Supabase local
```bash
npm run supabase:start
```

### Verificar status
```bash
npm run supabase:status
```

### Parar o Supabase local
```bash
npm run supabase:stop
```

### Reset do banco de dados
```bash
npm run supabase:reset
```

### Desenvolver com Supabase local
```bash
npm run dev:local
```

## Vantagens do desenvolvimento local

✅ **Sem conexão com internet**: Funciona offline
✅ **Dados isolados**: Banco de dados completamente separado da produção
✅ **Reset rápido**: Pode resetar o banco a qualquer momento
✅ **Desenvolvimento seguro**: Não afeta dados de produção
✅ **Edge Functions**: Testa suas funções localmente
✅ **Migrations**: Aplica e testa migrações localmente

## Arquivo .env.local

O arquivo `.env.local` contém as configurações para uso local:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
VITE_SUPABASE_FUNCTIONS_URL=http://localhost:54321/functions/v1
SUPABASE_LOCAL=true
```

## Como alternar entre local e produção

1. **Para desenvolvimento local**: Use o arquivo `.env.local`
2. **Para produção**: Use o arquivo `.env`

O Vite automaticamente prioriza o `.env.local` quando existe.

## Troubleshooting

### Docker não encontrado
```bash
# Certifique-se de que o Docker Desktop está rodando
docker --version
```

### Portas ocupadas
Se alguma porta estiver ocupada, você pode alterar no `config.toml`:

```toml
[api]
port = 54321  # Altere se necessário
```

### Reset completo
```bash
npm run supabase:stop
npm run supabase:start
```
