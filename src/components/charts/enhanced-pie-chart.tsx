'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Maximize2, Filter, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ChartDataItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
  count?: number;
  transactions?: any[];
}

interface EnhancedPieChartProps {
  data: ChartDataItem[];
  title: string;
  subtitle?: string;
  onSegmentClick?: (item: ChartDataItem) => void;
  onExport?: () => void;
  className?: string;
}

export function EnhancedPieChart({ 
  data, 
  title, 
  subtitle, 
  onSegmentClick, 
  onExport,
  className = "" 
}: EnhancedPieChartProps) {
  const [selectedSegment, setSelectedSegment] = useState<ChartDataItem | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Handle segment click with drill-down capability
  const handleSegmentClick = (entry: ChartDataItem) => {
    setSelectedSegment(entry);
    onSegmentClick?.(entry);
  };

  // Enhanced tooltip with more details
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-4 border shadow-lg rounded-lg space-y-2 min-w-[200px]">
          <div className="font-semibold text-display">{data.name}</div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-body-premium text-sm text-muted-foreground">Amount:</span>
              <span className="font-medium">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-body-premium text-sm text-muted-foreground">Percentage:</span>
              <span className="font-medium">{formatPercentage(data.percentage)}</span>
            </div>
            {data.count && (
              <div className="flex justify-between items-center">
                <span className="text-body-premium text-sm text-muted-foreground">Transactions:</span>
                <span className="font-medium">{data.count}</span>
              </div>
            )}
          </div>
          <div className="text-xs text-muted-foreground pt-2 border-t">
            Click to view details
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label with enhanced styling
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage, name }: any) => {
    if (percentage < 5) return null; // Don't show labels for small segments
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="500"
        className="drop-shadow-sm"
      >
        {`${percentage.toFixed(1)}%`}
      </text>
    );
  };

  // Legend with interactive capabilities
  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div 
            key={index}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 hover:glass-card ${
              hoveredSegment === entry.value ? 'glass-card' : 'hover:bg-muted/30'
            }`}
            onMouseEnter={() => setHoveredSegment(entry.value)}
            onMouseLeave={() => setHoveredSegment(null)}
            onClick={() => {
              const item = data.find(d => d.name === entry.value);
              if (item) handleSegmentClick(item);
            }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-display">{entry.value}</span>
          </div>
        ))}
      </div>
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
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        onClick={handleSegmentClick}
                        className="cursor-pointer"
                      >
                        {data.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            stroke={hoveredSegment === entry.name ? "#fff" : "none"}
                            strokeWidth={hoveredSegment === entry.name ? 2 : 0}
                            className="hover:opacity-80 transition-opacity cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Chart */}
        <div className="h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={handleSegmentClick}
                className="cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke={hoveredSegment === entry.name ? "#fff" : "none"}
                    strokeWidth={hoveredSegment === entry.name ? 2 : 0}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Selected Segment Details */}
        {selectedSegment && (
          <Card variant="premium" className="p-4 animate-in border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: selectedSegment.color }}
              />
              <h5 className="text-display font-semibold">{selectedSegment.name} Details</h5>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedSegment(null)}
                className="ml-auto text-xs"
              >
                ✕
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-display text-lg font-bold">
                  {formatCurrency(selectedSegment.value)}
                </div>
                <div className="text-body-premium text-xs text-muted-foreground">
                  Amount
                </div>
              </div>
              
              <div>
                <div className="text-display text-lg font-bold text-primary">
                  {formatPercentage(selectedSegment.percentage)}
                </div>
                <div className="text-body-premium text-xs text-muted-foreground">
                  Of Total
                </div>
              </div>
              
              {selectedSegment.count && (
                <>
                  <div>
                    <div className="text-display text-lg font-bold text-secondary">
                      {selectedSegment.count}
                    </div>
                    <div className="text-body-premium text-xs text-muted-foreground">
                      Transactions
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-display text-lg font-bold text-green-600">
                      {formatCurrency(selectedSegment.value / selectedSegment.count)}
                    </div>
                    <div className="text-body-premium text-xs text-muted-foreground">
                      Avg/Transaction
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </Card>
  );
}