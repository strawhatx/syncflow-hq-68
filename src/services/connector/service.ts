import { supabase } from "@/integrations/supabase/client";
import { ConnectorWithConnections } from "@/types/connectors";

// Export the type for use in other files
export type { ConnectorWithConnections };

export const fetchConnectors = async (): Promise<ConnectorWithConnections[]> => {
  const { data: connectors, error } = await supabase
    .from('connectors_public')
    .select(`
      *,
      connections:connections(*)
    `);

  if (error) {
    throw error;
  }

  // convert the code_challenge_required to a boolean and ensure all required fields
  return connectors.map((connector) => ({
    ...connector,
    code_challenge_required: connector.code_challenge_required === 'true',
    is_active: connector.is_active ?? true
  })) || [];
}; 