import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ConnectorConnectModal from '@/components/connector/ConnectorConnectModal';
import { Connector } from '@/types/connectors';
import { useSync } from '@/contexts/SyncContext';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { CustomSelectButton } from '@/components/ui_custom/CustomSelectButton';
import { useConnectionSelection } from '../hooks/useConnectionSelection';
import { useDatabaseSelection } from '../hooks/useDatasourceSelection';
import { useTableSelection } from '../hooks/useTableSelection';
import { CustomSelect } from '@/components/ui_custom/CustomSelect';

export default function SupabaseStep({ next }: { next: () => void }) {
  const { 
    syncConfig, 
    connectors, 
    setConnection: setSupabaseConnection, 
    setDatabase: setSupabaseDatabase, 
    setTable: setSupabaseTable, 
    saveAndAdvance 
  } = useSync();
  const queryClient = useQueryClient();
  const [connector, setConnector] = useState<Connector | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { connection, setConnection, connections } = useConnectionSelection({
    connectors,
    provider: 'supabase',
    connection: syncConfig?.config?.supabase?.connection_id,
    setConnection: (id: string) => setSupabaseConnection(id, 'supabase')
  });

  const { database, setDatabase, options: databases } = useDatabaseSelection({
    connection: syncConfig?.config?.supabase?.connection_id,
    database: syncConfig?.config?.supabase?.database_id,
    setDatabase: (id: string) => setSupabaseDatabase(id, 'supabase'),
    side: "source"
  });

  const { table, setTable, options: tables } = useTableSelection({
    database: syncConfig?.config?.postgresql?.database_id,
    table: syncConfig?.config?.postgresql?.table_id,
    setTable: (id: string) => setSupabaseTable(id, 'supabase'),
    provider: 'postgresql',
    side: 'source'
  });

  const handleConnectionCreated = (newConnection: any) => {
    // Invalidate and refetch the connectors query to get updated connections
    queryClient.invalidateQueries({ queryKey: ['connectors'] });

    setConnection(newConnection.id);
  };

  const onCreateNew = () => {
    const supabaseConnector = connectors?.find(c => c.provider === 'supabase');
    setConnector(supabaseConnector);
  };

  const handleNext = async () => {
    if (!connection || !database || !table) {
      toast({
        title: 'Error',
        description: 'Please select a connection, database, and table',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSupabaseConnection(connection, 'supabase');
      setSupabaseDatabase(database, 'supabase');
      setSupabaseTable(table, 'supabase');

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

  return (
    <div className="space-y-6">
      {/* Connection Selection */}
      <div>
        <div className="space-y-4">
          <CustomSelectButton
            value={connection || ""}
            onValueChange={(value: any) => setConnection(value)}
            options={connections?.map((conn: { id: any; name: any; }) => ({
              id: conn.id,
              name: conn.name,
              icon: "supabase-icon",
            })) || []}
            placeholder={`Select connection`}
            isLoading={false}
            onCreateNew={onCreateNew}
          />
        </div>
      </div>

      {/* Database Selection */}
      {connection && (
        <CustomSelect
          value={database || ""}
          onValueChange={(value: any) => setDatabase(value)}
          options={databases?.map((db: { id: any; name: any; }) => ({
            id: db.id,
            name: db.name,
            icon: "supabase-icon",
          })) || []}
          placeholder={`Select database`}
          isLoading={false}
        />
      )}

      {/* Table Selection */}
      {database && (
        <CustomSelect
          value={table || ""}
          onValueChange={(value: any) => setTable(value)}
          options={tables?.map((db: { id: any; name: any; }) => ({
            id: db.id,
            name: db.name,
          })) || []}
          placeholder={`Select table`}
          isLoading={false}
        />
      )}

      {/* Next Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={!connection || !database || !table || isLoading}
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