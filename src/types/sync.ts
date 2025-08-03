// Simplified types for the focused Airtable <-> Postgres sync tool

export type SyncDirection = 'airtable-to-postgres' | 'postgres-to-airtable' | 'two-way';

export type SyncStatus = 'draft' | 'active' | 'paused' | 'error';

export type LogStatus = 'success' | 'error' | 'partial';

export interface SyncFieldMapping {
  id: string;
  sync_id: string;
  airtable_field_name: string;
  postgres_field_name: string;
  created_at: string;
}

export interface SyncLog {
  id: string;
  sync_id: string;
  timestamp: string;
  direction: Exclude<SyncDirection, 'two-way'>;
  status: LogStatus;
  records_inserted: number;
  records_updated: number;
  records_skipped: number;
  duration_ms: number | null;
  error_message: string | null;
  created_at: string;
}
export interface PostgreSQLConfig {
  connection_id: string;
  database_id: string;
  table_id: string;
}

export interface AirtableConfig {
  connection_id: string;
  base_id: string;
  table_id: string;
}

export interface Sync {
  id: string;
  name: string;
  config: {
    postgresql?: PostgreSQLConfig;
    airtable?: AirtableConfig;
    auto_sync_enabled: boolean;
    sync_interval_minutes: number;
    sync_direction: SyncDirection;
  last_sync_at: string | null;
  } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
}