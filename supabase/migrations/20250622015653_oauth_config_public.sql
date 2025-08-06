-- Create a view for the connectors_public table
CREATE OR REPLACE VIEW public.connectors_public AS
SELECT
    id,
    icon,
    name,
    description,
    type,
    provider,
    is_active,
    created_at,
    updated_at,
    user_id,
    config_public
FROM public.connectors
WHERE
    is_active = true;