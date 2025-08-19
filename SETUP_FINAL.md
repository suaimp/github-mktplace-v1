# ================================
# CONFIGURAÇÃO HÍBRIDA RECOMENDADA
# ================================

# Para DESENVOLVIMENTO LOCAL (com dados de teste):
# Use: npm run env:local

# Para TESTAR COM DADOS REAIS (produção):
# Use: npm run env:prod

# ================================
# SCRIPTS NO PACKAGE.JSON:
# ================================

"env:local": "move .env .env.backup 2>nul & move .env.local .env",
"env:prod": "move .env .env.local 2>nul & move .env.backup .env",
"dev:local": "npm run env:local && npm run dev",
"dev:prod": "npm run env:prod && npm run dev",

# ================================
# FLUXO DE TRABALHO:
# ================================

1. Para desenvolvimento com dados locais:
   npm run dev:local

2. Para testar com dados de produção:
   npm run dev:prod

3. Para modificações no schema:
   - Modifique localmente
   - Teste com: npm run dev:local
   - Quando pronto: supabase db push

# ================================
# BANCO LOCAL FUNCIONANDO
# ================================
