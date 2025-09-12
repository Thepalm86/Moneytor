'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Download, 
  FileImage, 
  FileText, 
  Database, 
  FileJson, 
  Loader2,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';

interface ExportFormat {
  id: 'png' | 'pdf' | 'csv' | 'json';
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: 'png',
    name: 'PNG Image',
    description: 'High-quality chart image for presentations',
    icon: FileImage,
    color: 'text-blue-600'
  },
  {
    id: 'pdf',
    name: 'PDF Report',
    description: 'Complete report with chart and data table',
    icon: FileText,
    color: 'text-red-600'
  },
  {
    id: 'csv',
    name: 'CSV Data',
    description: 'Spreadsheet-compatible data format',
    icon: Database,
    color: 'text-green-600'
  },
  {
    id: 'json',
    name: 'JSON Data',
    description: 'Structured data for developers',
    icon: FileJson,
    color: 'text-purple-600'
  }
];

interface ExportDialogProps {
  onExport: (format: 'png' | 'pdf' | 'csv' | 'json') => Promise<void>;
  isExporting?: boolean;
  children?: React.ReactNode;
}

export function ExportDialog({ onExport, isExporting = false, children }: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat | null>(null);
  const [exportStatus, setExportStatus] = useState<{
    status: 'idle' | 'exporting' | 'success' | 'error';
    message?: string;
  }>({ status: 'idle' });

  const handleExport = async (format: ExportFormat) => {
    setSelectedFormat(format);
    setExportStatus({ status: 'exporting' });

    try {
      await onExport(format.id);
      setExportStatus({ 
        status: 'success', 
        message: `${format.name} exported successfully!` 
      });
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setExportStatus({ status: 'idle' });
        setSelectedFormat(null);
      }, 3000);
    } catch (error) {
      setExportStatus({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Export failed' 
      });
      
      // Reset status after 5 seconds
      setTimeout(() => {
        setExportStatus({ status: 'idle' });
        setSelectedFormat(null);
      }, 5000);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Chart
          </DialogTitle>
          <DialogDescription>
            Choose your preferred export format
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {exportStatus.status === 'idle' && (
            <div className="grid grid-cols-1 gap-3">
              {exportFormats.map((format) => {
                const IconComponent = format.icon;
                return (
                  <Card
                    key={format.id}
                    className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                      selectedFormat?.id === format.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleExport(format)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center`}>
                        <IconComponent className={`w-5 h-5 ${format.color}`} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium text-display">
                          {format.name}
                        </div>
                        <div className="text-sm text-body-premium text-muted-foreground">
                          {format.description}
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="opacity-60">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          
          {exportStatus.status === 'exporting' && selectedFormat && (
            <Card className="p-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <div>
                  <h3 className="text-display font-semibold mb-2">
                    Exporting {selectedFormat.name}
                  </h3>
                  <p className="text-body-premium text-sm text-muted-foreground">
                    Please wait while we prepare your export...
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {exportStatus.status === 'success' && (
            <Card className="p-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-display font-semibold mb-2 text-green-800 dark:text-green-400">
                    Export Successful!
                  </h3>
                  <p className="text-body-premium text-sm text-green-700 dark:text-green-300">
                    {exportStatus.message}
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {exportStatus.status === 'error' && (
            <Card className="p-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-display font-semibold mb-2 text-red-800 dark:text-red-400">
                    Export Failed
                  </h3>
                  <p className="text-body-premium text-sm text-red-700 dark:text-red-300">
                    {exportStatus.message}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setExportStatus({ status: 'idle' });
                      setSelectedFormat(null);
                    }}
                    className="mt-3"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
        
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Exports include chart visualization and metadata
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}