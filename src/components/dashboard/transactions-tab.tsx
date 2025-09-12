'use client';

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Receipt } from 'lucide-react'

export function TransactionsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Transactions
          </h2>
          <p className="text-slate-600 mt-1">Manage your income and expenses</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Placeholder Content */}
      <Card className="p-12 text-center">
        <Receipt className="w-16 h-16 mx-auto text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">
          Transaction Management Coming Soon
        </h3>
        <p className="text-slate-500">
          This section will contain your transaction management interface.
        </p>
      </Card>
    </div>
  )
}