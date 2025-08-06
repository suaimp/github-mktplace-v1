-- Migration: Create trigger_debug_log table
-- Created: 2025-08-05
-- Purpose: Create the debug table that triggers are expecting

CREATE TABLE IF NOT EXISTS trigger_debug_log (
    id SERIAL PRIMARY KEY,
    trigger_name TEXT,
    entry_id UUID,
    action_type TEXT,
    message TEXT,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);
