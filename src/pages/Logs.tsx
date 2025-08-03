import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowRightLeft,
  ArrowRight,
  ArrowLeft,
  Database,
  Activity
} from 'lucide-react';
import { syncService } from '@/services/sync-simple/service';
import { SyncDirection, SyncLog } from '@/types/sync';
import { formatDistanceToNow, format } from 'date-fns';

export default function LogsPage() {
  // Fetch all logs (not just recent ones)
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['all-logs'],
    queryFn: () => syncService.getRecentLogs(100) // Get more logs for the dedicated page
  });

  const getLogStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Success</Badge>;
      case 'error': return <Badge variant="destructive">Error</Badge>;
      case 'partial': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Partial</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDirectionIcon = (direction: SyncDirection) => {
    switch (direction) {
      case 'airtable-to-postgres': return <ArrowRight className="h-4 w-4" />;
      case 'postgres-to-airtable': return <ArrowLeft className="h-4 w-4" />;
      case 'two-way': return <ArrowRightLeft className="h-4 w-4" />;
    }
  };

  const getDirectionLabel = (direction: SyncDirection) => {
    switch (direction) {
      case 'airtable-to-postgres': return 'Airtable → Postgres';
      case 'postgres-to-airtable': return 'Postgres → Airtable';
      case 'two-way': return 'Two-way';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 animate-spin" />
          <span>Loading logs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sync Logs</h1>
          <p className="text-muted-foreground">
            Complete history of all sync operations
          </p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Database className="h-3 w-3" />
          <span>{logs.length} total logs</span>
        </Badge>
      </div>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            All Sync Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <Alert>
              <AlertDescription>
                No sync logs found. Sync operations will appear here once they start running.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getLogStatusIcon(log.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{log.sync_name}</h3>
                          {getStatusBadge(log.status)}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center space-x-1">
                            {getDirectionIcon(log.direction as SyncDirection)}
                            <span>{getDirectionLabel(log.direction as SyncDirection)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(new Date(log.timestamp), 'MMM d, yyyy h:mm:ss a')}</span>
                          </div>
                          <span>({formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })})</span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Inserted:</span>
                            <span className="ml-2 font-medium text-green-600">{log.records_inserted}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Updated:</span>
                            <span className="ml-2 font-medium text-blue-600">{log.records_updated}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Skipped:</span>
                            <span className="ml-2 font-medium text-yellow-600">{log.records_skipped}</span>
                          </div>
                        </div>

                        {log.error_message && (
                          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-sm text-red-800">
                              <span className="font-medium">Error:</span> {log.error_message}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right text-sm text-muted-foreground">
                      <div className="font-medium">
                        {log.records_inserted + log.records_updated} total records
                      </div>
                      <div>
                        {log.duration_ms ? `${log.duration_ms}ms` : 'Unknown duration'}
                      </div>
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