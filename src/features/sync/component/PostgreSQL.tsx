import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Table, Plus, Check } from 'lucide-react';
import ConnectorConnectModal from '@/components/connector/ConnectorConnectModal';
import { Connector } from '@/types/connectors';
import { useSync } from '@/contexts/SyncContext';
import { fetchConnectionDatabases, fetchTablesByDatabaseId } from '@/services/connections/service';
import { TableOption } from '@/types/connectors';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CustomSelectButton } from '@/components/ui_custom/CustomSelectButton';
import { useConnectionSelection } from '../hooks/useConnectionSelection';
import { useDatabaseSelection } from '../hooks/useDatasourceSelection';

interface Database {
  id: string;
  name: string;
  connection_id: string;
}

export default function PostgreSQLStep({ next }: { next: () => void }) {
  const { syncConfig, connectors, setPostgreSQLConnection, setPostgreSQLDatabase, setPostgreSQLTable, saveAndAdvance } = useSync();
  const queryClient = useQueryClient();
  const [connector, setConnector] = useState<Connector | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection, setConnection, connections } = useConnectionSelection({
    connectors,
    provider: 'postgresql',
    connection: syncConfig?.config?.schema?.source_database_id,
    setConnection: (id: string) => setPostgreSQLConnection(id)
  });

  const { database, setDatabase, options: databases } = useDatabaseSelection({
    connection: syncConfig?.config?.postgresql?.connection_id,
    connectors,
    database: syncConfig?.config?.postgresql?.database_id,
    setDatabase: (id: string) => setPostgreSQLDatabase(id),
    side: "source"
  });

  const { table, setTable, options: tables } = useTableSelection({
    connection: syncConfig?.config?.postgresql?.connection_id,
    database: syncConfig?.config?.postgresql?.database_id,
    table: syncConfig?.config?.postgresql?.table_id,
    setTable: (id: string) => setPostgreSQLTable(id),
  });

  const handleConnectionCreated = (newConnection: any) => {
    // Invalidate and refetch the connectors query to get updated connections
    queryClient.invalidateQueries({ queryKey: ['connectors'] });

    setConnection(newConnection.id);
  };

  const onCreateNew = () => {
    const postgresConnector = connectors?.find(c => c.provider === 'postgresql');
    setConnector(postgresConnector);
  };

  const handleNext = async () => {
    if (!selectedConnection || !selectedDatabase || !selectedTable) {
      toast({
        title: 'Error',
        description: 'Please select a connection, database, and table',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPostgreSQLConnection(selectedConnection);
      setPostgreSQLDatabase(selectedDatabase);
      setPostgreSQLTable(selectedTable);

      await saveAndAdvance();
      next();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const selectedTableData = tables.find(t => t.id === selectedTable);

  return (
    <div className="space-y-6">
      {/* Connection Selection */}
      <div>
        <div className="space-y-4">
          <CustomSelectButton
            value={connection || ""}
            onValueChange={(value: any) => setConnection(value)}
            options={connections?.map((conn: { id: any; account_identifier: any; }) => ({
              id: conn.id,
              name: conn.account_identifier,
            })) || []}
            placeholder={`Select connection`}
            isLoading={false}
            onCreateNew={onCreateNew}
          />
        </div>
      </div>

      {/* Database Selection */}
      {connection && (
        <CustomSelectButton
          value={database || ""}
          onValueChange={(value: any) => setDatabase(value)}
          options={databases?.map((db: { id: any; name: any; }) => ({
            id: db.id,
            name: db.name,
          })) || []}
          placeholder={`Select database`}
          isLoading={false}
          onCreateNew={onCreateNew}
        />
      )}

      {/* Table Selection */}
      {selectedDatabase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="w-5 h-5" />
              Table
            </CardTitle>
            <CardDescription>
              Select the table you want to sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTableData && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{selectedTableData.name}</Badge>
                <Check className="w-4 h-4 text-green-500" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!selectedConnection || !selectedDatabase || !selectedTable || isLoading}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200"
        >
          Next
        </Button>
      </div>

      {/* Connector Connect Modal */}
      {connector && (
        <ConnectorConnectModal
          isOpen={!!connector}
          onClose={() => setConnector(null)}
          connector={connector}
          onConnectionCreated={handleConnectionCreated}
        />
      )}
    </div>
  );
} 