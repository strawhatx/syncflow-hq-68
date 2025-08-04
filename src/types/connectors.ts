import { Json } from "@/integrations/supabase/types";

export type ConnectorType = 'oauth' | 'api_key';
export type ConnectorProvider =
  'supabase' |
  'airtable' |
  'google_sheets' |
  'notion' |
  'postgresql' |
  'mongodb' |
  'mysql' |
  'aws' |
  'sqlserver';

export interface ConnectorConfig {
  required_fields: string[];
  optional_fields: string[];
  description: string;
  icon: string;
}

// Export this interface so it can be imported
export interface ConnectorWithConnections extends Connector { 
  connections: Connection[];
}

export interface Connector {
  id: string;
  name: string;
  type: ConnectorType;
  provider: ConnectorProvider;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Connection {
  id: string;
  connector_id: string;
  name: string;
  user_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ColumnOption {
  id: string;
  name: string;
}

export interface TableOption {         
  id: string;
  name: string;
  columns: ColumnOption[];
  icon: string;
}