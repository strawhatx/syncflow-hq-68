-- Migration to add encryption for sensitive columns using Supabase Vault
-- This migration uses Vault for secure secret management

-- Step 1: Enable the vault extension if not already enabled
CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;

-- Step 2: Create encryption keys for different purposes
-- Note: In production, these should be managed securely through the Supabase dashboard
DO $$
BEGIN
    -- Create secrets for different configuration types
    IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'connector_config_secret') THEN
        PERFORM vault.create_secret(
            'initial_connector_secret', 
            'connector_config_secret', 
            'Secret for storing connector configurations'
        );
        RAISE NOTICE 'Created connector_config_secret';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM vault.secrets WHERE name = 'connection_config_secret') THEN
        PERFORM vault.create_secret(
            'initial_connection_secret', 
            'connection_config_secret', 
            'Secret for storing connection configurations'
        );
        RAISE NOTICE 'Created connection_config_secret';
    END IF;
END $$;

-- Step 3: Modify tables to support Vault-based encryption
-- First, drop NOT NULL constraints to allow NULL config values
ALTER TABLE public.connectors ALTER COLUMN config DROP NOT NULL;
ALTER TABLE public.connections ALTER COLUMN config DROP NOT NULL;

-- Add new columns for Vault-based encryption
ALTER TABLE public.connectors 
ADD COLUMN IF NOT EXISTS config_public JSONB,
ADD COLUMN IF NOT EXISTS config_secret_id UUID,
ADD COLUMN IF NOT EXISTS config_iv BYTEA;

ALTER TABLE public.connections 
ADD COLUMN IF NOT EXISTS config_public JSONB,
ADD COLUMN IF NOT EXISTS config_secret_id UUID,
ADD COLUMN IF NOT EXISTS config_iv BYTEA;

-- Step 4: Create functions for encryption/decryption
-- Function to split and encrypt sensitive config fields
CREATE OR REPLACE FUNCTION public.split_and_encrypt_config(config_data JSONB)
RETURNS TABLE(public_config JSONB, encrypted_secret_id UUID, iv BYTEA) AS $$
DECLARE
    secret_name TEXT := 'connection_config_' || gen_random_uuid()::text;
    private_config JSONB;
    public_config JSONB;
    config_key TEXT;
    config_value JSONB;
    encrypted_secret_id UUID;
BEGIN
    -- Initialize public and private configs
    public_config := '{}'::jsonb;
    private_config := '{}'::jsonb;
    
    -- Iterate through config keys and split based on sensitivity
    FOR config_key, config_value IN SELECT * FROM jsonb_each(config_data)
    LOOP
        -- Check if the key contains sensitive information
        IF config_key ILIKE '%connectionstring%' OR 
           config_key ILIKE '%connection_string%' OR
           config_key ILIKE '%password%' OR
           config_key ILIKE '%secret%' OR
           config_key ILIKE '%api_key%' OR
           config_key ILIKE '%apikey%' OR
           config_key ILIKE '%token%' OR
           config_key ILIKE '%key%' THEN
            -- Add to private config (will be encrypted)
            private_config := private_config || jsonb_build_object(config_key, config_value);
        ELSE
            -- Add to public config (will be exposed)
            public_config := public_config || jsonb_build_object(config_key, config_value);
        END IF;
    END LOOP;
    
    -- Only encrypt if there's private data
    IF private_config != '{}'::jsonb THEN
        -- Create a secret in Vault and get its ID
        encrypted_secret_id := vault.create_secret(
            private_config::text, 
            secret_name, 
            'Encrypted connection configuration'
        );
    ELSE
        encrypted_secret_id := NULL;
    END IF;
    
    RETURN QUERY SELECT public_config, encrypted_secret_id, gen_random_bytes(16);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to encrypt connector config (legacy support)
CREATE OR REPLACE FUNCTION public.encrypt_connector_config(config_data JSONB)
RETURNS TABLE(secret_id UUID, iv BYTEA) AS $$
DECLARE
    secret_name TEXT := 'connector_config_' || gen_random_uuid()::text;
    secret_id UUID;
BEGIN
    -- Create a secret in Vault for the entire config
    secret_id := vault.create_secret(
        config_data::text, 
        secret_name, 
        'Encrypted connector configuration'
    );
    
    RETURN QUERY SELECT secret_id, gen_random_bytes(16);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt connection config
CREATE OR REPLACE FUNCTION public.decrypt_connection_config(secret_id UUID)
RETURNS JSONB AS $$
DECLARE
    decrypted_data TEXT;
BEGIN
    -- Retrieve and decrypt the secret from Vault
    SELECT decrypted_secret INTO decrypted_data 
    FROM vault.decrypted_secrets 
    WHERE id = secret_id;
    
    RETURN decrypted_data::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt connector config
CREATE OR REPLACE FUNCTION public.decrypt_connector_config(secret_id UUID)
RETURNS JSONB AS $$
DECLARE
    decrypted_data TEXT;
BEGIN
    -- Retrieve and decrypt the secret from Vault
    SELECT decrypted_secret INTO decrypted_data 
    FROM vault.decrypted_secrets 
    WHERE id = secret_id;
    
    RETURN decrypted_data::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create triggers to automatically encrypt data
-- Trigger for connectors table
CREATE OR REPLACE FUNCTION public.encrypt_connector_config_trigger()
RETURNS TRIGGER AS $$
DECLARE
    encrypted_result RECORD;
