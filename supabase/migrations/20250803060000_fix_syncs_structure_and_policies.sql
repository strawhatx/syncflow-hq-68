-- Fix syncs table structure and update RLS policies to use user-based access
-- This migration ensures the syncs table matches the current types and uses user-based access

-- First, let's ensure the syncs table has the correct structure
-- Add status column if it doesn't exist (in case this migration runs before the status update)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'syncs' AND column_name = 'status') THEN
        ALTER TABLE public.syncs ADD COLUMN status TEXT NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'active', 'paused', 'error'));
    END IF;
END $$;

-- Remove Airtable-specific columns
ALTER TABLE public.syncs DROP COLUMN IF EXISTS airtable_token;
ALTER TABLE public.syncs DROP COLUMN IF EXISTS airtable_base_id;
ALTER TABLE public.syncs DROP COLUMN IF EXISTS airtable_table_name;

-- Remove PostgreSQL-specific columns
ALTER TABLE public.syncs DROP COLUMN IF EXISTS postgres_connection_string;
ALTER TABLE public.syncs DROP COLUMN IF EXISTS postgres_table_name;

-- Remove other legacy columns
ALTER TABLE public.syncs DROP COLUMN IF EXISTS sync_direction;
ALTER TABLE public.syncs DROP COLUMN IF EXISTS last_sync_at;
ALTER TABLE public.syncs DROP COLUMN IF EXISTS sync_interval_minutes;


-- Remove is_active column if it exists (replaced by status)
ALTER TABLE public.syncs DROP COLUMN IF EXISTS is_active;

-- Remove team_id column if it exists (going back to user-based access)
ALTER TABLE public.syncs DROP COLUMN IF EXISTS team_id;

-- Ensure source_id and destination_id exist and reference connections
DO $$ 
BEGIN
    -- Add source_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'syncs' AND column_name = 'source_id') THEN
        ALTER TABLE public.syncs ADD COLUMN source_id UUID REFERENCES public.connections(id) ON DELETE CASCADE;
    END IF;
    
    -- Add destination_id if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'syncs' AND column_name = 'destination_id') THEN
        ALTER TABLE public.syncs ADD COLUMN destination_id UUID REFERENCES public.connections(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ensure user_id exists for user-based access
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'syncs' AND column_name = 'user_id') THEN
        ALTER TABLE public.syncs ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_syncs_status ON public.syncs(status);
CREATE INDEX IF NOT EXISTS idx_syncs_source_id ON public.syncs(source_id);
CREATE INDEX IF NOT EXISTS idx_syncs_destination_id ON public.syncs(destination_id);
CREATE INDEX IF NOT EXISTS idx_syncs_user_id ON public.syncs(user_id);

-- Drop old RLS policies
DROP POLICY IF EXISTS "Team members can view logs for their team's syncs" ON public.sync_logs;
DROP POLICY IF EXISTS "Team members can manage field mappings for their team's syncs" ON public.sync_field_mappings;
DROP POLICY IF EXISTS "Team members can view their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can create their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can update their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can delete their team's syncs" ON public.syncs;


-- Create user-based RLS policies for syncs
CREATE POLICY "Users can view their syncs"
    ON public.syncs
    FOR SELECT
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can create their syncs"
    ON public.syncs
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "Users can update their syncs"
    ON public.syncs
    FOR UPDATE
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can delete their syncs"
    ON public.syncs
    FOR DELETE
    USING (
        user_id = auth.uid()
    );

-- Update the updated_at trigger for syncs
CREATE OR REPLACE FUNCTION update_syncs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_update_syncs_updated_at ON public.syncs;

-- Create the updated trigger
CREATE TRIGGER trg_update_syncs_updated_at
    BEFORE UPDATE ON public.syncs
    FOR EACH ROW
    EXECUTE FUNCTION update_syncs_updated_at(); 