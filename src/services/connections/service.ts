import { supabase } from "@/integrations/supabase/client";
import { fetchWithAuth } from "@/lib/api";
import { ConnectorProvider, ColumnOption, TableOption } from "@/types/connectors";

// Define simple types for missing interfaces
export interface ConnectionDatabase {
  id: string;
  name: string;
}

export interface ConnectionColumn {
  id: string;
  name: string;
}

export const fetchConnections = async () => {
  const { data, error } = await supabase.from('connections').select('*');
  if (error) throw error;
  return data;
};

// fetch connection databases
export const fetchConnectionDatabases = async (connection: string, provider?: ConnectorProvider): Promise<ConnectionDatabase[]> => {
    const result = await fetchWithAuth("get-databases", {
        method: "POST",
        body: JSON.stringify({ connection, provider }),
    });

    if (result.error) throw result.error;
    return result.data;
};

// fetch tables by database
export const fetchTablesByDatabaseId = async (database_id: string, provider: ConnectorProvider): Promise<TableOption[]> => {
    const result = await fetchWithAuth("get-tables", {
        method: "POST",
        body: JSON.stringify({ database_id, provider }),
    });

    if (result.error) throw result.error;
    return result.data;
};

export const fetchTableById = async (table_id: string, provider: ConnectorProvider): Promise<TableOption> => {
    const result = await fetchWithAuth("get-tables", {
        method: "POST", 
        body: JSON.stringify({ table_id, provider }),
    });

    if (result.error) throw result.error;
    return result.data;
};

export const fetchColumnsByTableId = async (table_id: string): Promise<ColumnOption[]> => {
    // For now, return dummy data to prevent errors
    return [
        { id: '1', name: 'id' },
        { id: '2', name: 'name' },
        { id: '3', name: 'email' },
        { id: '4', name: 'created_at' }
    ];
};

// Add missing functions for compatibility
export const fetchConnectionById = async (id: string) => {
    const { data, error } = await supabase.from('connections').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

export const createConnection = async (connection: any) => {
    const { data, error } = await supabase.from('connections').insert(connection).select().single();
    if (error) throw error;
    return data;
};

export const updateConnection = async (id: string, updates: any) => {
    const { data, error } = await supabase.from('connections').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

// Function to get connection with decrypted config (for backend use)
export const getConnectionWithDecryptedConfig = async (connectionId: string) => {
    const { data, error } = await supabase
        .rpc('get_connection_with_decrypted_config', { connection_id: connectionId });

    if (error) {
        throw error;
    }

    return data?.[0] || null;
};

// Function to get user connections with decrypted configs
export const getUserConnectionsWithDecryptedConfigs = async (userId: string) => {
    const { data, error } = await supabase
        .rpc('get_user_connections_with_decrypted_configs', { user_uuid: userId });

    if (error) {
        throw error;
    }

    return data || [];
};