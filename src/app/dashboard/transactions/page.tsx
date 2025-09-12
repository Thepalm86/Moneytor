'use client'

import { useState } from 'react'
import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { TransactionsTab } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TransactionsPage() {
  const [showAddTransaction, setShowAddTransaction] = useState(false)

  return (
    <DashboardLayout>
      <PageWrapper 
        title="Transactions"
        description="Manage your income and expenses"
        actions={
          <Button 
            size="sm"
            onClick={() => setShowAddTransaction(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        }
      >
        <ContentArea>
          <TransactionsTab 
            showAddTransactionForm={showAddTransaction}
            onCloseForm={() => setShowAddTransaction(false)}
          />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}