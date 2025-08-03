import { useState } from "react";
import { ConnectorProvider, ConnectorWithConnections } from "@/types/connectors";

interface UseConnectionSelectionProps {
  connectors: ConnectorWithConnections[] | undefined;
  provider: ConnectorProvider;
  connection: string | undefined;
  setConnection: (id: string) => void;
}

export const useConnectionSelection = (props: UseConnectionSelectionProps) => {
  const { connectors, provider, connection, setConnection } = props;
  const [database, setDatabase] = useState<string>('');
  const [table, setTable] = useState<string>('');

  // When account changes, update context
  const handleConnectionChange = (newAccountId: string) => {
    setConnection(newAccountId);
  };

  // Get available connections for the selected app
  const connections = connectors?.find(conn => conn.provider === provider)?.connections ?? [];

  return {
    connection,
    setConnection: handleConnectionChange,
    connections,
  };
}
