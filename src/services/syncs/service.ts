import { supabase } from "@/integrations/supabase/client";
import { Sync, defaultCreateSync } from "@/types/sync";
import { Team } from "@/types/team";
import { User } from "@supabase/supabase-js";

// Map database row to Sync type
const mapDbRowToSync = (row: any): Sync => {
  return {
    id: row.id,
    name: row.name,
    source_id: row.source_id || '',
    destination_id: row.destination_id || '',
    created_by: row.user_id || '',
    team_id: row.team_id || '',
    config: row.config || {},
    status: row.status || 'draft'
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

export const fetchSyncsByTeamId = async (teamId: string): Promise<Sync[]> => {
  if (!teamId) return [];
  
  const { data, error } = await supabase
    .from('syncs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbRowToSync);
};

export const fetchSyncById = async (id: string): Promise<Sync | null> => {
  const { data, error } = await supabase
    .from('syncs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbRowToSync(data) : null;
};

export const createInitialSync = async (user: User, team: Team): Promise<any> => {
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