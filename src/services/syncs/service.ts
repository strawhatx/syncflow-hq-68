import { supabase } from "@/integrations/supabase/client";
import { PostgresSync, SupabaseSync, Sync } from "@/types/sync";
import { User } from "@supabase/supabase-js";

// Map database row to Sync type
const mapDbRowToSync = (row: any): PostgresSync | SupabaseSync => {
  return {
    id: row.id,
    name: row.name,
    stage: row.stage || 'accounts',
    is_active: row.is_active || false,
    created_at: row.created_at || '',
    updated_at: row.updated_at || '',
    user_id: row.user_id || '',
    config: row.config || {}
  };
};

export const fetchSyncs = async (): Promise<Sync[]> => {
  const { data, error } = await supabase
    .from('syncs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbRowToSync);
};

export const fetchSyncsByUserId = async (userId: string): Promise<Sync[]> => {
  if (!userId) return [];
  
  const { data, error } = await supabase
    .from('syncs')
    .select('*')
    .order('created_at', { ascending: false })
    .eq('user_id', userId);

  if (error) throw error;
  return (data || []).map(mapDbRowToSync);
};

export const fetchSyncById = async (id: string): Promise<PostgresSync | SupabaseSync | null> => {
  const { data, error } = await supabase
    .from('syncs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbRowToSync(data) : null;
};

export const createInitialSync = async (user: User): Promise<any> => {
  if (!user?.id) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('syncs')
    .insert({
      name: `New Sync ${new Date().toLocaleDateString()}`,
      user_id: user.id,
      config: { stage: 'accounts' }
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const saveSync = async (id: string, updates: any): Promise<void> => {
  const { error } = await supabase
    .from('syncs')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};