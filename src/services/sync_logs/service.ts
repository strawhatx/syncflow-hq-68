import { supabase } from "@/integrations/supabase/client";
import { SyncLog } from "@/types/sync";

export const fetchLogs = async (): Promise<SyncLog[]> => {
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false });
  
    if (error) throw error;
    
    return data as SyncLog[];
  };
  
  export const fetchLogsBySync = async (syncId: string): Promise<SyncLog[]> => {
    if (!syncId) return [];
    
    const { data, error } = await supabase
      .from('sync_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .eq('sync_id', syncId);
  
    if (error) throw error;
    
    return data as SyncLog[];
  };

  export const getRecentLogs = async (limit: number = 100): Promise<SyncLog[]> => {
    const { data, error } = await supabase
      .from('sync_logs')
      .select("*")
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as SyncLog[];
  };