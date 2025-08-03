import { supabase } from "@/integrations/supabase/client";
import { supabase_api } from "@/integrations/supabase/client";

//Edge function to fetch with auth
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No active session");

  const response = await fetch(`${supabase_api}${endpoint}`, {
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