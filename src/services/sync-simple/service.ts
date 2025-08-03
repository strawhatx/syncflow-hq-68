import { supabase } from "@/integrations/supabase/client";
import { Sync, SyncLog, SyncFieldMapping, SyncDirection, LogStatus } from "@/types/sync";

export const syncService = {
  // Get all syncs for the current user
  async getUserSyncs(): Promise<Sync[]> {
    const { data, error } = await supabase
      .from('syncs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(sync => ({
      ...sync,
      config: sync.config as Sync['config'],
      sync_direction: sync.sync_direction as SyncDirection,
      airtable_token: sync.airtable_token as string | null,
      airtable_base_id: sync.airtable_base_id as string | null,
      airtable_table_name: sync.airtable_table_name as string | null,
      postgres_connection_string: sync.postgres_connection_string as string | null,
      postgres_table_name: sync.postgres_table_name as string | null,
      last_sync_at: sync.last_sync_at as string | null,
      created_at: sync.created_at as string,
      updated_at: sync.updated_at as string,
      is_active: sync.is_active as boolean,
      sync_interval_minutes: sync.sync_interval_minutes as number,
      user_id: sync.user_id as string
    }));
  },

  // Get a specific sync by ID
  async getSync(id: string): Promise<Sync | null> {
    const { data, error } = await supabase
      .from('syncs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;
    
    return {
      ...data,
      config: data.config as Sync['config'],
      sync_direction: data.sync_direction as SyncDirection,
      airtable_token: data.airtable_token as string | null,
      airtable_base_id: data.airtable_base_id as string | null,
      airtable_table_name: data.airtable_table_name as string | null,
      postgres_connection_string: data.postgres_connection_string as string | null,
      postgres_table_name: data.postgres_table_name as string | null,
      last_sync_at: data.last_sync_at as string | null,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      is_active: data.is_active as boolean,
      sync_interval_minutes: data.sync_interval_minutes as number,
      user_id: data.user_id as string
    };
  },

  // Create a new sync
  async createSync(sync: Partial<Sync>): Promise<Sync> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const insertData = {
      name: sync.name || 'New Sync',
      config: JSON.stringify(sync.config || {
        auto_sync_enabled: true,
        sync_interval_minutes: 5
      }),
      sync_direction: sync.sync_direction || 'two-way',
      sync_interval_minutes: sync.sync_interval_minutes || 5,
      is_active: sync.is_active || false,
      user_id: user.user.id,
      airtable_token: sync.airtable_token || null,
      airtable_base_id: sync.airtable_base_id || null,
      airtable_table_name: sync.airtable_table_name || null,
      postgres_connection_string: sync.postgres_connection_string || null,
      postgres_table_name: sync.postgres_table_name || null
    };

    const { data, error } = await supabase
      .from('syncs')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      config: JSON.parse(data.config as string) as Sync['config'],
      sync_direction: data.sync_direction as SyncDirection,
      airtable_token: data.airtable_token as string | null,
      airtable_base_id: data.airtable_base_id as string | null,
      airtable_table_name: data.airtable_table_name as string | null,
      postgres_connection_string: data.postgres_connection_string as string | null,
      postgres_table_name: data.postgres_table_name as string | null,
      last_sync_at: data.last_sync_at as string | null,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      is_active: data.is_active as boolean,
      sync_interval_minutes: data.sync_interval_minutes as number,
      user_id: data.user_id as string
    };
  },

  // Update a sync
  async updateSync(id: string, updates: Partial<Sync>): Promise<Sync> {
    const updateData: any = { ...updates };
    
    // Convert config to JSON string if provided
    if (updates.config) {
      updateData.config = JSON.stringify(updates.config);
    }

    const { data, error } = await supabase
      .from('syncs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      config: typeof data.config === 'string' ? JSON.parse(data.config) : data.config,
      sync_direction: data.sync_direction as SyncDirection,
      airtable_token: data.airtable_token as string | null,
      airtable_base_id: data.airtable_base_id as string | null,
      airtable_table_name: data.airtable_table_name as string | null,
      postgres_connection_string: data.postgres_connection_string as string | null,
      postgres_table_name: data.postgres_table_name as string | null,
      last_sync_at: data.last_sync_at as string | null,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      is_active: data.is_active as boolean,
      sync_interval_minutes: data.sync_interval_minutes as number,
      user_id: data.user_id as string
    };
  },

  // Delete a sync
  async deleteSync(id: string): Promise<void> {
    const { error } = await supabase
      .from('syncs')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Get sync logs
  async getSyncLogs(syncId: string, limit: number = 20): Promise<SyncLog[]> {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .eq('sync_id', syncId)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map(log => ({
      ...log,
      direction: log.direction as Exclude<SyncDirection, 'two-way'>,
      status: log.status as LogStatus,
      records_inserted: log.records_inserted || 0,
      records_updated: log.records_updated || 0,
      records_skipped: log.records_skipped || 0,
      duration_ms: log.duration_ms as number | null,
      error_message: log.error_message as string | null,
      created_at: log.created_at as string,
      timestamp: log.timestamp as string
    }));
  },

  // Get all recent logs for user's syncs
  async getRecentLogs(limit: number = 10): Promise<(SyncLog & { sync_name: string })[]> {
    const { data, error } = await supabase
      .from('sync_logs')
      .select(`
        *,
        syncs!inner(name)
      `)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []).map((log: any) => ({
      id: log.id,
      sync_id: log.sync_id,
      timestamp: log.timestamp as string,
      direction: log.direction as Exclude<SyncDirection, 'two-way'>,
      status: log.status as LogStatus,
      records_inserted: log.records_inserted || 0,
      records_updated: log.records_updated || 0,
      records_skipped: log.records_skipped || 0,
      duration_ms: log.duration_ms as number | null,
      error_message: log.error_message as string | null,
      created_at: log.created_at as string,
      sync_name: log.syncs.name
    }));
  },

  // Get field mappings for a sync
  async getFieldMappings(syncId: string): Promise<SyncFieldMapping[]> {
    const { data, error } = await supabase
      .from('sync_field_mappings')
      .select('*')
      .eq('sync_id', syncId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  // Save field mappings
  async saveFieldMappings(syncId: string, mappings: Omit<SyncFieldMapping, 'id' | 'sync_id' | 'created_at'>[]): Promise<void> {
    // First delete existing mappings
    await supabase
      .from('sync_field_mappings')
      .delete()
      .eq('sync_id', syncId);

    // Then insert new mappings
    if (mappings.length > 0) {
      const { error } = await supabase
        .from('sync_field_mappings')
        .insert(
          mappings.map(mapping => ({
            ...mapping,
            sync_id: syncId
          }))
        );

      if (error) throw error;
    }
  },

  // Trigger a manual sync
  async triggerSync(syncId: string, direction?: 'airtable-to-postgres' | 'postgres-to-airtable'): Promise<void> {
    // This would typically call an edge function to perform the sync
    // For now, we'll just update the last_sync_at timestamp
    await this.updateSync(syncId, {
      last_sync_at: new Date().toISOString()
    });
  }
};