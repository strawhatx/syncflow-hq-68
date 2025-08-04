// Simplified types for the focused Airtable <-> Postgres sync tool

import { User } from "@supabase/supabase-js";

export type SyncDirection = 'airtable-to-postgres' | 'postgres-to-airtable' | 'airtable-to-supabase' | 'supabase-to-airtable' | 'two-way';
export type SyncStatus = 'draft' | 'active' | 'paused' | 'error' | 'synced';
export type SyncStage = 'accounts' | 'mapping' | 'filter' | 'ready';

// Additional types for filtering and mapping
export interface SyncFilter {
  field_id: string;
  value: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains';
}

export interface SyncTableMapping {
  id?: string;
  source_table_id: string;
  destination_table_id: string;
  direction: 'source-to-destination' | 'destination-to-source' | 'two-way';
  filters?: SyncFilter[];
  field_mappings?: SyncFieldMapping[];
}
export type LogStatus = 'success' | 'error' | 'partial';
export type SyncProvider = 'airtable' | 'postgresql' | 'supabase';

export interface SyncFieldMapping {
  id?: string;
  sync_id?: string;
  airtable_field_name?: string;
  postgres_field_name?: string;
  source_field_id?: string;
  destination_field_id?: string;
  created_at?: string;
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

export interface SyncConfig {
  airtable: AirtableConfig;
  postgresql?: PostgreSQLConfig;
  supabase?: PostgreSQLConfig;
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  sync_direction: SyncDirection;
  last_sync_at: string | null;
  stage?: SyncStage;
  schema?: {
    tableMappings: SyncTableMapping[];
  };
}

export interface Sync {
  id: string;
  name: string;
  stage: string;
  sync_type: 'supabase-to-airtable' | 'postgres-to-airtable';
  config: SyncConfig | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  source_id?: string;
  destination_id?: string;
  status?: SyncStatus;
}

// For compatibility with the syncs feature
export interface PostgresSync extends Sync {}
export interface SupabaseSync extends Sync {}

export const defaultCreateSync = (user: User): Sync => {
  return {
    id: '',
    name: '',
    stage: 'accounts',
    config: {
      airtable: { connection_id: '', base_id: '', table_id: '' },
      auto_sync_enabled: false,
      sync_interval_minutes: 0,
      sync_direction: 'airtable-to-postgres', 
      last_sync_at: null
    },
    is_active: false,
    created_at: '',
    updated_at: '',
    user_id: user.id
  }
}