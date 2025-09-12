'use client'

import { useState } from 'react'
import { DashboardLayout, PageWrapper, ContentArea } from '@/components/layout'
import { TargetsTab } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TargetsPage() {
  const [showAddTarget, setShowAddTarget] = useState(false)

  return (
    <DashboardLayout>
      <PageWrapper 
        title="Budget Targets"
        description="Set and track your spending goals"
        actions={
          <Button 
            size="sm"
            onClick={() => setShowAddTarget(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Target
          </Button>
        }
      >
        <ContentArea>
          <TargetsTab 
            showAddTargetForm={showAddTarget}
            onCloseForm={() => setShowAddTarget(false)}
          />
        </ContentArea>
      </PageWrapper>
    </DashboardLayout>
  )
}