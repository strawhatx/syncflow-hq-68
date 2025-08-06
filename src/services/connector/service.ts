import { supabase } from "@/integrations/supabase/client";
import { ConnectorWithConnections, ConnectorType, ConnectorProvider } from "@/types/connectors";

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

  // convert the code_challenge_required to a boolean and cast type to ConnectorType
  return connectors.map((connector) => ({
    ...connector,
    type: connector.type as ConnectorType,
    provider: connector.provider as ConnectorProvider,
    code_challenge_required: connector.code_challenge_required === 'true'
  })) || [];
}; 