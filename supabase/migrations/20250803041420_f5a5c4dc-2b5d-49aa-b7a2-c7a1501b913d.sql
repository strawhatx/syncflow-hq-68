-- Fix security issues

-- First, let's create a safer view that doesn't expose auth.users directly
DROP VIEW IF EXISTS public.view_team_members;

-- Create a function to get team member profile safely 
CREATE OR REPLACE FUNCTION public.get_team_member_profile(member_user_id UUID)
RETURNS TABLE (
  email TEXT,
  username TEXT,
  avatar_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.email::TEXT,
    p.username,
    p.avatar_url
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE u.id = member_user_id;
END;
$$ LANGUAGE plpgsql 
SECURITY INVOKER
SET search_path = public;