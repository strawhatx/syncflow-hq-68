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

interface Base {
  id: string;
  name: string;
  connection_id: string;
}

interface TableOption {
  id: string;
  name: string;
  database_id: string;
}

export default function AirtableStep({ next }: { next: () => void }) {
  const { syncConfig, setAirtableConnection, setAirtableBase, setAirtableTable, saveAndAdvance } = useSync();
  const [connector, setConnector] = useState<Connector | null>(null);
  const [connections, setConnections] = useState<any[]>([]);
  const [bases, setBases] = useState<Base[]>([]);
  const [tables, setTables] = useState<TableOption[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Load Airtable connector and existing connections
  useEffect(() => {
    const loadConnectorAndConnections = async () => {
      try {
        const connectors = await fetchConnectors();
        const airtableConnector = connectors.find(c => c.provider === 'airtable');
        if (airtableConnector) {
          setConnector(airtableConnector);
          setConnections(airtableConnector.connections || []);
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load Airtable connector',
          variant: 'destructive',
        });
      }
    };

    loadConnectorAndConnections();
  }, []);

  // Load bases when connection is selected
  useEffect(() => {
    if (selectedConnection) {
      loadBases(selectedConnection);
    }
  }, [selectedConnection]);

  // Load tables when base is selected
  useEffect(() => {
    if (selectedBase) {
      loadTables(selectedBase);
    }
  }, [selectedBase]);

  const loadBases = async (connectionId: string) => {
    try {
      setIsLoading(true);
      const bases = await fetchConnectionDatabases(connectionId);
      setBases(bases);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load Airtable bases',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadTables = async (baseId: string) => {
    try {
      setIsLoading(true);
      const tables = await fetchTablesByDatabaseId(baseId, 'airtable');
      setTables(tables);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load Airtable tables',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectionCreated = (newConnection: any) => {
    setConnections(prev => [...prev, newConnection]);
    setSelectedConnection(newConnection.id);
    setAirtableConnection(newConnection.id);
  };

  const handleNext = async () => {
    if (!selectedConnection || !selectedBase || !selectedTable) {
      toast({
        title: 'Error',
        description: 'Please select a connection, base, and table',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAirtableConnection(selectedConnection);
      setAirtableBase(selectedBase);
      setAirtableTable(selectedTable);
      
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
  const selectedBaseData = bases.find(b => b.id === selectedBase);
  const selectedTableData = tables.find(t => t.id === selectedTable);

  return (
    <div className="space-y-6">
      {/* Connection Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="/svg/airtable-icon.svg" alt="Airtable" className="w-5 h-5" />
            Airtable Connection
          </CardTitle>
          <CardDescription>
            Select an existing Airtable connection or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              No Airtable connections found
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
        </CardContent>
      </Card>

      {/* Base Selection */}
      {selectedConnection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Airtable Base
            </CardTitle>
            <CardDescription>
              Select the Airtable base you want to sync
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedBase} onValueChange={setSelectedBase}>
              <SelectTrigger>
                <SelectValue placeholder="Select a base" />
              </SelectTrigger>
              <SelectContent>
                {bases.map((base) => (
                  <SelectItem key={base.id} value={base.id}>
                    {base.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedBaseData && (
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{selectedBaseData.name}</Badge>
                <Check className="w-4 h-4 text-green-500" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table Selection */}
      {selectedBase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Table className="w-5 h-5" />
              Airtable Table
            </CardTitle>
            <CardDescription>
              Select the Airtable table you want to sync
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
          disabled={!selectedConnection || !selectedBase || !selectedTable || isLoading}
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