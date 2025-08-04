-- Update Supabase connector to use API key authentication instead of OAuth
-- This is needed because OAuth is not available in production for Supabase

UPDATE public.connectors 
SET 
    type = 'api_key',
    config = '{
        "icon": "supabase-icon",
        "description": "Use Supabase as a powerful database for your e-commerce data",
        "optional_fields": [],
        "required_fields": ["project_url", "api_key"]
    }'::jsonb
WHERE provider = 'supabase'; 