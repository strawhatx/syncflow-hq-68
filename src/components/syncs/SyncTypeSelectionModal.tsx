import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Zap } from "lucide-react";

export type SyncType = 'supabase-to-airtable' | 'postgres-to-airtable';

interface SyncTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: SyncType) => void;
  isCreating: boolean;
}

export default function SyncTypeSelectionModal({ 
  isOpen, 
  onClose, 
  onSelectType, 
  isCreating 
}: SyncTypeSelectionModalProps) {
  const [selectedType, setSelectedType] = useState<SyncType | null>(null);

  const handleConfirm = () => {
    if (selectedType) {
      onSelectType(selectedType);
    }
  };

  const syncTypes = [
    {
      type: 'supabase-to-airtable' as SyncType,
      title: 'Supabase to Airtable',
      description: 'Sync data from your Supabase database to Airtable',
      icon: <Database className="h-8 w-8" />,
      iconBg: 'bg-green-100 text-green-600',
    },
    {
      type: 'postgres-to-airtable' as SyncType,
      title: 'PostgreSQL to Airtable',
      description: 'Sync data from your PostgreSQL database to Airtable',
      icon: <Database className="h-8 w-8" />,
      iconBg: 'bg-blue-100 text-blue-600',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="flex aspect-square size-14 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <Zap className="size-7" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">Choose Sync Type</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Select the type of data synchronization you want to create
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          {syncTypes.map((syncType) => (
            <Card 
              key={syncType.type}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedType === syncType.type 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedType(syncType.type)}
            >
              <CardHeader className="text-center pb-2">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${syncType.iconBg}`}>
                  {syncType.icon}
                </div>
                <CardTitle className="text-lg">{syncType.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription>{syncType.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedType || isCreating}
          >
            {isCreating ? "Creating..." : "Create Sync"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}