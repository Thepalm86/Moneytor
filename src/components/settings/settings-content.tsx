'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { SettingsNavigation } from './settings-navigation'
import { ProfileSettings } from './profile-settings'
import { FinancialSettings } from './financial-settings'
import { PrivacySettings } from './privacy-settings'
import { SecuritySettings } from './security-settings'
import { NotificationSettings } from './notification-settings'
import { AppearanceSettings } from './appearance-settings'
import { DataSettings } from './data-settings'

export type SettingsTab = 
  | 'profile' 
  | 'financial' 
  | 'privacy' 
  | 'security' 
  | 'notifications' 
  | 'appearance' 
  | 'data'

export function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')

  const renderSettingsPanel = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />
      case 'financial':
        return <FinancialSettings />
      case 'privacy':
        return <PrivacySettings />
      case 'security':
        return <SecuritySettings />
      case 'notifications':
        return <NotificationSettings />
      case 'appearance':
        return <AppearanceSettings />
      case 'data':
        return <DataSettings />
      default:
        return <ProfileSettings />
    }
  }

  return (
    <div className="space-y-4 pt-4 pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card variant="glass" className="sticky top-4">
            <SettingsNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </Card>
        </div>
        
        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="animate-in" style={{ animationDelay: '200ms' }}>
            {renderSettingsPanel()}
          </div>
        </div>
      </div>
    </div>
  )
}