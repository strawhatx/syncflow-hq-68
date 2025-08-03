import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  Play, 
  Settings, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { syncService } from '@/services/sync-simple/service';
import { Sync, SyncDirection, SyncLog } from '@/types/sync-simple';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function SyncDashboard() {
  const [selectedSync, setSelectedSync] = useState<Sync | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's syncs
  const { data: syncs = [], isLoading: syncsLoading } = useQuery({
    queryKey: ['syncs'],
    queryFn: syncService.getUserSyncs
  });

  // Fetch recent logs
  const { data: recentLogs = [] } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => syncService.getRecentLogs(10)
  });

  // Create sync mutation
  const createSyncMutation = useMutation({
    mutationFn: (sync: Partial<Sync>) => syncService.createSync(sync),
    onSuccess: (newSync) => {
      queryClient.invalidateQueries({ queryKey: ['syncs'] });
      setSelectedSync(newSync);
      setIsCreating(false);
      toast({ title: "Sync created successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error creating sync", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Update sync mutation
  const updateSyncMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Sync> }) => 
      syncService.updateSync(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncs'] });
      toast({ title: "Sync updated successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error updating sync", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Trigger sync mutation
  const triggerSyncMutation = useMutation({
    mutationFn: ({ syncId, direction }: { syncId: string; direction?: 'airtable-to-postgres' | 'postgres-to-airtable' }) => 
      syncService.triggerSync(syncId, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['syncs'] });
      queryClient.invalidateQueries({ queryKey: ['recent-logs'] });
      toast({ title: "Sync triggered successfully!" });
    },
    onError: (error) => {
      toast({ 
        title: "Error triggering sync", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Auto-select first sync if none selected
  useEffect(() => {
    if (!selectedSync && syncs.length > 0) {
      setSelectedSync(syncs[0]);
    }
  }, [syncs, selectedSync]);

  const handleCreateSync = () => {
    const newSync: Partial<Sync> = {
      name: 'New Sync',
      sync_direction: 'two-way',
      sync_interval_minutes: 5,
      is_active: false
    };
    createSyncMutation.mutate(newSync);
  };

  const handleUpdateSync = (updates: Partial<Sync>) => {
    if (!selectedSync) return;
    updateSyncMutation.mutate({ id: selectedSync.id, updates });
  };

  const handleTriggerSync = (direction?: 'airtable-to-postgres' | 'postgres-to-airtable') => {
    if (!selectedSync) return;
    triggerSyncMutation.mutate({ syncId: selectedSync.id, direction });
  };

  const getStatusBadge = (sync: Sync) => {
    if (!sync.is_active) return <Badge variant="secondary">Inactive</Badge>;
    if (!sync.airtable_token || !sync.postgres_connection_string) return <Badge variant="outline">Not Configured</Badge>;
    return <Badge variant="default">Active</Badge>;
  };

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDirectionIcon = (direction: SyncDirection) => {
    switch (direction) {
      case 'airtable-to-postgres': return <ArrowRight className="h-4 w-4" />;
      case 'postgres-to-airtable': return <ArrowLeft className="h-4 w-4" />;
      case 'two-way': return <ArrowRightLeft className="h-4 w-4" />;
    }
  };

  if (syncsLoading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sync Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your Airtable ↔ Postgres synchronization
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
          <Plus className="h-4 w-4 mr-2" />
          New Sync
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sync List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Your Syncs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {syncs.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No syncs yet. Create your first sync to get started!
                </AlertDescription>
              </Alert>
            ) : (
              syncs.map((sync) => (
                <div
                  key={sync.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSync?.id === sync.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedSync(sync)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{sync.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        {getDirectionIcon(sync.sync_direction)}
                        <span className="ml-1">{sync.sync_direction}</span>
                      </div>
                    </div>
                    {getStatusBadge(sync)}
                  </div>
                </div>
              ))
            )}
            
            {isCreating && (
              <div className="p-3 rounded-lg border border-dashed border-primary bg-primary/5">
                <div className="text-sm text-center text-muted-foreground">
                  Creating new sync...
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sync Configuration */}
        {selectedSync && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Sync Configuration
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleTriggerSync()}
                    disabled={!selectedSync.airtable_token || !selectedSync.postgres_connection_string}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Run Sync
                  </Button>
                  {getStatusBadge(selectedSync)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sync-name">Sync Name</Label>
                  <Input
                    id="sync-name"
                    value={selectedSync.name}
                    onChange={(e) => handleUpdateSync({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sync-direction">Sync Direction</Label>
                  <Select
                    value={selectedSync.sync_direction}
                    onValueChange={(value: SyncDirection) => 
                      handleUpdateSync({ sync_direction: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="two-way">Two-way sync</SelectItem>
                      <SelectItem value="airtable-to-postgres">Airtable → Postgres</SelectItem>
                      <SelectItem value="postgres-to-airtable">Postgres → Airtable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Airtable Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Airtable Configuration</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="airtable-token">Airtable Personal Access Token</Label>
                    <Input
                      id="airtable-token"
                      type="password"
                      placeholder="pat*************************"
                      value={selectedSync.airtable_token || ''}
                      onChange={(e) => handleUpdateSync({ airtable_token: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="airtable-base-id">Base ID</Label>
                      <Input
                        id="airtable-base-id"
                        placeholder="app**************"
                        value={selectedSync.airtable_base_id || ''}
                        onChange={(e) => handleUpdateSync({ airtable_base_id: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="airtable-table-name">Table Name</Label>
                      <Input
                        id="airtable-table-name"
                        placeholder="Table 1"
                        value={selectedSync.airtable_table_name || ''}
                        onChange={(e) => handleUpdateSync({ airtable_table_name: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Postgres Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Postgres Configuration</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postgres-connection">Connection String</Label>
                    <Textarea
                      id="postgres-connection"
                      placeholder="postgresql://user:password@host:port/database"
                      value={selectedSync.postgres_connection_string || ''}
                      onChange={(e) => handleUpdateSync({ postgres_connection_string: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postgres-table-name">Table Name</Label>
                    <Input
                      id="postgres-table-name"
                      placeholder="users"
                      value={selectedSync.postgres_table_name || ''}
                      onChange={(e) => handleUpdateSync({ postgres_table_name: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Sync Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <Alert>
              <AlertDescription>
                No sync logs yet. Run a sync to see activity here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getLogStatusIcon(log.status)}
                    <div>
                      <div className="font-medium">{log.sync_name}</div>
                      <div className="text-sm text-muted-foreground flex items-center space-x-2">
                        {getDirectionIcon(log.direction as SyncDirection)}
                        <span>{log.direction}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {log.records_inserted + log.records_updated} records
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {log.duration_ms ? `${log.duration_ms}ms` : 'Unknown duration'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}