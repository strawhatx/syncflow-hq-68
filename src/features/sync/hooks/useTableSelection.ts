import { useMemo } from "react";
import { useSourceTables, useDestinationTables } from "./useDataSources";
import { ConnectorProvider, ConnectorWithConnections } from "@/types/connectors";

interface UseTableSelectionProps {
    database: string;
    provider: ConnectorProvider;
    table: string | undefined;
    setTable: (id: string) => void;
    side: "source" | "destination";
}

export function useTableSelection(props: UseTableSelectionProps) {
    const { database, provider, table, setTable, side } = props;

    // Fetch available databases for the selected account
    const dbHook = side === "source"
        ? useSourceTables(database, provider)
        : useDestinationTables(database, provider);

    return {
        options: dbHook.data || [],
        isLoading: dbHook.isLoading,
        table,
        setTable,
    };
}
