'use client';

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Target } from 'lucide-react'

export function TargetsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Budget Targets
          </h2>
          <p className="text-slate-600 mt-1">Set and track your spending goals</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Target
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card className="p-12 text-center">
        <Target className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">
          Budget Targets Coming Soon
        </h3>
        <p className="text-slate-500">
          This section will contain your budget targets and spending goals.
        </p>
      </Card>
    </div>
  )
}