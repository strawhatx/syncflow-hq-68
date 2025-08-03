import { supabase } from "@/integrations/supabase/client";

//Edge function to fetch with auth
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  const result = await response.json();
  if (result.error) throw new Error(result.error);

  return result;
};

export const fetchWithAuthCache = async (endpoint: string, base:  "schema" | "connection" | "oauth" | "email", keys: string[], options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const cacheKey = `${base}-${keys.join("-")}`;
  
  // For now, skip caching as the cache table doesn't exist
  // TODO: Implement proper caching when cache table is available
  return await fetchWithAuth(endpoint, options);
}