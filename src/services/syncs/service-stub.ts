import { Sync } from "@/types/sync";
import { Team } from "@/types/team";
import { User } from "@supabase/supabase-js";

// Stub service - TODO: Implement when proper schema is available
export const fetchSyncs = async (): Promise<Sync[]> => {
  return [];
};

export const fetchSyncsByTeamId = async (teamId: string): Promise<Sync[]> => {
  return [];
};

export const fetchSyncById = async (id: string): Promise<Sync | null> => {
  return null;
};

export const createInitialSync = async (user: User, team: Team): Promise<any> => {
  return { id: "mock-sync-id" };
};

export const saveSync = async (id: string, sync: Partial<Sync>): Promise<void> => {
  console.log(`Would save sync ${id}`, sync);
};