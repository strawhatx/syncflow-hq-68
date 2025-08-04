// Simplified types for the focused Airtable <-> Postgres sync tool

import { User } from "@supabase/supabase-js";

export type SyncDirection = 'airtable-to-postgres' | 'postgres-to-airtable' | 'airtable-to-supabase' | 'supabase-to-airtable' | 'two-way';
export type SyncStatus = 'draft' | 'active' | 'paused' | 'error';
export type LogStatus = 'success' | 'error' | 'partial';
export type SyncProvider = 'airtable' | 'postgresql' | 'supabase';

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
  stage: string;
  config: {
    airtable: AirtableConfig;
    postgresql?: PostgreSQLConfig;
    supabase?: PostgreSQLConfig; // Same config structure as postgresql
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