import { supabase } from "@/integrations/supabase/client";

//Edge function to fetch with auth
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const response = await supabase.functions.invoke(endpoint, {
    body: options.body,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`,
      ...(options.headers as Record<string, string>),
    },
  });

  if (response.error) throw new Error(response.error.message);

  return response.data;
};

export const fetchWithAuthCache = async (endpoint: string, base:  "schema" | "connection" | "oauth" | "email", keys: string[], options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const cacheKey = `${base}-${keys.join("-")}`;
  
  // For now, skip caching as the cache table doesn't exist
  // TODO: Implement proper caching when cache table is available
  return await fetchWithAuth(endpoint, options);
}