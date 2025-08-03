-- Migration to remove team-based architecture and convert to user-based
-- This migration drops team-related tables and replaces team_id with user_id

-- Step 1: Drop team-related RLS policies first (before functions)
-- Teams policies
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
DROP POLICY IF EXISTS "Authenticated users can create teams" ON public.teams;
DROP POLICY IF EXISTS "Team owners can update their teams" ON public.teams;

-- Team members policies
DROP POLICY IF EXISTS "Users can only view their own member" ON public.team_members;
DROP POLICY IF EXISTS "Users can create team members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can update team members" ON public.team_members;
DROP POLICY IF EXISTS "Team owners can delete team members" ON public.team_members;
DROP POLICY IF EXISTS "Users can remove themselves" ON public.team_members;

-- Connections policies
DROP POLICY IF EXISTS "Team members can view their team's connections" ON public.connections;
DROP POLICY IF EXISTS "Team members can create their team's connections" ON public.connections;
DROP POLICY IF EXISTS "Team members can update their team's connections" ON public.connections;
DROP POLICY IF EXISTS "Team members can delete their team's connections" ON public.connections;

-- Connectors policies (keep the public view policy)
-- DROP POLICY IF EXISTS "Anyone can view connectors" ON public.connectors;

-- Field mapping policies
DROP POLICY IF EXISTS "Team members can view their team's field mappings" ON public.field_mapping;
DROP POLICY IF EXISTS "Team members can manage their team's field mappings" ON public.field_mapping;
DROP POLICY IF EXISTS "Team members can update their team's field mappings" ON public.field_mapping;
DROP POLICY IF EXISTS "Team members can delete their team's field mappings" ON public.field_mapping;

-- Step 2: Drop team-related functions and views (after policies are dropped)
DROP FUNCTION IF EXISTS public.get_team_ids_for_user(uuid);
DROP FUNCTION IF EXISTS public.get_role_based_team_ids_for_user(uuid, text);
DROP FUNCTION IF EXISTS public.get_accessible_sync_ids_for_user(uuid);
DROP VIEW IF EXISTS public.view_team_members;

-- Step 3: Drop team-related indexes
DROP INDEX IF EXISTS idx_team_members_team_id;
DROP INDEX IF EXISTS idx_team_members_user_id;
DROP INDEX IF EXISTS idx_connectors_team_id;
DROP INDEX IF EXISTS idx_connections_team_id;
DROP INDEX IF EXISTS idx_syncs_team_id;

-- Step 4: Add user_id columns to tables that need them
-- Add user_id to connectors table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'connectors' AND column_name = 'user_id') THEN
        ALTER TABLE public.connectors ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id to connections table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'connections' AND column_name = 'user_id') THEN
        ALTER TABLE public.connections ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add user_id to field_mapping table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'field_mapping' AND column_name = 'user_id') THEN
        ALTER TABLE public.field_mapping ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 5: Update any existing data to set user_id based on team ownership (before dropping team_id columns)
-- This assumes that team owners should become the user_id for their team's resources
-- Note: This is a best-effort migration and may need manual review

-- Update connectors with user_id based on team ownership (only if team_id column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'connectors' AND column_name = 'team_id') THEN
        UPDATE public.connectors 
        SET user_id = (
            SELECT tm.user_id 
            FROM public.team_members tm 
            WHERE tm.team_id = connectors.team_id 
            AND tm.role = 'owner' 
            LIMIT 1
        )
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Update connections with user_id based on team ownership (only if team_id column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'connections' AND column_name = 'team_id') THEN
        UPDATE public.connections 
        SET user_id = (
            SELECT tm.user_id 
            FROM public.team_members tm 
            WHERE tm.team_id = connections.team_id 
            AND tm.role = 'owner' 
            LIMIT 1
        )
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Update syncs with user_id based on team ownership (only if team_id column exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'syncs' AND column_name = 'team_id') THEN
        UPDATE public.syncs 
        SET user_id = (
            SELECT tm.user_id 
            FROM public.team_members tm 
            WHERE tm.team_id = syncs.team_id 
            AND tm.role = 'owner' 
            LIMIT 1
        )
        WHERE user_id IS NULL;
    END IF;
END $$;

-- Update field_mapping with user_id based on sync ownership
UPDATE public.field_mapping 
SET user_id = (
    SELECT s.user_id 
    FROM public.syncs s 
    WHERE s.id = field_mapping.sync_id
)
WHERE user_id IS NULL;

-- Step 6: Drop team_id columns from tables (after data migration)
ALTER TABLE public.connectors DROP COLUMN IF EXISTS team_id;
ALTER TABLE public.connections DROP COLUMN IF EXISTS team_id;
ALTER TABLE public.syncs DROP COLUMN IF EXISTS team_id;

-- Step 7: Drop team-related tables (after data migration)
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;

-- Step 8: Create new indexes for user_id columns
CREATE INDEX IF NOT EXISTS idx_connectors_user_id ON public.connectors(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_field_mapping_user_id ON public.field_mapping(user_id);

-- Step 9: Create user-based RLS policies

-- Connections policies
CREATE POLICY "Users can view their connections"
    ON public.connections
    FOR SELECT
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can create their connections"
    ON public.connections
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "Users can update their connections"
    ON public.connections
    FOR UPDATE
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can delete their connections"
    ON public.connections
    FOR DELETE
    USING (
        user_id = auth.uid()
    );

-- Connectors policies (keep public view, add user-based management)
CREATE POLICY "Users can view all connectors"
    ON public.connectors
    FOR SELECT
    USING (true);

CREATE POLICY "Users can create their connectors"
    ON public.connectors
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "Users can update their connectors"
    ON public.connectors
    FOR UPDATE
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can delete their connectors"
    ON public.connectors
    FOR DELETE
    USING (
        user_id = auth.uid()
    );

-- Field mapping policies
CREATE POLICY "Users can view their field mappings"
    ON public.field_mapping
    FOR SELECT
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can create their field mappings"
    ON public.field_mapping
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
    );

CREATE POLICY "Users can update their field mappings"
    ON public.field_mapping
    FOR UPDATE
    USING (
        user_id = auth.uid()
    );

CREATE POLICY "Users can delete their field mappings"
    ON public.field_mapping
    FOR DELETE
    USING (
        user_id = auth.uid()
    );

-- Step 10: Create helper functions for user-based access
CREATE OR REPLACE FUNCTION public.get_user_connections(uid uuid)
RETURNS uuid[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT id
        FROM public.connections
        WHERE user_id = uid
    );
END;
$$ LANGUAGE plpgsql
SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_syncs(uid uuid)
RETURNS uuid[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT id
        FROM public.syncs
        WHERE user_id = uid
    );
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Step 11: Handle any remaining NULL user_id values before making columns NOT NULL

-- For connectors without team owners, assign to the first available user or delete orphaned records
UPDATE public.connectors 
SET user_id = (
    SELECT id FROM auth.users LIMIT 1
)
WHERE user_id IS NULL;

-- For connections without team owners, assign to the first available user or delete orphaned records
UPDATE public.connections 
SET user_id = (
    SELECT id FROM auth.users LIMIT 1
)
WHERE user_id IS NULL;

-- For field_mapping without sync owners, delete orphaned records
DELETE FROM public.field_mapping 
WHERE user_id IS NULL;

-- Step 12: Make user_id columns NOT NULL after handling NULL values
ALTER TABLE public.connectors ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.connections ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.field_mapping ALTER COLUMN user_id SET NOT NULL; 