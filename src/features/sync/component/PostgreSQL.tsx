import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Table, Plus, Check } from 'lucide-react';
import ConnectorConnectModal from '@/components/connector/ConnectorConnectModal';
import { Connector } from '@/types/connectors';
import { useSync } from '@/contexts/SyncContext';
import { fetchConnectors } from '@/services/connector/service';
import { fetchConnectionDatabases, fetchTablesByDatabaseId } from '@/services/connections/service';
import { toast } from '@/hooks/use-toast';

interface Database {
  id: string;
  name: string;
  connection_id: string;
}

interface TableOption {
  id: string;
  name: string;
  database_id: string;
}

export default function PostgreSQLStep({ next }: { next: () => void }) {
  const { syncConfig, connectors, setPostgreSQLConnection, setPostgreSQLDatabase, setPostgreSQLTable, saveAndAdvance } = useSync();
  const [connector, setConnector] = useState<Connector | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [databases, setDatabases] = useState<Database[]>([]);
  const [tables, setTables] = useState<TableOption[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load PostgreSQL connector and existing connections
  useEffect(() => {
    const loadConnectorAndConnections = async () => {
      try {
        const postgresConnector = connectors?.find(c => c.provider === 'postgresql');
        if (postgresConnector) {
          setConnector(postgresConnector);
          setConnections(postgresConnector.connections || []);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load PostgreSQL connector',
          variant: 'destructive',
        });
      }
    };

    loadConnectorAndConnections();
  }, []);

  // Load databases when connection is selected
  useEffect(() => {
    if (selectedConnection) {
      loadDatabases(selectedConnection);
    }
  }, [selectedConnection]);

  // Load tables when database is selected
  useEffect(() => {
    if (selectedDatabase) {
      loadTables(selectedDatabase);
    }
  }, [selectedDatabase]);

  const loadDatabases = async (connectionId: string) => {
    try {
      setIsLoading(true);
      const databases = await fetchConnectionDatabases(connectionId);
      setDatabases(databases);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load databases',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTables = async (databaseId: string) => {
    try {
      setIsLoading(true);
      const tables = await fetchTablesByDatabaseId(databaseId, 'postgresql');
      setTables(tables);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load tables',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionCreated = (newConnection: any) => {
    setConnections(prev => [...prev, newConnection]);
    setSelectedConnection(newConnection.id);
    setPostgreSQLConnection(newConnection.id);
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

  const selectedConnectionData = connections.find(c => c.id === selectedConnection);
  const selectedDatabaseData = databases.find(d => d.id === selectedDatabase);
  const selectedTableData = tables.find(t => t.id === selectedTable);

  return (
    <div className="space-y-6">
      {/* Connection Selection */}
      <div>
        <div className="space-y-4">
          {connections.length > 0 ? (
            <div className="space-y-2">
              <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a connection" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((connection) => (
                    <SelectItem key={connection.id} value={connection.id}>
                      {connection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedConnectionData && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedConnectionData.name}</Badge>
                  <Check className="w-4 h-4 text-green-500" />
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No PostgreSQL connections found
            </div>
          )}

          <Button
            onClick={() => setConnector(connector)}
            className="w-full"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Connection
          </Button>
        </div>
      </div>

      {/* Database Selection */}
      {selectedConnection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database
            </CardTitle>
            <CardDescription>
              Select the database you want to sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedDatabase} onValueChange={setSelectedDatabase}>
              <SelectTrigger>
                <SelectValue placeholder="Select a database" />
              </SelectTrigger>
              <SelectContent>
                {databases.map((database) => (
                  <SelectItem key={database.id} value={database.id}>
                    {database.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedDatabaseData && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{selectedDatabaseData.name}</Badge>
                <Check className="w-4 h-4 text-green-500" />
              </div>
            )}
          </CardContent>
        </Card>
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