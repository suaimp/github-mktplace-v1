# ================================
# CONFIGURAÇÃO 100% COMPATÍVEL
# ================================

# Este arquivo contém comandos para ter 100% compatibilidade
# entre ambiente local e produção (auth + public)

# ================================
# MÉTODO 1: Carregar dados via SQL
# ================================

# 1. Reset básico
supabase db reset

# 2. Carregar dados completos (executar no psql ou Studio)
# Conectar em: http://localhost:54323
# SQL Editor → Executar: backup_completo_producao.sql

# ================================
# MÉTODO 2: Usar produção diretamente
# ================================

# Para desenvolvimento com dados 100% reais:
npm run env:prod
npm run dev

# Para desenvolvimento local (sem dados):
npm run env:local  
npm run dev

# ================================
# FLUXO RECOMENDADO
# ================================

# Dia a dia: Use produção para development
# Testes: Use local para experimentos
# Deploy: Push mudanças com supabase db push
