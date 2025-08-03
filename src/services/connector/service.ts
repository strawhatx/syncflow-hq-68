import { supabase } from "@/integrations/supabase/client";
import { ConnectorWithConnections } from "@/types/connectors";

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

  // convert the code_challenge_required to a boolean
  return connectors.map((connector) => ({
    ...connector,
    code_challenge_required: connector.code_challenge_required === 'true'
  })) || [];
}; 