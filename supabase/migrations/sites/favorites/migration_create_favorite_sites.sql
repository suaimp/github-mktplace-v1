-- Migration: create_favorite_sites_table
-- Responsabilidade: Criar a tabela favorite_sites para armazenar sites favoritos dos usuários

CREATE TABLE IF NOT EXISTS favorite_sites (
    id uuid PRIMARY KEY NOT NULL,
    user_id uuid NOT NULL,
    entry_id uuid NOT NULL REFERENCES form_entries(id) ON DELETE CASCADE
);
