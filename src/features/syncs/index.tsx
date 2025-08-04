import { useState, useEffect } from "react";
import { useHeaderContent } from "@/contexts/HeaderContentContext";
import HeaderActions from "./components/HeaderActions";
import SyncsGrid from "./components/SyncsGrid";
import NoResults from "./components/NoResults";
import SyncsSkeleton from "./components/SyncsSkeleton";
import SyncTypeSelectionModal, { SyncType } from "@/components/syncs/SyncTypeSelectionModal";
import useSyncs from "./hooks/useSyncs";
import { useToast } from "@/hooks/use-toast";

const Syncs = () => {
    const [search, setSearch] = useState("");
    const [showTypeModal, setShowTypeModal] = useState(false);
    const { isLoading, createSyncMutation, filteredSyncs } = useSyncs(search);
    const { setContent } = useHeaderContent();
    const { toast } = useToast();

    const handleCreateSync = () => {
        setShowTypeModal(true);
    };

    const handleSelectSyncType = (syncType: SyncType) => {
        createSyncMutation.mutate(syncType);
        setShowTypeModal(false);
    };

    const headerContent = (
        <HeaderActions
            search={search}
            setSearch={setSearch}
            onCreate={handleCreateSync}
            isCreating={createSyncMutation.isPending}
        />
    );

    // Effect for setting content
    useEffect(() => {
        setContent(headerContent);
    }, [search, createSyncMutation.isPending, setContent, headerContent]);

    // Effect for showing error toast
    useEffect(() => {
        if (createSyncMutation.isError) {
            toast({
                title: "Error",
                description: "Failed to create sync. Please try again.",
                variant: "destructive",
            });
        }
    }, [createSyncMutation.isError, toast]);

    // Separate effect for cleanup
    useEffect(() => {
        return () => { setContent(null) };
    }, [setContent]);

    return (
        <div>
            {isLoading ? (
                <SyncsSkeleton />
            ) : filteredSyncs.length === 0 ? (
                <NoResults onGetStarted={handleCreateSync} />
            ) : (
                <SyncsGrid key="syncs-grid" syncs={filteredSyncs} />
            )}

            <SyncTypeSelectionModal
                isOpen={showTypeModal}
                onClose={() => setShowTypeModal(false)}
                onSelectType={handleSelectSyncType}
                isCreating={createSyncMutation.isPending}
            />
        </div>
    );
};

export default Syncs;
