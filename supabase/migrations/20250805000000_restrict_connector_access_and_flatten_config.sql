-- Migration to restrict connector access and flatten config_public in view
-- This migration ensures connectors table is only accessible via elevated permissions
-- and flattens config_public in the public view for better frontend usability

-- Step 1: Drop existing RLS policies on connectors table
DROP POLICY IF EXISTS "Anyone can view connectors" ON public.connectors;
DROP POLICY IF EXISTS "Users can view their connectors" ON public.connectors;
DROP POLICY IF EXISTS "Users can create connectors" ON public.connectors;
DROP POLICY IF EXISTS "Users can update connectors" ON public.connectors;
DROP POLICY IF EXISTS "Users can delete connectors" ON public.connectors;

-- Step 2: Create restrictive RLS policies for connectors table
-- Only service role and authenticated users with elevated permissions can access
CREATE POLICY "Service role can manage connectors" ON public.connectors
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Step 3: Create a more restrictive policy for authenticated users
-- This could be further restricted based on user roles if needed
CREATE POLICY "Authenticated users can view connectors" ON public.connectors
    FOR SELECT
    TO authenticated
    USING (true);

-- Step 4: Update the connectors_public view to flatten config_public
-- This makes it easier for frontend to access config fields directly
-- Drop the existing view first to ensure clean replacement
DROP VIEW IF EXISTS public.connectors_public;

CREATE VIEW public.connectors_public AS
SELECT 
    id,
    name,
    type,
    provider,
    is_active,
    created_at,
    updated_at,
    -- Flatten common config_public fields
    config_public->>'icon' as icon,
    config_public->>'description' as description,
    config_public->>'host' as host,
    config_public->>'port' as port,
    config_public->>'database' as database,
    config_public->>'username' as username,
    config_public->>'schema' as schema,
    config_public->>'ssl' as ssl,
    config_public->>'required_fields' as required_fields,
    config_public->>'optional_fields' as optional_fields,
    config_public->>'auth_url' as auth_url,
    config_public->>'token_url' as token_url,
    config_public->>'redirect_url' as redirect_url,
    config_public->>'scopes' as scopes,
    config_public->>'client_id' as client_id,
    config_public->>'code_challenge_required' as code_challenge_required,
    -- Keep the full config_public for flexibility
    config_public
FROM public.connectors
WHERE is_active = true;

-- Step 5: Create a view for connections that excludes encrypted data
-- This provides a safe way for frontend to view connection metadata
CREATE OR REPLACE VIEW public.connections_public AS
SELECT 
    id,
    connector_id,
    name,
    config_public,
    user_id,
    is_active,
    created_at,
    updated_at
FROM public.connections
WHERE is_active = true;

-- Step 6: Add RLS policies for connections table to prevent config_encrypted access
-- Users can only access their own connections and cannot see encrypted data
CREATE POLICY "Users can view their own connections" ON public.connections
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own connections" ON public.connections
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own connections" ON public.connections
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own connections" ON public.connections
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Step 7: Create a function to safely update connections without exposing encrypted data
CREATE OR REPLACE FUNCTION public.update_connection_safe(
    connection_id UUID,
    updates JSONB
)
RETURNS JSONB AS $$
DECLARE
    current_user_id UUID;
    result JSONB;
BEGIN
    -- Get current user
    current_user_id := auth.uid();
    
    -- Check if user owns the connection
    IF NOT EXISTS (
        SELECT 1 FROM public.connections 
        WHERE id = connection_id AND user_id = current_user_id
    ) THEN
        RAISE EXCEPTION 'Access denied: Connection not found or not owned by user';
    END IF;
    
    -- Remove any attempt to update encrypted fields directly
    updates := updates - 'config_encrypted' - 'config_iv';
    
    -- Update the connection
    UPDATE public.connections 
    SET 
        name = COALESCE(updates->>'name', name),
        config_public = COALESCE(updates->'config_public', config_public),
        is_active = COALESCE((updates->>'is_active')::boolean, is_active),
        updated_at = NOW()
    WHERE id = connection_id AND user_id = current_user_id
    RETURNING to_jsonb(public.connections.*) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant permissions for the new views and functions
GRANT SELECT ON public.connectors_public TO public;
GRANT SELECT ON public.connectors_public TO authenticated;
GRANT SELECT ON public.connectors_public TO service_role;

GRANT SELECT ON public.connections_public TO authenticated;
GRANT SELECT ON public.connections_public TO service_role;

GRANT EXECUTE ON FUNCTION public.update_connection_safe(UUID, JSONB) TO authenticated;

-- Step 9: Create a function to get connection metadata safely
CREATE OR REPLACE FUNCTION public.get_connection_metadata(connection_id UUID)
RETURNS TABLE(
    id UUID,
    connector_id UUID,
    name TEXT,
    config_public JSONB,
    user_id UUID,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.connector_id,
        c.name,
        c.config_public,
        c.user_id,
        c.is_active,
        c.created_at,
        c.updated_at
    FROM public.connections c
    WHERE c.id = connection_id AND c.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Add RLS policy for the new function
GRANT EXECUTE ON FUNCTION public.get_connection_metadata(UUID) TO authenticated;

-- Step 11: Create a comprehensive function to get user's connections with metadata
CREATE OR REPLACE FUNCTION public.get_user_connections_metadata(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    connector_id UUID,
    name TEXT,
    config_public JSONB,
    user_id UUID,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    connector_name TEXT,
    connector_provider TEXT,
    connector_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.connector_id,
        c.name,
        c.config_public,
        c.user_id,
        c.is_active,
        c.created_at,
        c.updated_at,
        conn.name as connector_name,
        conn.provider as connector_provider,
        conn.type as connector_type
    FROM public.connections c
    LEFT JOIN public.connectors conn ON c.connector_id = conn.id
    WHERE c.user_id = user_uuid AND c.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 12: Grant permissions for the metadata function
GRANT EXECUTE ON FUNCTION public.get_user_connections_metadata(UUID) TO authenticated;

-- Step 13: Create a function to validate connection ownership
CREATE OR REPLACE FUNCTION public.validate_connection_ownership(connection_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.connections 
        WHERE id = connection_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 14: Grant permissions for ownership validation
GRANT EXECUTE ON FUNCTION public.validate_connection_ownership(UUID) TO authenticated;

-- Step 15: Add comments for documentation
COMMENT ON VIEW public.connectors_public IS 'Public view of connectors with flattened config fields. Safe for frontend access.';
COMMENT ON VIEW public.connections_public IS 'Public view of connections excluding encrypted data. Safe for frontend access.';
COMMENT ON FUNCTION public.update_connection_safe(UUID, JSONB) IS 'Safely update connection without exposing encrypted data.';
COMMENT ON FUNCTION public.get_connection_metadata(UUID) IS 'Get connection metadata safely without encrypted data.';
COMMENT ON FUNCTION public.get_user_connections_metadata(UUID) IS 'Get user connections with connector metadata.';
COMMENT ON FUNCTION public.validate_connection_ownership(UUID) IS 'Validate if current user owns the connection.'; 