BEGIN
    -- Only process if config is provided and not already processed
    IF NEW.config IS NOT NULL AND NEW.config_secret_id IS NULL THEN
        -- For connectors, we'll encrypt the entire config
        SELECT * INTO encrypted_result FROM public.encrypt_connector_config(NEW.config);
        NEW.config_secret_id := encrypted_result.secret_id;
        NEW.config_iv := encrypted_result.iv;
        NEW.config_public := '{}'::jsonb; -- Empty public config for connectors
        NEW.config := NULL; -- Clear the plain text config
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER encrypt_connector_config_trigger
    BEFORE INSERT OR UPDATE ON public.connectors
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_connector_config_trigger();

-- Trigger for connections table
CREATE OR REPLACE FUNCTION public.encrypt_connection_config_trigger()
RETURNS TRIGGER AS $$
DECLARE
    split_result RECORD;
BEGIN
    -- Only process if config is provided and not already processed
    IF NEW.config IS NOT NULL AND NEW.config_secret_id IS NULL THEN
        -- Split config into public and private parts, encrypt private part
        SELECT * INTO split_result FROM public.split_and_encrypt_config(NEW.config);
        NEW.config_public := split_result.public_config;
        NEW.config_secret_id := split_result.encrypted_secret_id;
        NEW.config_iv := split_result.iv;
        NEW.config := NULL; -- Clear the plain text config
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER encrypt_connection_config_trigger
    BEFORE INSERT OR UPDATE ON public.connections
    FOR EACH ROW
    EXECUTE FUNCTION public.encrypt_connection_config_trigger();

-- Step 6: Create public view for connectors (with public config data)
-- Drop the view first to ensure clean recreation
DROP VIEW IF EXISTS public.connectors_public;

CREATE VIEW public.connectors_public AS
SELECT 
    id,
    name,
    type,
    provider,
    config_public,
    is_active,
    created_at,
    updated_at
FROM public.connectors
WHERE is_active = true;

-- Step 7: Create functions to get decrypted configs
-- Function to get decrypted connector config (for backend use)
CREATE OR REPLACE FUNCTION public.get_connector_with_decrypted_config(connector_id UUID)
RETURNS TABLE(
    id UUID,
    name TEXT,
    type TEXT,
    provider TEXT,
    config JSONB,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.type,
        c.provider,
        CASE 
            WHEN c.config_secret_id IS NOT NULL THEN 
                public.decrypt_connector_config(c.config_secret_id)
            ELSE 
                NULL
        END as config,
        c.is_active,
        c.created_at,
        c.updated_at
    FROM public.connectors c
    WHERE c.id = connector_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get decrypted connection config (for backend use)
CREATE OR REPLACE FUNCTION public.get_connection_with_decrypted_config(connection_id UUID)
RETURNS TABLE(
    id UUID,
    connector_id UUID,
    name TEXT,
    config_public JSONB,
    config_private JSONB,
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
        CASE 
            WHEN c.config_secret_id IS NOT NULL THEN 
                public.decrypt_connection_config(c.config_secret_id)
            ELSE 
                NULL
        END as config_private,
        c.user_id,
        c.is_active,
        c.created_at,
        c.updated_at
    FROM public.connections c
    WHERE c.id = connection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Migrate existing data to encrypted format
-- Migrate existing connector configs (with error handling)
DO $$
DECLARE
    connector_count INTEGER;
    connection_count INTEGER;
BEGIN
    -- Count existing unencrypted configs
    SELECT COUNT(*) INTO connector_count 
    FROM public.connectors 
    WHERE config IS NOT NULL AND config_secret_id IS NULL;
    
    SELECT COUNT(*) INTO connection_count 
    FROM public.connections 
    WHERE config IS NOT NULL AND config_secret_id IS NULL;
    
    -- Log migration info
    RAISE NOTICE 'Migrating % connector configs and % connection configs to Vault-based encryption', 
                 connector_count, connection_count;
    
    -- Migrate connector configs (encrypt everything)
    IF connector_count > 0 THEN
        UPDATE public.connectors 
        SET 
            config_secret_id = (SELECT secret_id FROM public.encrypt_connector_config(config)),
            config_iv = (SELECT iv FROM public.encrypt_connector_config(config)),
            config_public = '{}'::jsonb,
            config = NULL
        WHERE config IS NOT NULL AND config_secret_id IS NULL;
        RAISE NOTICE 'Successfully encrypted % connector configs', connector_count;
    END IF;
    
    -- Migrate connection configs (split and encrypt sensitive parts)
    IF connection_count > 0 THEN
        UPDATE public.connections 
        SET 
            config_public = (SELECT public_config FROM public.split_and_encrypt_config(config)),
            config_secret_id = (SELECT encrypted_secret_id FROM public.split_and_encrypt_config(config)),
            config_iv = (SELECT iv FROM public.split_and_encrypt_config(config)),
            config = NULL
        WHERE config IS NOT NULL AND config_secret_id IS NULL;
        RAISE NOTICE 'Successfully split and encrypted % connection configs', connection_count;
    END IF;
END $$;

-- Step 9: Add RLS policies for the new functions
-- Allow authenticated users to access decryption functions
GRANT EXECUTE ON FUNCTION public.get_connector_with_decrypted_config(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_connection_with_decrypted_config(UUID) TO authenticated;

-- Allow service role to access decryption functions (for backend use)
GRANT EXECUTE ON FUNCTION public.get_connector_with_decrypted_config(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_connection_with_decrypted_config(UUID) TO service_role;

-- Step 10: Grant access to the public view
GRANT SELECT ON public.connectors_public TO public;
GRANT SELECT ON public.connectors_public TO authenticated;
GRANT SELECT ON public.connectors_public TO service_role;