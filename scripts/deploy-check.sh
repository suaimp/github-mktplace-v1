#!/bin/bash
# Script de deploy para Netlify

echo "🔍 Verificando configuração de produção..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "❌ VITE_SUPABASE_URL não definida"
  exit 1
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "❌ VITE_SUPABASE_ANON_KEY não definida"
  exit 1
fi

# Verificar se não são URLs locais
if [[ "$VITE_SUPABASE_URL" == *"localhost"* ]] || [[ "$VITE_SUPABASE_URL" == *"127.0.0.1"* ]]; then
  echo "❌ URL do Supabase ainda está apontando para desenvolvimento local!"
  echo "URL atual: $VITE_SUPABASE_URL"
  exit 1
fi

echo "✅ Configuração de produção OK"
echo "📦 Buildando aplicação..."

npm run build
