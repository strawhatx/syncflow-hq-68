import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { createInitialSync, fetchSyncsByUserId } from "@/services/syncs/service";
import { SyncStage, SyncStatus } from "@/types/sync";

export type Sync = {
  id: string;
  name: string;
  lastSync?: string;
  source?: any;
  destination?: any;
  entityCount?: number;
  stage?: SyncStage;
  status?: SyncStatus;
};

const useSyncs = (search: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: syncs = [], isLoading } = useQuery({
    queryKey: ["syncs"],
    queryFn: () => fetchSyncsByUserId(user?.id),
  });

  const createSyncMutation = useMutation({
    mutationFn: () => createInitialSync(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["syncs"] });
      navigate(`/syncs/edit/${data.id}`);
    },
  });

  const filteredSyncs = Array.isArray(syncs)
    ? syncs.filter(sync =>
        (sync.name || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return {
    syncs,
    isLoading,
    createSyncMutation,
    filteredSyncs,
  };
};

export default useSyncs; 