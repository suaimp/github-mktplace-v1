# 🚀 PLANO DE DEPLOY - SISTEMA DE CHAT PARA PRODUÇÃO

## 📋 STATUS ATUAL
- **Local**: 14 migrações aplicadas
- **Produção**: 8 migrações aplicadas
- **Pendentes**: 6 migrações (17:10:00 até 18:00:00)

## 🔍 MIGRAÇÕES PENDENTES

### 1. `20250819171000` - Fix Order Chat Allow All Users
- **Tipo**: Correção de RLS
- **Risco**: 🟡 Baixo
- **Descrição**: Ajusta políticas RLS para permitir acesso adequado

### 2. `20250819172000` - Order Chat Participants System
- **Tipo**: Nova tabela + sistema
- **Risco**: 🟠 Médio
- **Descrição**: Cria tabela `order_chat_participants` e sistema de roles

### 3. `20250819173000` - Fix Order Chat Participants RLS
- **Tipo**: Correção de RLS
- **Risco**: 🟡 Baixo
- **Descrição**: Ajusta políticas da tabela de participantes

### 4. `20250819174000` - Prepare for Production Data
- **Tipo**: Preparação de dados
- **Risco**: 🟡 Baixo
- **Descrição**: Configura estrutura para dados de produção

### 5. `20250819175000` - Fix Admin Chat Permissions
- **Tipo**: Correção de permissões
- **Risco**: 🟡 Baixo
- **Descrição**: Corrige permissões de admin para chat

### 6. `20250819180000` - Create User Presence Table
- **Tipo**: Nova tabela
- **Risco**: 🟠 Médio
- **Descrição**: Cria tabela `user_presence` para status online/offline

## ⚠️ VALIDAÇÕES PRÉ-DEPLOY

### 1. Backup de Segurança
```bash
# Fazer backup completo antes do deploy
npx supabase db dump --linked > backup_pre_chat_deploy_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Verificar Dados Existentes
```bash
# Verificar se há dados que podem ser afetados
npx supabase sql --linked "SELECT COUNT(*) FROM orders WHERE created_at > NOW() - INTERVAL '7 days'"
```

### 3. Verificar Conectividade
```bash
# Testar conexão com produção
npx supabase status --linked
```

## 🎯 ESTRATÉGIA DE DEPLOY

### Opção 1: Deploy Gradual (RECOMENDADO)
```bash
# 1. Aplicar uma migração por vez
npx supabase migration up --linked --include-all=false

# 2. Testar cada etapa
npx supabase sql --linked "SELECT * FROM information_schema.tables WHERE table_name LIKE '%chat%'"

# 3. Validar RLS policies
npx supabase sql --linked "SELECT * FROM pg_policies WHERE tablename LIKE '%chat%'"
```

### Opção 2: Deploy Completo
```bash
# Aplicar todas as migrações de uma vez
npx supabase migration up --linked
```

## 🔧 COMANDOS DE EXECUÇÃO

### 1. Backup (OBRIGATÓRIO)
```bash
npx supabase db dump --linked --file=backup_chat_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Deploy das Migrações
```bash
npx supabase migration up --linked
```

### 3. Verificação Pós-Deploy
```bash
# Verificar tabelas criadas
npx supabase sql --linked "
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name IN ('order_chat', 'order_chat_participants', 'user_presence')
"

# Verificar políticas RLS
npx supabase sql --linked "
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('order_chat', 'order_chat_participants', 'user_presence')
"
```

## 🚨 ROLLBACK (Se necessário)

### Opção 1: Rollback via Migrations
```bash
# Reverter migrações específicas (se houver down migrations)
npx supabase migration down --linked
```

### Opção 2: Restaurar Backup
```bash
# Em caso de emergência, restaurar backup
# (CUIDADO: Vai perder dados criados após o backup)
psql -h [HOST] -U [USER] -d [DATABASE] < backup_chat_[timestamp].sql
```

## ✅ CHECKLIST DE DEPLOY

- [ ] ✅ Backup realizado
- [ ] ✅ Conexão com produção testada
- [ ] ✅ Equipe notificada sobre o deploy
- [ ] ✅ Janela de manutenção definida (se necessária)
- [ ] 🔄 Migrações aplicadas
- [ ] 🔄 Tabelas verificadas
- [ ] 🔄 Políticas RLS verificadas
- [ ] 🔄 Testes funcionais realizados
- [ ] 🔄 Sistema de chat funcionando
- [ ] 🔄 Avatars carregando corretamente
- [ ] 🔄 Presença de usuários funcionando

## 🎮 TESTES PÓS-DEPLOY

1. **Teste de Chat Básico**:
   - Criar uma conversa entre usuário e admin
   - Verificar se mensagens são salvas
   - Validar RLS (usuário só vê suas conversas)

2. **Teste de Avatars**:
   - Verificar se avatars carregam do storage
   - Testar fallback para iniciais
   - Validar cores consistentes

3. **Teste de Presença**:
   - Verificar status online/offline
   - Testar indicador de digitação
   - Validar timestamps

## 🎯 PRÓXIMOS PASSOS

Após o deploy bem-sucedido:
1. Monitorar logs por 24h
2. Coletar feedback dos usuários
3. Otimizar performance se necessário
4. Documentar lições aprendidas

---
**⚡ IMPORTANTE**: Execute sempre em horário de menor movimento e com a equipe disponível para suporte!
