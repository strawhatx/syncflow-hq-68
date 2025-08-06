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