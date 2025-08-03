import { useSourceDatabases, useDestinationDatabases } from "../hooks/useDataSources";

interface UseDatabaseSelectionProps {
    connection: string;
    database: string | undefined;
    setDatabase: (id: string) => void;
    side: "source" | "destination";
}

export function useDatabaseSelection(props: UseDatabaseSelectionProps) {
    const { connection, database, setDatabase, side } = props;

    // Fetch available databases for the selected account
    const dbHook = side === "source"
        ? useSourceDatabases(connection)
        : useDestinationDatabases(connection);

    return {
        options: dbHook.data || [],
        isLoading: dbHook.isLoading,
        database,
        setDatabase,
    };
}
