-- Migration: Adiciona coluna idempotency_key à tabela orders
ALTER TABLE orders
ADD COLUMN idempotency_key text UNIQUE; ja 