import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchConnectors } from "@/services/connector/service";
import { fetchSyncById, saveSync } from "@/services/syncs/service";
import { produce } from "immer";
import { ConnectorWithConnections } from "@/types/connectors";
import { defaultCreateSync, Sync, SyncProvider as SyncProviderType } from "@/types/sync";

const STAGES = ["accounts", "data-sources", "postgresql", "airtable", "mappings", "filters", "ready"];

interface SyncContextType {
    syncConfig: Sync;
    connectors: ConnectorWithConnections[] | undefined;
    selectedTableMappingId: string | null;
    setSelectedTableMappingId: (id: string | null) => void;

    setTitle: (title: string) => void;
    // setAccount: (value: string, field: AccountSide) => void;
    // setDataSource: (value: string, field: DataSourceSide) => void;
    setConnection: (connectionId: string, provider: SyncProviderType) => void;
    setDatabase: (databaseId: string, provider: SyncProviderType) => void;
    setTable: (tableId: string, provider: SyncProviderType) => void;
    setAirtableConnection: (connectionId: string) => void;
    setAirtableBase: (baseId: string) => void;
    setAirtableTable: (tableId: string) => void;

    // setTableMappings: (value: SyncTableMapping[]) => void;
    setStage: (stage: string) => void;
    saveAndAdvance: () => Promise<{ success: boolean; errors?: string[] }>;
    save: () => Promise<void>;
    reset: () => void;
    activate: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { id } = useParams();
    const { user } = useAuth();
    const [syncConfig, setSyncConfig] = useState<Sync>()
    const [selectedTableMappingId, setSelectedTableMappingId] = useState<string | null>(null);

    // get the connectors
    const { data: connectors } = useQuery({ queryKey: ['connectors'], queryFn: fetchConnectors });

    useEffect(() => {
        if (!id) return;

        //get the sync from the database
        fetchSyncById(id).then(sync => setSyncConfig(sync));
    }, [id]);

    // set the title
    const setTitle = (title: string) => {
        setSyncConfig({ ...syncConfig, name: title });
    };

