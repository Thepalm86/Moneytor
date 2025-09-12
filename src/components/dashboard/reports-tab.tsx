'use client';

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Download } from 'lucide-react'

export function ReportsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Reports & Analytics
          </h2>
          <p className="text-slate-600 mt-1">Detailed financial analysis and insights</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card className="p-12 text-center">
        <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">
          Reports & Analytics Coming Soon
        </h3>
        <p className="text-slate-500">
          This section will contain detailed financial reports and analytics.
        </p>
      </Card>
    </div>
  )
}