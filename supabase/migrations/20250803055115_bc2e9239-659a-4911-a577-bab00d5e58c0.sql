-- Drop the existing team-based policies first
DROP POLICY IF EXISTS "Team members can view their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can create their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can update their team's syncs" ON public.syncs;
DROP POLICY IF EXISTS "Team members can delete their team's syncs" ON public.syncs;

-- Now drop the team-related columns from syncs table
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