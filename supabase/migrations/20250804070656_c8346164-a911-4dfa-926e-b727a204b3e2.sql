-- Add sync_type column to syncs table to store the type of sync (supabase-to-airtable, postgres-to-airtable)
ALTER TABLE public.syncs 
ADD COLUMN sync_type TEXT DEFAULT 'postgres-to-airtable' CHECK (sync_type IN ('supabase-to-airtable', 'postgres-to-airtable'));