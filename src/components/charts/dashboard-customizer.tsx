'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Settings, 
  Layout, 
  Palette, 
  BarChart3, 
  PieChart, 
  TrendingUp,
  Save,
  RotateCcw,
  Eye,
  EyeOff
} from 'lucide-react';

export interface DashboardConfig {
  layout: 'grid' | 'list' | 'masonry';
  theme: 'light' | 'dark' | 'auto';
  chartTypes: {
    overview: 'cards' | 'charts' | 'mixed';
    spending: 'pie' | 'bar' | 'donut' | 'treemap';
    trends: 'line' | 'area' | 'bar' | 'combo';
  };
  visibleSections: {
    overview: boolean;
    spending: boolean;
    trends: boolean;
    summary: boolean;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  animations: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // minutes
  exportFormat: 'png' | 'pdf' | 'csv' | 'json';
}

const defaultConfig: DashboardConfig = {
  layout: 'grid',
  theme: 'auto',
  chartTypes: {
    overview: 'mixed',
    spending: 'pie',
    trends: 'line'
  },
  visibleSections: {
    overview: true,
    spending: true,
    trends: true,
    summary: true
  },
  colors: {
    primary: '#8B5CF6',
    secondary: '#06B6D4',
    accent: '#10B981'
  },
  animations: true,
  autoRefresh: false,
  refreshInterval: 5,
  exportFormat: 'png'
};

interface DashboardCustomizerProps {
  config?: DashboardConfig;
  onConfigChange: (config: DashboardConfig) => void;
  onSave?: (config: DashboardConfig) => void;
  children?: React.ReactNode;
}

export function DashboardCustomizer({ 
  config = defaultConfig, 
  onConfigChange, 
  onSave,
  children 
}: DashboardCustomizerProps) {
  const [localConfig, setLocalConfig] = useState<DashboardConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const updateConfig = (updates: Partial<DashboardConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    setHasChanges(true);
    onConfigChange(newConfig);
  };

  const handleSave = () => {
    onSave?.(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(defaultConfig);
    onConfigChange(defaultConfig);
    setHasChanges(true);
  };

  const colorPresets = [
    { name: 'Default', primary: '#8B5CF6', secondary: '#06B6D4', accent: '#10B981' },
    { name: 'Warm', primary: '#F59E0B', secondary: '#EF4444', accent: '#10B981' },
    { name: 'Cool', primary: '#3B82F6', secondary: '#8B5A87', accent: '#06B6D4' },
    { name: 'Monochrome', primary: '#6B7280', secondary: '#9CA3AF', accent: '#4B5563' },
    { name: 'Nature', primary: '#059669', secondary: '#0D9488', accent: '#65A30D' },
    { name: 'Corporate', primary: '#1E40AF', secondary: '#7C2D12', accent: '#BE185D' }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Customize
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5" />
            Dashboard Customization
          </DialogTitle>
          <DialogDescription>
            Personalize your financial dashboard experience
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Layout Section */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-4 h-4 text-primary" />
              <h3 className="text-display font-semibold">Layout & Display</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Layout Style</Label>
                <Select 
                  value={localConfig.layout} 
                  onValueChange={(value) => updateConfig({ layout: value as DashboardConfig['layout'] })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid Layout</SelectItem>
                    <SelectItem value="list">List Layout</SelectItem>
                    <SelectItem value="masonry">Masonry Layout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <Select 
                  value={localConfig.theme} 
                  onValueChange={(value) => updateConfig({ theme: value as DashboardConfig['theme'] })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light Theme</SelectItem>
                    <SelectItem value="dark">Dark Theme</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Chart Types Section */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-primary" />
              <h3 className="text-display font-semibold">Chart Types</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Overview</Label>
                <Select 
                  value={localConfig.chartTypes.overview} 
                  onValueChange={(value) => updateConfig({ 
                    chartTypes: { ...localConfig.chartTypes, overview: value as any } 
                  })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Cards Only</SelectItem>
                    <SelectItem value="charts">Charts Only</SelectItem>
                    <SelectItem value="mixed">Mixed View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Spending</Label>
                <Select 
                  value={localConfig.chartTypes.spending} 
                  onValueChange={(value) => updateConfig({ 
                    chartTypes: { ...localConfig.chartTypes, spending: value as any } 
                  })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="donut">Donut Chart</SelectItem>
                    <SelectItem value="treemap">Tree Map</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Trends</Label>
                <Select 
                  value={localConfig.chartTypes.trends} 
                  onValueChange={(value) => updateConfig({ 
                    chartTypes: { ...localConfig.chartTypes, trends: value as any } 
                  })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="combo">Combo Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Visible Sections */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" />
              <h3 className="text-display font-semibold">Visible Sections</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(localConfig.visibleSections).map(([key, value]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) => updateConfig({
                      visibleSections: {
                        ...localConfig.visibleSections,
                        [key]: checked as boolean
                      }
                    })}
                  />
                  <Label 
                    htmlFor={key}
                    className="text-sm font-medium capitalize cursor-pointer"
                  >
                    {key}
                  </Label>
                </div>
              ))}
            </div>
          </Card>

          {/* Color Customization */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="text-display font-semibold">Color Scheme</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Presets</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {colorPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      className="justify-start p-2"
                      onClick={() => updateConfig({
                        colors: {
                          primary: preset.primary,
                          secondary: preset.secondary,
                          accent: preset.accent
                        }
                      })}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: preset.primary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: preset.secondary }}
                          />
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: preset.accent }}
                          />
                        </div>
                        <span className="text-xs">{preset.name}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Primary</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      value={localConfig.colors.primary}
                      onChange={(e) => updateConfig({
                        colors: { ...localConfig.colors, primary: e.target.value }
                      })}
                      className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localConfig.colors.primary}
                      onChange={(e) => updateConfig({
                        colors: { ...localConfig.colors, primary: e.target.value }
                      })}
                      className="text-xs"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Secondary</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      value={localConfig.colors.secondary}
                      onChange={(e) => updateConfig({
                        colors: { ...localConfig.colors, secondary: e.target.value }
                      })}
                      className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localConfig.colors.secondary}
                      onChange={(e) => updateConfig({
                        colors: { ...localConfig.colors, secondary: e.target.value }
                      })}
                      className="text-xs"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Accent</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type="color"
                      value={localConfig.colors.accent}
                      onChange={(e) => updateConfig({
                        colors: { ...localConfig.colors, accent: e.target.value }
                      })}
                      className="w-12 h-8 p-0 border-0 rounded cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={localConfig.colors.accent}
                      onChange={(e) => updateConfig({
                        colors: { ...localConfig.colors, accent: e.target.value }
                      })}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Behavior Settings */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="text-display font-semibold">Behavior</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="animations"
                  checked={localConfig.animations}
                  onCheckedChange={(checked) => updateConfig({ animations: checked as boolean })}
                />
                <Label htmlFor="animations" className="text-sm font-medium cursor-pointer">
                  Enable Animations
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoRefresh"
                  checked={localConfig.autoRefresh}
                  onCheckedChange={(checked) => updateConfig({ autoRefresh: checked as boolean })}
                />
                <Label htmlFor="autoRefresh" className="text-sm font-medium cursor-pointer">
                  Auto Refresh Data
                </Label>
              </div>
              
              {localConfig.autoRefresh && (
                <div>
                  <Label className="text-sm font-medium">Refresh Interval (minutes)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={localConfig.refreshInterval}
                    onChange={(e) => updateConfig({ refreshInterval: parseInt(e.target.value) || 5 })}
                    className="mt-1 w-24"
                  />
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium">Default Export Format</Label>
                <Select 
                  value={localConfig.exportFormat} 
                  onValueChange={(value) => updateConfig({ exportFormat: value as DashboardConfig['exportFormat'] })}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG Image</SelectItem>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                    <SelectItem value="json">JSON Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-sm text-muted-foreground">
                Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}