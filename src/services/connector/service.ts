import { supabase } from "@/integrations/supabase/client";
import { Connector } from "@/types/connectors";

export const fetchConnectors = async (): Promise<Connector[]> => {
  const { data: connectors, error } = await supabase
    .from('connectors_public')
    .select('*');

  if (error) {
    throw error;
  }

  return connectors || [];
};

// Function to get connector with decrypted config (for backend use)
export const getConnectorWithDecryptedConfig = async (connectorId: string): Promise<Connector | null> => {
  const { data, error } = await supabase
    .rpc('get_connector_with_decrypted_config', { connector_id: connectorId });

  if (error) {
    throw error;
  }

  return data?.[0] || null;
};

// Function to get all connectors with decrypted configs (for backend use)
export const getAllConnectorsWithDecryptedConfigs = async (): Promise<Connector[]> => {
  const { data, error } = await supabase
    .rpc('get_all_connectors_with_decrypted_configs');

  if (error) {
    throw error;
  }

  return data || [];
}; 