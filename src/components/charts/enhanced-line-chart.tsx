'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine, ReferenceArea } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, ZoomIn, Target, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ChartDataItem {
  name: string;
  date?: string;
  value: number;
  target?: number;
  previous?: number;
  trend?: number;
  metadata?: any;
}

interface EnhancedLineChartProps {
  data: ChartDataItem[];
  title: string;
  subtitle?: string;
  dataKey?: string;
  targetKey?: string;
  onPointClick?: (item: ChartDataItem, index: number) => void;
  onExport?: () => void;
  showBrush?: boolean;
  showTarget?: boolean;
  showTrendline?: boolean;
  className?: string;
}

export function EnhancedLineChart({ 
  data, 
  title, 
  subtitle,
  dataKey = 'value',
  targetKey = 'target',
  onPointClick, 
  onExport,
  showBrush = false,
  showTarget = false,
  showTrendline = false,
  className = "" 
}: EnhancedLineChartProps) {
  const [selectedPoint, setSelectedPoint] = useState<{ item: ChartDataItem; index: number } | null>(null);
  const [brushRange, setBrushRange] = useState<[number, number] | null>(null);
  const [referenceArea, setReferenceArea] = useState<{ x1: string; x2: string } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M₪`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k₪`;
    }
    return `${amount.toFixed(0)}₪`;
  };

  // Calculate trend line data
  const calculateTrendline = (data: ChartDataItem[]) => {
    if (data.length < 2) return null;
    
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, item) => sum + item.value, 0);
    const sumXY = data.reduce((sum, item, i) => sum + i * item.value, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return data.map((item, i) => ({
      ...item,
      trend: slope * i + intercept
    }));
  };

  const trendlineData = showTrendline ? calculateTrendline(data) : null;

  // Handle point click with drill-down capability
  const handlePointClick = (entry: any, index: number) => {
    const item = data[index];
    setSelectedPoint({ item, index });
    onPointClick?.(item, index);
  };

  // Handle brush change for zooming
  const handleBrushChange = (brushData: any) => {
    if (brushData && brushData.startIndex !== undefined && brushData.endIndex !== undefined) {
      setBrushRange([brushData.startIndex, brushData.endIndex]);
    }
  };

  // Enhanced tooltip with trend information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const mainData = payload.find((p: any) => p.dataKey === dataKey);
      const targetData = payload.find((p: any) => p.dataKey === targetKey);
      const trendData = payload.find((p: any) => p.dataKey === 'trend');
      
      return (
        <div className="glass-card p-4 border shadow-lg rounded-lg space-y-3 min-w-[220px]">
          <div className="font-semibold text-display">{label}</div>
          
          <div className="space-y-2">
            {mainData && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">Value:</span>
                <span className="font-bold">{formatCurrency(mainData.value)}</span>
              </div>
            )}
            
            {targetData && showTarget && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">Target:</span>
                <span className="font-medium text-green-600">{formatCurrency(targetData.value)}</span>
              </div>
            )}
            
            {trendData && showTrendline && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">Trend:</span>
                <span className="font-medium text-blue-600">{formatCurrency(trendData.value)}</span>
              </div>
            )}
            
            {mainData && targetData && showTarget && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">vs Target:</span>
                <span className={`font-medium ${
                  mainData.value >= targetData.value ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mainData.value >= targetData.value ? '+' : '-'}
                  {Math.abs(((mainData.value - targetData.value) / targetData.value * 100)).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
          
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Click point for detailed analysis
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom dot with enhanced styling
  const CustomDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    const isSelected = selectedPoint?.index === index;
    const isAboveTarget = showTarget && payload[targetKey] && payload[dataKey] >= payload[targetKey];
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 6 : 4}
        fill={isSelected ? '#8B5CF6' : isAboveTarget ? '#10B981' : '#EF4444'}
        stroke="#fff"
        strokeWidth={isSelected ? 3 : 2}
        className="cursor-pointer hover:r-6 transition-all duration-200"
        onClick={() => handlePointClick(payload, index)}
      />
    );
  };

  return (
    <Card variant="glass" className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-display text-base font-semibold">{title}</h4>
            {subtitle && (
              <p className="text-body-premium text-sm text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {brushRange && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBrushRange(null);
                  setReferenceArea(null);
                }}
                className="text-xs"
              >
                Reset Zoom
              </Button>
            )}
            
            {onExport && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="text-xs"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Expand
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl">
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendlineData || data}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatCurrency}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      <Line 
                        type="monotone" 
                        dataKey={dataKey}
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={<CustomDot />}
                        activeDot={{ r: 6, fill: '#8B5CF6' }}
                      />
                      
                      {showTarget && (
                        <Line 
                          type="monotone" 
                          dataKey={targetKey}
                          stroke="#10B981" 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Target"
                        />
                      )}
                      
                      {showTrendline && trendlineData && (
                        <Line 
                          type="monotone" 
                          dataKey="trend"
                          stroke="#06B6D4" 
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={false}
                          name="Trend"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={trendlineData || data}
              onMouseDown={() => setIsSelecting(true)}
              onMouseUp={() => setIsSelecting(false)}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={brushRange ? [brushRange[0], brushRange[1]] : ['dataMin', 'dataMax']}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Reference area for selection */}
              {referenceArea && (
                <ReferenceArea 
                  x1={referenceArea.x1} 
                  x2={referenceArea.x2} 
                  strokeOpacity={0.3} 
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey={dataKey}
                stroke="#8B5CF6" 
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, fill: '#8B5CF6' }}
              />
              
              {showTarget && (
                <Line 
                  type="monotone" 
                  dataKey={targetKey}
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              )}
              
              {showTrendline && trendlineData && (
                <Line 
                  type="monotone" 
                  dataKey="trend"
                  stroke="#06B6D4" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Trend"
                />
              )}
              
              {showBrush && (
                <Brush 
                  dataKey="name" 
                  height={30} 
                  stroke="#8B5CF6"
                  onChange={handleBrushChange}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Point Details */}
        {selectedPoint && (
          <Card variant="premium" className="p-4 animate-in border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <h5 className="text-display font-semibold">{selectedPoint.item.name} Analysis</h5>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPoint(null)}
                className="ml-auto text-xs"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-display text-xl font-bold">
                  {formatCurrency(selectedPoint.item.value)}
                </div>
                <div className="text-body-premium text-xs text-muted-foreground">
                  Value
                </div>
              </div>
              
              {selectedPoint.item.target && showTarget && (
                <div className="text-center">
                  <div className="text-display text-xl font-bold text-green-600">
                    {formatCurrency(selectedPoint.item.target)}
                  </div>
                  <div className="text-body-premium text-xs text-muted-foreground">
                    Target
                  </div>
                </div>
              )}
              
              {selectedPoint.item.previous && (
                <div className="text-center">
                  <div className={`text-display text-xl font-bold flex items-center justify-center gap-1 ${
                    selectedPoint.item.value > selectedPoint.item.previous ? 'text-green-600' : 
                    selectedPoint.item.value < selectedPoint.item.previous ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {selectedPoint.item.value > selectedPoint.item.previous ? 
                      <TrendingUp className="w-5 h-5" /> : 
                      selectedPoint.item.value < selectedPoint.item.previous ? '↘' : '→'
                    }
                    {Math.abs(((selectedPoint.item.value - selectedPoint.item.previous) / selectedPoint.item.previous) * 100).toFixed(1)}%
                  </div>
                  <div className="text-body-premium text-xs text-muted-foreground">
                    Change
                  </div>
                </div>
              )}
              
              <div className="text-center">
                <div className="text-display text-xl font-bold text-secondary">
                  #{selectedPoint.index + 1}
                </div>
                <div className="text-body-premium text-xs text-muted-foreground">
                  Position
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-display text-lg font-bold text-primary">
              {data.length}
            </div>
            <div className="text-body-premium text-xs text-muted-foreground">
              Data Points
            </div>
          </div>
          
          <div>
            <div className="text-display text-lg font-bold text-secondary">
              {formatCurrency(data.reduce((sum, item) => sum + item.value, 0) / data.length)}
            </div>
            <div className="text-body-premium text-xs text-muted-foreground">
              Average
            </div>
          </div>
          
          <div>
            <div className="text-display text-lg font-bold text-green-600">
              {Math.max(...data.map(item => item.value)) > 0 ? 
                formatCurrency(Math.max(...data.map(item => item.value))) : '0₪'
              }
            </div>
            <div className="text-body-premium text-xs text-muted-foreground">
              Peak
            </div>
          </div>
          
          <div>
            <div className="text-display text-lg font-bold text-red-600">
              {Math.min(...data.map(item => item.value)) < Infinity ? 
                formatCurrency(Math.min(...data.map(item => item.value))) : '0₪'
              }
            </div>
            <div className="text-body-premium text-xs text-muted-foreground">
              Low
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}