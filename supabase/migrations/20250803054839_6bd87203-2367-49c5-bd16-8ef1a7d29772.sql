-- Simplify the database schema for focused Airtable <-> Postgres sync tool

-- First, let's simplify the syncs table to match our new focused scope
ALTER TABLE public.syncs 
DROP COLUMN IF EXISTS setup_stage,
DROP COLUMN IF EXISTS team_id,
DROP COLUMN IF EXISTS source_id,
DROP COLUMN IF EXISTS destination_id;

-- Add the new simple columns for our focused sync
ALTER TABLE public.syncs 
ADD COLUMN IF NOT EXISTS airtable_token TEXT,
ADD COLUMN IF NOT EXISTS airtable_base_id TEXT,
ADD COLUMN IF NOT EXISTS airtable_table_name TEXT,
ADD COLUMN IF NOT EXISTS postgres_connection_string TEXT,
ADD COLUMN IF NOT EXISTS postgres_table_name TEXT,
ADD COLUMN IF NOT EXISTS sync_direction TEXT DEFAULT 'two-way' CHECK (sync_direction IN ('airtable-to-postgres', 'postgres-to-airtable', 'two-way')),
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS sync_interval_minutes INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create a simple sync_logs table for tracking sync runs
CREATE TABLE IF NOT EXISTS public.sync_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_id UUID NOT NULL REFERENCES public.syncs(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    direction TEXT NOT NULL CHECK (direction IN ('airtable-to-postgres', 'postgres-to-airtable')),
    status TEXT NOT NULL CHECK (status IN ('success', 'error', 'partial')),
    records_inserted INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_skipped INTEGER DEFAULT 0,
    duration_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a simple field_mappings table for storing field mappings
CREATE TABLE IF NOT EXISTS public.sync_field_mappings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    sync_id UUID NOT NULL REFERENCES public.syncs(id) ON DELETE CASCADE,
    airtable_field_name TEXT NOT NULL,
    postgres_field_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_field_mappings ENABLE ROW LEVEL SECURITY;

-- Update RLS policies for syncs table to be user-based instead of team-based
DROP POLICY IF EXISTS "Team members can create their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can delete their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can update their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can view their team's syncs" ON public.syncs;

-- Create new user-based policies for syncs
CREATE POLICY "Users can create their own syncs" 
ON public.syncs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own syncs" 
ON public.syncs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own syncs" 
ON public.syncs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own syncs" 
ON public.syncs 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for sync_logs
CREATE POLICY "Users can view logs for their syncs" 
ON public.sync_logs 
FOR SELECT 
USING (sync_id IN (SELECT id FROM public.syncs WHERE user_id = auth.uid()));

CREATE POLICY "System can insert sync logs" 
ON public.sync_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS policies for sync_field_mappings
CREATE POLICY "Users can manage field mappings for their syncs" 
ON public.sync_field_mappings 
FOR ALL 
USING (sync_id IN (SELECT id FROM public.syncs WHERE user_id = auth.uid()));

-- Update sync config structure to be simpler
UPDATE public.syncs 
SET config = jsonb_build_object(
    'auto_sync_enabled', true,
    'sync_interval_minutes', 5
)
WHERE config IS NOT NULL;