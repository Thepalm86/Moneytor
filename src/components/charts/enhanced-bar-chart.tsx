'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, ZoomIn, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ChartDataItem {
  name: string;
  fullName?: string;
  amount: number;
  count?: number;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
  previousAmount?: number;
  metadata?: any;
}

interface EnhancedBarChartProps {
  data: ChartDataItem[];
  title: string;
  subtitle?: string;
  dataKey?: string;
  onBarClick?: (item: ChartDataItem) => void;
  onExport?: () => void;
  showTrends?: boolean;
  interactive?: boolean;
  className?: string;
}

export function EnhancedBarChart({ 
  data, 
  title, 
  subtitle,
  dataKey = 'amount',
  onBarClick, 
  onExport,
  showTrends = false,
  interactive = true,
  className = "" 
}: EnhancedBarChartProps) {
  const [selectedBar, setSelectedBar] = useState<ChartDataItem | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `₪${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `₪${(amount / 1000).toFixed(0)}k`;
    }
    return `₪${amount.toFixed(0)}`;
  };

  // Handle bar click with drill-down capability
  const handleBarClick = (entry: any, index: number) => {
    if (!interactive) return;
    
    const item = data[index];
    setSelectedBar(item);
    onBarClick?.(item);
  };

  // Enhanced tooltip with trend information
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const trendChange = data.previousAmount ? 
        ((data.amount - data.previousAmount) / data.previousAmount * 100) : 0;
      
      return (
        <div className="glass-card p-4 border shadow-lg rounded-lg space-y-3 min-w-[220px]">
          <div className="font-semibold text-display">{data.fullName || data.name}</div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-body-premium text-sm text-muted-foreground">Amount:</span>
              <span className="font-bold">{formatCurrency(data.amount)}</span>
            </div>
            
            {data.count && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">Count:</span>
                <span className="font-medium">{data.count}</span>
              </div>
            )}
            
            {showTrends && data.previousAmount && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">Change:</span>
                <span className={`font-medium flex items-center gap-1 ${
                  trendChange > 0 ? 'text-green-600' : trendChange < 0 ? 'text-red-600' : 'text-muted-foreground'
                }`}>
                  {trendChange > 0 ? '↗' : trendChange < 0 ? '↘' : '→'}
                  {Math.abs(trendChange).toFixed(1)}%
                </span>
              </div>
            )}
            
            {data.count && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">Avg per item:</span>
                <span className="font-medium">{formatCurrency(data.amount / data.count)}</span>
              </div>
            )}
          </div>
          
          {interactive && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              Click for detailed view
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom bar with gradient and animation
  const CustomBar = (props: any) => {
    const { fill, ...rest } = props;
    const isHovered = hoveredIndex === props.index;
    const isSelected = selectedBar?.name === data[props.index]?.name;
    
    return (
      <Bar
        {...rest}
        fill={isSelected ? '#8B5CF6' : isHovered ? '#A855F7' : (data[props.index]?.color || fill)}
        radius={[4, 4, 0, 0]}
        className={`transition-all duration-200 ${interactive ? 'cursor-pointer' : ''} ${
          isHovered ? 'opacity-80' : 'opacity-100'
        }`}
        onMouseEnter={() => interactive && setHoveredIndex(props.index)}
        onMouseLeave={() => interactive && setHoveredIndex(null)}
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
            {interactive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoomLevel(zoomLevel === 1 ? 1.5 : 1)}
                className="text-xs"
              >
                <ZoomIn className="w-4 h-4 mr-1" />
                Zoom {zoomLevel === 1 ? 'In' : 'Out'}
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
                    <BarChart data={data} onClick={handleBarClick}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={formatCurrency}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey={dataKey}
                        radius={[4, 4, 0, 0]}
                        onClick={handleBarClick}
                      >
                        {data.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`}
                            fill={entry.color || '#8B5CF6'}
                            className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 relative overflow-hidden">
          <ResponsiveContainer 
            width={`${zoomLevel * 100}%`} 
            height="100%"
          >
            <BarChart data={data} onClick={handleBarClick}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={data.length > 6 ? -45 : 0}
                textAnchor={data.length > 6 ? 'end' : 'middle'}
                height={data.length > 6 ? 60 : 30}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey}
                onClick={handleBarClick}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={selectedBar?.name === entry.name ? '#8B5CF6' : 
                          hoveredIndex === index ? '#A855F7' : 
                          entry.color || '#8B5CF6'}
                    className={interactive ? 'cursor-pointer hover:opacity-80 transition-all duration-200' : ''}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Bar Details */}
        {selectedBar && interactive && (
          <Card variant="premium" className="p-4 animate-in border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <h5 className="text-display font-semibold">{selectedBar.fullName || selectedBar.name} Analysis</h5>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedBar(null)}
                className="ml-auto text-xs"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-display text-xl font-bold">
                  {formatCurrency(selectedBar.amount)}
                </div>
                <div className="text-body-premium text-xs text-muted-foreground">
                  Total Amount
                </div>
              </div>
              
              {selectedBar.count && (
                <div className="text-center">
                  <div className="text-display text-xl font-bold text-secondary">
                    {selectedBar.count}
                  </div>
                  <div className="text-body-premium text-xs text-muted-foreground">
                    Count
                  </div>
                </div>
              )}
              
              {selectedBar.count && (
                <div className="text-center">
                  <div className="text-display text-xl font-bold text-green-600">
                    {formatCurrency(selectedBar.amount / selectedBar.count)}
                  </div>
                  <div className="text-body-premium text-xs text-muted-foreground">
                    Average
                  </div>
                </div>
              )}
              
              {showTrends && selectedBar.previousAmount && (
                <div className="text-center">
                  <div className={`text-display text-xl font-bold flex items-center justify-center gap-1 ${
                    selectedBar.amount > selectedBar.previousAmount ? 'text-green-600' : 
                    selectedBar.amount < selectedBar.previousAmount ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {selectedBar.amount > selectedBar.previousAmount ? 
                      <TrendingUp className="w-5 h-5" /> : 
                      selectedBar.amount < selectedBar.previousAmount ? '↘' : '→'
                    }
                    {Math.abs(((selectedBar.amount - selectedBar.previousAmount) / selectedBar.previousAmount) * 100).toFixed(1)}%
                  </div>
                  <div className="text-body-premium text-xs text-muted-foreground">
                    Change
                  </div>
                </div>
              )}
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
              Categories
            </div>
          </div>
          
          <div>
            <div className="text-display text-lg font-bold text-secondary">
              {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0))}
            </div>
            <div className="text-body-premium text-xs text-muted-foreground">
              Total Amount
            </div>
          </div>
          
          <div>
            <div className="text-display text-lg font-bold text-green-600">
              {formatCurrency(data.reduce((sum, item) => sum + item.amount, 0) / data.length)}
            </div>
            <div className="text-body-premium text-xs text-muted-foreground">
              Average
            </div>
          </div>
          
          <div>
            <div className="text-display text-lg font-bold text-yellow-600">
              {Math.max(...data.map(item => item.amount)) > 0 ? 
                formatCurrency(Math.max(...data.map(item => item.amount))) : '₪0'
              }
            </div>
            <div className="text-body-premium text-xs text-muted-foreground">
              Highest
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}