    // set App connection
    const setConnection = (connectionId: string, provider: "postgresql" | "supabase") => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config?.[provider]) {
                    draft.config[provider].connection_id = connectionId;
                } else {
                    draft.config[provider] = { connection_id: connectionId, database_id: '', table_id: '' };
                }
            })
        );
    };

    // set App database
    const setDatabase = (databaseId: string, provider: "postgresql" | "supabase") => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config?.[provider]) {
                    draft.config[provider].database_id = databaseId;
                } else {
                    draft.config[provider] = { connection_id: '', database_id: databaseId, table_id: '' };
                }
            })
        );
    };

    // set App table
    const setTable = (tableId: string, provider: "postgresql" | "supabase") => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config?.[provider]) {
                    draft.config[provider].table_id = tableId;
                } else {
                    draft.config[provider] = { connection_id: '', database_id: '', table_id: tableId };
                }
            })
        );
    };


    // set Airtable connection
    const setAirtableConnection = (connectionId: string) => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config?.airtable) {
                    draft.config.airtable.connection_id = connectionId;
                } else {
                    draft.config.airtable = { connection_id: connectionId, base_id: '', table_id: '' };
                }
            })
        );
    };

    // set Airtable base
    const setAirtableBase = (baseId: string) => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config?.airtable) {
                    draft.config.airtable.base_id = baseId;
                } else {
                    draft.config.airtable = { connection_id: '', base_id: baseId, table_id: '' };
                }
            })
        );
    };

    // set Airtable table
    const setAirtableTable = (tableId: string) => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config?.airtable) {
                    draft.config.airtable.table_id = tableId;
                } else {
                    draft.config.airtable = { connection_id: '', base_id: '', table_id: tableId };
                }
            })
        );
    };

    // set the table mapping
    // const setTableMappings = (value: SyncTableMapping[]) => {
    //    setSyncConfig(current =>
    //        produce(current, draft => {
    //            draft.config.schema.table_mappings = value;
    //        })
    //    );
    //};

    // set the stage
    const setStage = (stage: string) => {
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config) {
                    draft.stage = stage;
                }
            })
        );
    };

    // reset the sync config
    const reset = () => {
        const newSync = defaultCreateSync(user);
        setSyncConfig(prev => ({
            ...prev,
            config: newSync.config,
        }));

        // save the sync config
        saveSync(syncConfig.id, syncConfig);
    };

    // activate the sync
    const activate = async () => {
        if (!syncConfig) return;

        const updatedSync = {
            ...syncConfig,
            status: 'active' as const
        };

        setSyncConfig(updatedSync);
        return saveSync(syncConfig.id, updatedSync);
    };

    // save the sync config
    const save = async () => {
        if (!syncConfig) return;
        await saveSync(syncConfig.id, syncConfig);
    };

    // Save and advance, but only if valid
    const saveAndAdvance = async (): Promise<{ success: boolean; errors?: string[] }> => {
        const { isValid, errors } = validateCurrentStage();
        if (!isValid) return { success: false, errors };

        // Optionally advance stage before saving
        const nextStage = getNextStage();
        setSyncConfig(current =>
            produce(current, draft => {
                if (draft.config) {
                    draft.stage = nextStage;
                }
            })
        );

        await saveSync(syncConfig.id, { ...syncConfig, config: { ...syncConfig.config, stage: nextStage } });
        return { success: true };
    };

    // private functions

    // Stage validators
    const stageValidators: Record<string, () => string[]> = {
        postgresql: () => {
            const errors: string[] = [];
            if (!syncConfig?.config?.postgresql?.connection_id) errors.push("PostgreSQL connection is required");
            if (!syncConfig?.config?.postgresql?.database_id) errors.push("PostgreSQL database is required");
            if (!syncConfig?.config?.postgresql?.table_id) errors.push("PostgreSQL table is required");
            return errors;
        },
        supabase: () => {
            const errors: string[] = [];
            if (!syncConfig?.config?.supabase?.connection_id) errors.push("Supabase connection is required");
            if (!syncConfig?.config?.supabase?.database_id) errors.push("Supabase database is required");
            if (!syncConfig?.config?.supabase?.table_id) errors.push("Supabase table is required");
            return errors;
        },
        airtable: () => {
            const errors: string[] = [];
            if (!syncConfig?.config?.airtable?.connection_id) errors.push("Airtable connection is required");
            if (!syncConfig?.config?.airtable?.base_id) errors.push("Airtable base is required");
            if (!syncConfig?.config?.airtable?.table_id) errors.push("Airtable table is required");
            return errors;
        },
        mappings: () => [],
        filters: () => [],
        ready: () => [],
    };

    const getStage = (): string => syncConfig?.stage || "accounts";

    const getNextStage = (): string => {
        const idx = STAGES.indexOf(getStage());
        return idx < STAGES.length - 1 ? STAGES[idx + 1] : STAGES[idx];
    };

    const validateCurrentStage = (): { isValid: boolean; errors: string[] } => {
        const stage = getStage();
        const errors = stageValidators[stage]();
        return { isValid: errors.length === 0, errors };
    };

    return (
        <SyncContext.Provider value={{
            setTitle,
            syncConfig,
            connectors,
            selectedTableMappingId,
            setSelectedTableMappingId,
            // setAccount,
            // setDataSource,
            setConnection,
            setDatabase,
            setTable,
            setAirtableConnection,
            setAirtableBase,
            setAirtableTable,
            // setTableMappings,
            setStage,
            saveAndAdvance,
            save,
            reset,
            activate: async () => {
                await activate();
            }
        }}>
            {children}
        </SyncContext.Provider>
    );
}

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error("useSync must be used within a SyncProvider");
    }
    return context;
}

